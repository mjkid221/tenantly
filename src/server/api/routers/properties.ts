import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  properties,
  propertyImages,
  propertyTenants,
  users,
} from "~/server/db/schema";
import { supabaseAdmin } from "~/lib/supabase/admin";

export const propertiesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.role === "admin") {
      return ctx.db.query.properties.findMany({
        where: eq(properties.isActive, true),
        with: { images: true, tenants: { with: { user: true } } },
        orderBy: (p, { desc }) => [desc(p.createdAt)],
      });
    }

    // Tenant: only assigned properties
    const assignments = await ctx.db.query.propertyTenants.findMany({
      where: and(
        eq(propertyTenants.userId, ctx.user.id),
        eq(propertyTenants.isActive, true),
      ),
      with: {
        property: {
          with: { images: true, tenants: { with: { user: true } } },
        },
      },
    });

    return assignments
      .map((a) => a.property)
      .filter((p) => p.isActive);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const property = await ctx.db.query.properties.findFirst({
        where: and(
          eq(properties.id, input.id),
          eq(properties.isActive, true),
        ),
        with: {
          images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
          tenants: {
            where: eq(propertyTenants.isActive, true),
            with: { user: true },
          },
        },
      });

      if (!property) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      // Tenant access check
      if (ctx.role === "tenant") {
        const assignment = await ctx.db.query.propertyTenants.findFirst({
          where: and(
            eq(propertyTenants.propertyId, input.id),
            eq(propertyTenants.userId, ctx.user.id),
            eq(propertyTenants.isActive, true),
          ),
        });
        if (!assignment) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return property;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        addressLine1: z.string().min(1).max(512),
        addressLine2: z.string().max(512).optional(),
        city: z.string().min(1).max(256),
        state: z.string().max(256).optional(),
        postalCode: z.string().max(20).optional(),
        country: z.string().max(100).default("AU"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [property] = await ctx.db
        .insert(properties)
        .values(input)
        .returning();

      return property;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(256).optional(),
        addressLine1: z.string().min(1).max(512).optional(),
        addressLine2: z.string().max(512).nullable().optional(),
        city: z.string().min(1).max(256).optional(),
        state: z.string().max(256).nullable().optional(),
        postalCode: z.string().max(20).nullable().optional(),
        country: z.string().max(100).optional(),
        description: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(properties)
        .set(data)
        .where(eq(properties.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(properties)
        .set({ isActive: false })
        .where(eq(properties.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  uploadImage: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        fileName: z.string(),
        mimeType: z.string(),
        base64Data: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const ext = input.fileName.split(".").pop() ?? "jpg";
      const path = `properties/${input.propertyId}/${nanoid()}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from("property-images")
        .upload(path, buffer, { contentType: input.mimeType });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Upload failed: ${error.message}`,
        });
      }

      const [image] = await ctx.db
        .insert(propertyImages)
        .values({
          propertyId: input.propertyId,
          storagePath: path,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: buffer.length,
        })
        .returning();

      return image;
    }),

  removeImage: adminProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.db.query.propertyImages.findFirst({
        where: eq(propertyImages.id, input.imageId),
      });

      if (!image) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await supabaseAdmin.storage
        .from("property-images")
        .remove([image.storagePath]);

      await ctx.db
        .delete(propertyImages)
        .where(eq(propertyImages.id, input.imageId));

      return { success: true };
    }),

  getImageUrl: protectedProcedure
    .input(z.object({ storagePath: z.string() }))
    .query(async () => {
      // Property images bucket is public
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage
        .from("property-images")
        .getPublicUrl("");

      return { baseUrl: publicUrl };
    }),

  assignTenant: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        email: z.string().email(),
        moveInDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. They must sign in at least once first.",
        });
      }

      // Check if already assigned
      const existing = await ctx.db.query.propertyTenants.findFirst({
        where: and(
          eq(propertyTenants.propertyId, input.propertyId),
          eq(propertyTenants.userId, user.id),
        ),
      });

      if (existing) {
        if (existing.isActive) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tenant is already assigned to this property",
          });
        }
        // Re-activate
        const [updated] = await ctx.db
          .update(propertyTenants)
          .set({
            isActive: true,
            moveInDate: input.moveInDate ?? null,
            moveOutDate: null,
          })
          .where(eq(propertyTenants.id, existing.id))
          .returning();
        return updated;
      }

      const [assignment] = await ctx.db
        .insert(propertyTenants)
        .values({
          propertyId: input.propertyId,
          userId: user.id,
          moveInDate: input.moveInDate ?? null,
        })
        .returning();

      return assignment;
    }),

  removeTenant: adminProcedure
    .input(z.object({ propertyTenantId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(propertyTenants)
        .set({ isActive: false, moveOutDate: sql`CURRENT_DATE` })
        .where(eq(propertyTenants.id, input.propertyTenantId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  listTenants: adminProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.propertyTenants.findMany({
        where: eq(propertyTenants.propertyId, input.propertyId),
        with: { user: true },
        orderBy: (pt, { desc }) => [desc(pt.isActive), desc(pt.createdAt)],
      });
    }),
});
