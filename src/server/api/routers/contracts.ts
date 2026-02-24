import { z } from "zod";
import { and, eq, max } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { contracts, propertyTenants } from "~/server/db/schema";
import { supabaseAdmin } from "~/lib/supabase/admin";

export const contractsRouter = createTRPCRouter({
  listByProperty: protectedProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Tenant access check
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

      return ctx.db.query.contracts.findMany({
        where: eq(contracts.propertyId, input.propertyId),
        with: { uploadedBy: true },
        orderBy: (c, { desc }) => [desc(c.version)],
      });
    }),

  getLatestByProperty: protectedProcedure
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

      return ctx.db.query.contracts.findFirst({
        where: eq(contracts.propertyId, input.propertyId),
        with: { uploadedBy: true },
        orderBy: (c, { desc }) => [desc(c.version)],
      }) ?? null;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
        with: { uploadedBy: true },
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, contract.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return contract;
    }),

  upload: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        fileName: z.string(),
        base64Data: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Determine next version
      const result = await ctx.db
        .select({ maxVersion: max(contracts.version) })
        .from(contracts)
        .where(eq(contracts.propertyId, input.propertyId));

      const nextVersion = (result[0]?.maxVersion ?? 0) + 1;

      const buffer = Buffer.from(input.base64Data, "base64");
      const path = `contracts/${input.propertyId}/v${nextVersion}-${nanoid()}.pdf`;

      const { error } = await supabaseAdmin.storage
        .from("contracts")
        .upload(path, buffer, { contentType: "application/pdf" });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Upload failed: ${error.message}`,
        });
      }

      const [contract] = await ctx.db
        .insert(contracts)
        .values({
          propertyId: input.propertyId,
          version: nextVersion,
          storagePath: path,
          fileName: input.fileName,
          sizeBytes: buffer.length,
          notes: input.notes,
          uploadedByUserId: ctx.user.id,
        })
        .returning();

      return contract;
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, contract.propertyId),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const { data, error } = await supabaseAdmin.storage
        .from("contracts")
        .createSignedUrl(contract.storagePath, 3600); // 1 hour

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate URL: ${error.message}`,
        });
      }

      return { url: data.signedUrl, fileName: contract.fileName };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await supabaseAdmin.storage
        .from("contracts")
        .remove([contract.storagePath]);

      await ctx.db.delete(contracts).where(eq(contracts.id, input.id));

      return { success: true };
    }),
});
