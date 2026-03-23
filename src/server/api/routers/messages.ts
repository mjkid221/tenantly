import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, tenantProcedure } from "~/server/api/trpc";
import {
  conversations,
  conversationParticipants,
  messages,
  messageReadStatus,
  users,
  propertyTenants,
  properties,
} from "~/server/db/schema";

/**
 * Verify that non-admin users have at least one active property tenancy.
 * This prevents random logged-in users (who default to "tenant" role)
 * from accessing messaging.
 */
async function ensureActiveTenancy(ctx: {
  role: "admin" | "tenant";
  user: { id: number };
  db: Parameters<Parameters<typeof tenantProcedure.query>[0]>[0]["ctx"]["db"];
}) {
  if (ctx.role === "admin") return;
  const activeTenancy = await ctx.db.query.propertyTenants.findFirst({
    where: and(
      eq(propertyTenants.userId, ctx.user.id),
      eq(propertyTenants.isActive, true),
    ),
  });
  if (!activeTenancy) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an active tenant to use messaging",
    });
  }
}

export const messagesRouter = createTRPCRouter({
  listConversations: tenantProcedure.query(async ({ ctx }) => {
    await ensureActiveTenancy(ctx);
    // Get all conversations this user participates in
    const participations = await ctx.db.query.conversationParticipants.findMany(
      {
        where: eq(conversationParticipants.userId, ctx.user.id),
        with: {
          conversation: {
            with: {
              participants: { with: { user: true } },
              messages: {
                orderBy: (m, { desc: d }) => [d(m.createdAt)],
                limit: 1,
                with: { sender: true },
              },
            },
          },
        },
      },
    );

    // For each conversation, get unread count
    const result = await Promise.all(
      participations.map(async (p) => {
        const conv = p.conversation;
        const lastMessage = conv.messages[0] ?? null;

        // Count messages not read by this user and not sent by this user
        const unreadResult = lastMessage
          ? await ctx.db
              .select({ count: sql<number>`count(*)` })
              .from(messages)
              .where(
                and(
                  eq(messages.conversationId, conv.id),
                  sql`${messages.senderId} != ${ctx.user.id}`,
                  sql`${messages.id} NOT IN (
                    SELECT ${messageReadStatus.messageId} FROM ${messageReadStatus}
                    WHERE ${messageReadStatus.userId} = ${ctx.user.id}
                  )`,
                ),
              )
          : [{ count: 0 }];

        const otherParticipant = conv.participants.find(
          (pt) => pt.userId !== ctx.user.id,
        );

        // Get property info for the other user (if they are a tenant)
        let propertyName: string | null = null;
        if (otherParticipant?.userId) {
          const tenancy = await ctx.db
            .select({ name: properties.name })
            .from(propertyTenants)
            .innerJoin(
              properties,
              eq(propertyTenants.propertyId, properties.id),
            )
            .where(
              and(
                eq(propertyTenants.userId, otherParticipant.userId),
                eq(propertyTenants.isActive, true),
              ),
            )
            .limit(1);
          propertyName = tenancy[0]?.name ?? null;
        }

        return {
          id: conv.id,
          otherUser: otherParticipant?.user ?? null,
          propertyName,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderName:
                  lastMessage.sender.fullName ?? lastMessage.sender.email,
                isOwn: lastMessage.senderId === ctx.user.id,
              }
            : null,
          unreadCount: Number(unreadResult[0]?.count ?? 0),
          updatedAt: conv.updatedAt,
        };
      }),
    );

    // Sort by most recent message
    return result.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? a.updatedAt;
      const bTime = b.lastMessage?.createdAt ?? b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }),

  getOrCreateConversation: tenantProcedure
    .input(z.object({ targetUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.targetUserId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create a conversation with yourself",
        });
      }

      await ensureActiveTenancy(ctx);

      // Find existing DM between these two users
      const myConversations =
        await ctx.db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.userId, ctx.user.id),
        });

      for (const p of myConversations) {
        const otherParticipant =
          await ctx.db.query.conversationParticipants.findFirst({
            where: and(
              eq(conversationParticipants.conversationId, p.conversationId),
              eq(conversationParticipants.userId, input.targetUserId),
            ),
          });
        if (otherParticipant) {
          return { conversationId: p.conversationId };
        }
      }

      // Create new conversation
      const [conv] = await ctx.db.insert(conversations).values({}).returning();

      await ctx.db.insert(conversationParticipants).values([
        { conversationId: conv!.id, userId: ctx.user.id },
        { conversationId: conv!.id, userId: input.targetUserId },
      ]);

      return { conversationId: conv!.id };
    }),

  listMessages: tenantProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ensureActiveTenancy(ctx);

      // Verify user is a participant
      const participant = await ctx.db.query.conversationParticipants.findFirst(
        {
          where: and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, ctx.user.id),
          ),
        },
      );

      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const where = input.cursor
        ? and(
            eq(messages.conversationId, input.conversationId),
            sql`${messages.id} < ${input.cursor}`,
          )
        : eq(messages.conversationId, input.conversationId);

      const msgs = await ctx.db.query.messages.findMany({
        where,
        with: { sender: true },
        orderBy: (m, { desc: d }) => [d(m.createdAt)],
        limit: input.limit + 1,
      });

      const hasMore = msgs.length > input.limit;
      const items = hasMore ? msgs.slice(0, input.limit) : msgs;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),

  sendMessage: tenantProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureActiveTenancy(ctx);

      // Verify user is a participant
      const participant = await ctx.db.query.conversationParticipants.findFirst(
        {
          where: and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, ctx.user.id),
          ),
        },
      );

      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [message] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
        })
        .returning();

      // Update conversation timestamp
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return message;
    }),

  markAsRead: tenantProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ensureActiveTenancy(ctx);

      // Get all unread messages in this conversation not sent by me
      const unreadMessages = await ctx.db
        .select({ id: messages.id })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            sql`${messages.senderId} != ${ctx.user.id}`,
            sql`${messages.id} NOT IN (
              SELECT ${messageReadStatus.messageId} FROM ${messageReadStatus}
              WHERE ${messageReadStatus.userId} = ${ctx.user.id}
            )`,
          ),
        );

      if (unreadMessages.length > 0) {
        await ctx.db.insert(messageReadStatus).values(
          unreadMessages.map((m) => ({
            messageId: m.id,
            userId: ctx.user.id,
          })),
        );
      }

      return { markedCount: unreadMessages.length };
    }),

  // Get users available to message
  listMessageableUsers: tenantProcedure.query(async ({ ctx }) => {
    await ensureActiveTenancy(ctx);

    let userList: Array<typeof users.$inferSelect>;

    if (ctx.role === "admin") {
      // Only show users who are active tenants in a property
      const activeTenantIds = await ctx.db
        .selectDistinct({ userId: propertyTenants.userId })
        .from(propertyTenants)
        .where(eq(propertyTenants.isActive, true));

      const ids = activeTenantIds
        .map((t) => t.userId)
        .filter(Boolean) as number[];
      if (ids.length === 0) return [];

      userList = await ctx.db.query.users.findMany({
        where: and(sql`${users.id} != ${ctx.user.id}`, inArray(users.id, ids)),
        orderBy: (u, { asc }) => [asc(u.fullName)],
      });
    } else {
      // Tenants can message admins
      const adminList = await ctx.db.query.admins.findMany();
      const adminEmails = adminList.map((a) => a.email);

      if (adminEmails.length === 0) return [];

      userList = await ctx.db.query.users.findMany({
        where: and(
          sql`${users.id} != ${ctx.user.id}`,
          inArray(users.email, adminEmails),
        ),
        orderBy: (u, { asc }) => [asc(u.fullName)],
      });
    }

    // Attach property info for each user
    const result = await Promise.all(
      userList.map(async (user) => {
        const tenancy = await ctx.db
          .select({ name: properties.name })
          .from(propertyTenants)
          .innerJoin(properties, eq(propertyTenants.propertyId, properties.id))
          .where(
            and(
              eq(propertyTenants.userId, user.id),
              eq(propertyTenants.isActive, true),
            ),
          )
          .limit(1);

        return {
          ...user,
          propertyName: tenancy[0]?.name ?? null,
        };
      }),
    );

    return result;
  }),
});
