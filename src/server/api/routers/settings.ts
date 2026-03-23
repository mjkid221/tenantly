import { z } from "zod";
import { eq, asc } from "drizzle-orm";

import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { paymentMethods } from "~/server/db/schema";

export const settingsRouter = createTRPCRouter({
  // Anyone logged in can view payment methods (shown on invoices)
  listPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.paymentMethods.findMany({
      where: eq(paymentMethods.isActive, true),
      orderBy: [asc(paymentMethods.sortOrder), asc(paymentMethods.createdAt)],
    });
  }),

  // Admin: list all (including inactive)
  listAllPaymentMethods: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.paymentMethods.findMany({
      orderBy: [asc(paymentMethods.sortOrder), asc(paymentMethods.createdAt)],
    });
  }),

  createPaymentMethod: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        details: z.string().min(1).max(2000),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [method] = await ctx.db
        .insert(paymentMethods)
        .values(input)
        .returning();
      return method;
    }),

  updatePaymentMethod: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(256).optional(),
        details: z.string().min(1).max(2000).optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(paymentMethods)
        .set(data)
        .where(eq(paymentMethods.id, id))
        .returning();
      return updated;
    }),

  deletePaymentMethod: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(paymentMethods)
        .where(eq(paymentMethods.id, input.id));
      return { success: true };
    }),
});
