import { z } from "zod";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { admins, guestAccessCodes } from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
  // Admin management
  listAdmins: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.admins.findMany({
      with: { addedBy: true },
      orderBy: (a, { asc }) => [asc(a.email)],
    });
  }),

  addAdmin: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.admins.findFirst({
        where: eq(admins.email, input.email.toLowerCase()),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already an admin",
        });
      }

      const [admin] = await ctx.db
        .insert(admins)
        .values({
          email: input.email.toLowerCase(),
          addedByUserId: ctx.user.id,
        })
        .returning();

      return admin;
    }),

  removeAdmin: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.query.admins.findFirst({
        where: eq(admins.id, input.id),
      });

      if (!admin) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (admin.email === ctx.user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove yourself as admin",
        });
      }

      await ctx.db.delete(admins).where(eq(admins.id, input.id));
      return { success: true };
    }),

  // Guest code management
  listGuestCodes: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.guestAccessCodes.findMany({
      with: { property: true, createdBy: true },
      orderBy: (gc, { desc }) => [desc(gc.createdAt)],
    });
  }),

  createGuestCode: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        label: z.string().max(256).optional(),
        expiresAt: z.string().datetime().optional(),
        allowedSections: z
          .array(z.string())
          .default(["property_details"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const code = nanoid(12);

      const [guestCode] = await ctx.db
        .insert(guestAccessCodes)
        .values({
          propertyId: input.propertyId,
          code,
          label: input.label,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          allowedSections: input.allowedSections,
          createdByUserId: ctx.user.id,
        })
        .returning();

      return guestCode;
    }),

  updateGuestCode: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isEnabled: z.boolean().optional(),
        label: z.string().max(256).nullable().optional(),
        expiresAt: z.string().datetime().nullable().optional(),
        allowedSections: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, expiresAt, ...rest } = input;
      const [updated] = await ctx.db
        .update(guestAccessCodes)
        .set({
          ...rest,
          ...(expiresAt !== undefined
            ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
            : {}),
        })
        .where(eq(guestAccessCodes.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  deleteGuestCode: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.guestAccessCodes.findFirst({
        where: eq(guestAccessCodes.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .delete(guestAccessCodes)
        .where(eq(guestAccessCodes.id, input.id));

      return { success: true };
    }),
});
