import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { propertyDocuments, propertyTenants } from "~/server/db/schema";
import { supabaseAdmin } from "~/lib/supabase/admin";

export const documentsRouter = createTRPCRouter({
  listByProperty: protectedProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, input.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return ctx.db.query.propertyDocuments.findMany({
        where: eq(propertyDocuments.propertyId, input.propertyId),
        with: { uploadedBy: true },
        orderBy: (doc, { desc }) => [desc(doc.createdAt)],
      });
    }),

  upload: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        documentType: z.string().min(1).max(64),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        base64Data: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const path = `${input.propertyId}/${input.documentType}/${nanoid()}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from("property-documents")
        .upload(path, buffer, { contentType: input.mimeType });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Upload failed: ${error.message}`,
        });
      }

      const [document] = await ctx.db
        .insert(propertyDocuments)
        .values({
          propertyId: input.propertyId,
          documentType: input.documentType,
          fileName: input.fileName,
          storagePath: path,
          mimeType: input.mimeType,
          sizeBytes: buffer.length,
          notes: input.notes ?? null,
          uploadedByUserId: ctx.user.id,
        })
        .returning();

      return document;
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.propertyDocuments.findFirst({
        where: eq(propertyDocuments.id, input.id),
      });

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, doc.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const { data, error } = await supabaseAdmin.storage
        .from("property-documents")
        .createSignedUrl(doc.storagePath, 3600);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }

      return { url: data.signedUrl, fileName: doc.fileName };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.query.propertyDocuments.findFirst({
        where: eq(propertyDocuments.id, input.id),
      });

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await supabaseAdmin.storage
        .from("property-documents")
        .remove([doc.storagePath]);

      await ctx.db
        .delete(propertyDocuments)
        .where(eq(propertyDocuments.id, input.id));

      return { success: true };
    }),
});
