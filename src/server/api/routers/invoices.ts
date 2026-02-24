import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  invoices,
  invoiceLineItems,
  invoiceCategories,
  invoiceAttachments,
  propertyTenants,
} from "~/server/db/schema";
import { supabaseAdmin } from "~/lib/supabase/admin";
import { resend } from "~/lib/resend";
import { buildInvoiceEmailHtml } from "~/server/api/email-templates/invoice-email";

export const invoicesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          propertyId: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.role === "admin") {
        return ctx.db.query.invoices.findMany({
          where: input?.propertyId
            ? eq(invoices.propertyId, input.propertyId)
            : undefined,
          with: {
            property: true,
            tenant: { with: { user: true } },
            lineItems: { with: { category: true, payments: true } },
          },
          orderBy: (i, { desc }) => [desc(i.billingPeriodStart)],
        });
      }

      // Tenant: only assigned properties
      const assignments = await ctx.db.query.propertyTenants.findMany({
        where: and(
          eq(propertyTenants.userId, ctx.user.id),
          eq(propertyTenants.isActive, true),
        ),
      });

      if (assignments.length === 0) return [];

      const propertyIds = assignments.map((a) => a.propertyId);
      const assignmentIds = assignments.map((a) => a.id);

      const all = await ctx.db.query.invoices.findMany({
        with: {
          property: true,
          tenant: { with: { user: true } },
          lineItems: { with: { category: true, payments: true } },
        },
        orderBy: (i, { desc }) => [desc(i.billingPeriodStart)],
      });

      return all.filter(
        (inv) =>
          propertyIds.includes(inv.propertyId) &&
          inv.status !== "draft" &&
          (inv.propertyTenantId === null ||
            assignmentIds.includes(inv.propertyTenantId)),
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          property: true,
          tenant: { with: { user: true } },
          createdBy: true,
          lineItems: {
            with: { category: true, payments: true },
            orderBy: (li, { asc }) => [asc(li.createdAt)],
          },
          attachments: true,
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
        if (invoice.status === "draft") {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        // If invoice targets a specific tenant, verify it's this user
        if (
          invoice.propertyTenantId !== null &&
          invoice.propertyTenantId !== assignment.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return invoice;
    }),

  create: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        propertyTenantId: z.number().optional(),
        billingPeriodStart: z.string(),
        billingPeriodEnd: z.string(),
        label: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate tenant belongs to the property
      if (input.propertyTenantId) {
        const tenant = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.id, input.propertyTenantId),
            eq(propertyTenants.propertyId, input.propertyId),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!tenant) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Selected tenant is not an active tenant of this property.",
          });
        }
      }

      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          ...input,
          createdByUserId: ctx.user.id,
        })
        .returning();

      return invoice;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z
          .enum(["draft", "issued", "partially_paid", "paid"])
          .optional(),
        label: z.string().optional(),
        notes: z.string().nullable().optional(),
        billingPeriodStart: z.string().optional(),
        billingPeriodEnd: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(invoices)
        .set(data)
        .where(eq(invoices.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (invoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only delete draft invoices",
        });
      }

      await ctx.db.delete(invoices).where(eq(invoices.id, input.id));
      return { success: true };
    }),

  addLineItem: adminProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        categoryId: z.number(),
        totalBillAmount: z.string(),
        tenantChargeAmount: z.string(),
        proportionType: z
          .enum(["fixed", "percentage", "usage_only"])
          .default("fixed"),
        proportionValue: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [lineItem] = await ctx.db
        .insert(invoiceLineItems)
        .values(input)
        .returning();

      return lineItem;
    }),

  updateLineItem: adminProcedure
    .input(
      z.object({
        id: z.number(),
        totalBillAmount: z.string().optional(),
        tenantChargeAmount: z.string().optional(),
        proportionType: z
          .enum(["fixed", "percentage", "usage_only"])
          .optional(),
        proportionValue: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(invoiceLineItems)
        .set(data)
        .where(eq(invoiceLineItems.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  removeLineItem: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const lineItem = await ctx.db.query.invoiceLineItems.findFirst({
        where: eq(invoiceLineItems.id, input.id),
      });

      if (!lineItem) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Remove proof file if exists
      if (lineItem.proofStoragePath) {
        await supabaseAdmin.storage
          .from("invoices")
          .remove([lineItem.proofStoragePath]);
      }

      await ctx.db
        .delete(invoiceLineItems)
        .where(eq(invoiceLineItems.id, input.id));

      return { success: true };
    }),

  uploadProof: adminProcedure
    .input(
      z.object({
        lineItemId: z.number(),
        fileName: z.string(),
        base64Data: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lineItem = await ctx.db.query.invoiceLineItems.findFirst({
        where: eq(invoiceLineItems.id, input.lineItemId),
        with: { invoice: true },
      });

      if (!lineItem) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Remove old proof if exists
      if (lineItem.proofStoragePath) {
        await supabaseAdmin.storage
          .from("invoices")
          .remove([lineItem.proofStoragePath]);
      }

      const buffer = Buffer.from(input.base64Data, "base64");
      const path = `invoices/${lineItem.invoice.propertyId}/${lineItem.invoiceId}/${nanoid()}.pdf`;

      const { error } = await supabaseAdmin.storage
        .from("invoices")
        .upload(path, buffer, { contentType: "application/pdf" });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Upload failed: ${error.message}`,
        });
      }

      const [updated] = await ctx.db
        .update(invoiceLineItems)
        .set({
          proofStoragePath: path,
          proofFileName: input.fileName,
        })
        .where(eq(invoiceLineItems.id, input.lineItemId))
        .returning();

      return updated;
    }),

  getProofUrl: protectedProcedure
    .input(z.object({ lineItemId: z.number() }))
    .query(async ({ ctx, input }) => {
      const lineItem = await ctx.db.query.invoiceLineItems.findFirst({
        where: eq(invoiceLineItems.id, input.lineItemId),
        with: { invoice: true },
      });

      if (!lineItem?.proofStoragePath) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Tenant access check
      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, lineItem.invoice.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const { data, error } = await supabaseAdmin.storage
        .from("invoices")
        .createSignedUrl(lineItem.proofStoragePath, 3600);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate URL: ${error.message}`,
        });
      }

      return { url: data.signedUrl, fileName: lineItem.proofFileName };
    }),

  // Category management
  listCategories: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.invoiceCategories.findMany({
      where: eq(invoiceCategories.isActive, true),
      orderBy: (c, { asc }) => [asc(c.sortOrder), asc(c.name)],
    });
  }),

  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(128),
        description: z.string().max(512).optional(),
        icon: z.string().max(64).optional(),
        sortOrder: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await ctx.db
        .insert(invoiceCategories)
        .values(input)
        .returning();

      return category;
    }),

  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(128).optional(),
        description: z.string().max(512).nullable().optional(),
        icon: z.string().max(64).nullable().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(invoiceCategories)
        .set(data)
        .where(eq(invoiceCategories.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  // ── Invoice Attachments ──

  uploadAttachment: adminProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        fileName: z.string(),
        mimeType: z.string(),
        base64Data: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const buffer = Buffer.from(input.base64Data, "base64");
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const path = `invoices/${invoice.propertyId}/${invoice.id}/attachments/${nanoid()}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from("invoices")
        .upload(path, buffer, { contentType: input.mimeType });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Upload failed: ${error.message}`,
        });
      }

      const [attachment] = await ctx.db
        .insert(invoiceAttachments)
        .values({
          invoiceId: input.invoiceId,
          storagePath: path,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: buffer.length,
        })
        .returning();

      return attachment;
    }),

  removeAttachment: adminProcedure
    .input(z.object({ attachmentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const attachment = await ctx.db.query.invoiceAttachments.findFirst({
        where: eq(invoiceAttachments.id, input.attachmentId),
      });

      if (!attachment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await supabaseAdmin.storage
        .from("invoices")
        .remove([attachment.storagePath]);

      await ctx.db
        .delete(invoiceAttachments)
        .where(eq(invoiceAttachments.id, input.attachmentId));

      return { success: true };
    }),

  getAttachmentUrl: protectedProcedure
    .input(z.object({ attachmentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const attachment = await ctx.db.query.invoiceAttachments.findFirst({
        where: eq(invoiceAttachments.id, input.attachmentId),
        with: { invoice: true },
      });

      if (!attachment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, attachment.invoice.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const { data, error } = await supabaseAdmin.storage
        .from("invoices")
        .createSignedUrl(attachment.storagePath, 3600);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate URL: ${error.message}`,
        });
      }

      return { url: data.signedUrl, fileName: attachment.fileName };
    }),

  // ── Email Sending ──

  sendEmail: adminProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
        with: {
          property: true,
          lineItems: { with: { category: true } },
          attachments: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (invoice.status === "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot send email for draft invoices. Issue the invoice first.",
        });
      }

      let tenantEmails: string[];

      if (invoice.propertyTenantId) {
        // Send to the specific tenant assigned to this invoice
        const tenant = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.id, invoice.propertyTenantId),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!tenant) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The assigned tenant is no longer active.",
          });
        }
        tenantEmails = [tenant.email];
      } else {
        // Send to all active tenants for the property
        const tenants = await ctx.db.query.propertyTenants.findMany({
          where: and(
            eq(propertyTenants.propertyId, invoice.propertyId),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (tenants.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No active tenants found for this property.",
          });
        }
        tenantEmails = tenants.map((t) => t.email);
      }

      // Download attachments from Supabase for email
      const emailAttachments: Array<{
        filename: string;
        content: Buffer;
      }> = [];

      for (const att of invoice.attachments) {
        const { data, error } = await supabaseAdmin.storage
          .from("invoices")
          .download(att.storagePath);

        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer();
          emailAttachments.push({
            filename: att.fileName,
            content: Buffer.from(arrayBuffer),
          });
        }
      }

      const totalCharged = invoice.lineItems.reduce(
        (sum, li) => sum + parseFloat(li.tenantChargeAmount),
        0,
      );

      const html = buildInvoiceEmailHtml({
        propertyName: invoice.property.name,
        billingPeriodStart: invoice.billingPeriodStart,
        billingPeriodEnd: invoice.billingPeriodEnd,
        label: invoice.label,
        lineItems: invoice.lineItems.map((li) => ({
          categoryName: li.category.name,
          description: li.description,
          amount: parseFloat(li.tenantChargeAmount),
        })),
        totalCharged,
        notes: invoice.notes,
      });

      const { error: sendError } = await resend.emails.send({
        from: "Property Manager <onboarding@resend.dev>",
        to: tenantEmails,
        subject: `Invoice: ${invoice.property.name} – ${invoice.billingPeriodStart} to ${invoice.billingPeriodEnd}`,
        html,
        attachments: emailAttachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      });

      if (sendError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send email: ${sendError.message}`,
        });
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          emailSentAt: new Date(),
          emailSentTo: tenantEmails.join(", "),
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      return updated;
    }),
});
