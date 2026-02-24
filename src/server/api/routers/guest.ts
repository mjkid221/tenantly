import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { guestAccessCodes, contracts } from "~/server/db/schema";
import { supabaseAdmin } from "~/lib/supabase/admin";

function validateGuestCode(
  code: typeof guestAccessCodes.$inferSelect | undefined,
): asserts code is typeof guestAccessCodes.$inferSelect {
  if (!code) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invalid access code",
    });
  }

  if (!code.isEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This access code has been disabled",
    });
  }

  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This access code has expired",
    });
  }
}

export const guestRouter = createTRPCRouter({
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const guestCode = await ctx.db.query.guestAccessCodes.findFirst({
        where: eq(guestAccessCodes.code, input.code),
        with: { property: { with: { images: true } } },
      });

      validateGuestCode(guestCode);

      return {
        propertyId: guestCode.propertyId,
        propertyName: guestCode.property.name,
        allowedSections: guestCode.allowedSections,
        expiresAt: guestCode.expiresAt,
      };
    }),

  getPropertyDetails: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const guestCode = await ctx.db.query.guestAccessCodes.findFirst({
        where: eq(guestAccessCodes.code, input.code),
        with: {
          property: {
            with: {
              images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
            },
          },
        },
      });

      validateGuestCode(guestCode);

      if (!guestCode.allowedSections?.includes("property_details")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access to property details is not allowed with this code",
        });
      }

      return guestCode.property;
    }),

  getContract: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const guestCode = await ctx.db.query.guestAccessCodes.findFirst({
        where: eq(guestAccessCodes.code, input.code),
      });

      validateGuestCode(guestCode);

      if (!guestCode.allowedSections?.includes("contracts")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access to contracts is not allowed with this code",
        });
      }

      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.propertyId, guestCode.propertyId),
        orderBy: (c, { desc }) => [desc(c.version)],
      });

      if (!contract) {
        return null;
      }

      const { data, error } = await supabaseAdmin.storage
        .from("contracts")
        .createSignedUrl(contract.storagePath, 3600);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }

      return {
        ...contract,
        downloadUrl: data.signedUrl,
      };
    }),
});
