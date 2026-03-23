import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  payments,
  invoiceLineItems,
  invoices,
  propertyTenants,
} from "~/server/db/schema";

export const paymentsRouter = createTRPCRouter({
  listByInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, invoice.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const lineItems = await ctx.db.query.invoiceLineItems.findMany({
        where: eq(invoiceLineItems.invoiceId, input.invoiceId),
        with: { category: true, payments: true },
      });

      return lineItems;
    }),

  markPaid: adminProcedure
    .input(
      z.object({
        invoiceLineItemId: z.number(),
        amount: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const lineItem = await tx.query.invoiceLineItems.findFirst({
          where: eq(invoiceLineItems.id, input.invoiceLineItemId),
        });

        if (!lineItem) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const [payment] = await tx
          .insert(payments)
          .values({
            invoiceLineItemId: input.invoiceLineItemId,
            amount: input.amount,
            status: "confirmed",
            paidAt: new Date(),
            confirmedAt: new Date(),
            confirmedByUserId: ctx.user.id,
            notes: input.notes,
          })
          .returning();

        // Auto-update invoice status based on line item payment state
        const allLineItems = await tx.query.invoiceLineItems.findMany({
          where: eq(invoiceLineItems.invoiceId, lineItem.invoiceId),
          with: { payments: true },
        });

        const allPaid = allLineItems.every((li) => {
          const confirmedTotal = li.payments
            .filter((p) => p.status === "confirmed")
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
          return confirmedTotal >= parseFloat(li.tenantChargeAmount);
        });

        const anyPaid = allLineItems.some((li) => {
          const confirmedTotal = li.payments
            .filter((p) => p.status === "confirmed")
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
          return confirmedTotal > 0;
        });

        if (allPaid) {
          await tx
            .update(invoices)
            .set({ status: "paid" })
            .where(eq(invoices.id, lineItem.invoiceId));
        } else if (anyPaid) {
          await tx
            .update(invoices)
            .set({ status: "partially_paid" })
            .where(eq(invoices.id, lineItem.invoiceId));
        }

        return payment;
      });
    }),

  rejectPayment: adminProcedure
    .input(
      z.object({
        paymentId: z.number(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(payments)
        .set({
          status: "rejected",
          notes: input.notes,
        })
        .where(eq(payments.id, input.paymentId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  getStatus: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
        with: {
          lineItems: {
            with: { category: true, payments: true },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, invoice.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const totalCharged = invoice.lineItems.reduce(
        (sum, li) => sum + parseFloat(li.tenantChargeAmount),
        0,
      );

      const totalPaid = invoice.lineItems.reduce(
        (sum, li) =>
          sum +
          li.payments
            .filter((p) => p.status === "confirmed")
            .reduce((pSum, p) => pSum + parseFloat(p.amount), 0),
        0,
      );

      const lineItemStatuses = invoice.lineItems.map((li) => {
        const confirmedPayments = li.payments.filter(
          (p) => p.status === "confirmed",
        );
        const paidAmount = confirmedPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount),
          0,
        );
        const chargeAmount = parseFloat(li.tenantChargeAmount);

        return {
          lineItemId: li.id,
          categoryName: li.category.name,
          chargeAmount,
          paidAmount,
          isPaid: paidAmount >= chargeAmount,
        };
      });

      return {
        invoiceId: invoice.id,
        status: invoice.status,
        totalCharged,
        totalPaid,
        outstanding: totalCharged - totalPaid,
        lineItemStatuses,
      };
    }),
});
