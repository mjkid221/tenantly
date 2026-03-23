import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, propertyTenants } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    let isActiveTenant = false;
    if (ctx.role !== "admin") {
      const tenancy = await ctx.db.query.propertyTenants.findFirst({
        where: and(
          eq(propertyTenants.userId, ctx.user.id),
          eq(propertyTenants.isActive, true),
        ),
      });
      isActiveTenant = !!tenancy;
    }

    return {
      ...ctx.user,
      role: ctx.role,
      isActiveTenant,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1).max(256).optional(),
        avatarUrl: z.string().url().max(1024).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updated;
    }),
});
