import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.user,
      role: ctx.role,
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
