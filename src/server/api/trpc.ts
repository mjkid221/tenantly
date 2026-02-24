import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users, admins } from "~/server/db/schema";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let dbUser: typeof users.$inferSelect | null = null;
  let role: "admin" | "tenant" | null = null;

  if (supabaseUser) {
    dbUser =
      (await db.query.users.findFirst({
        where: eq(users.supabaseUserId, supabaseUser.id),
      })) ?? null;

    if (!dbUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          supabaseUserId: supabaseUser.id,
          email: supabaseUser.email!,
          fullName:
            (supabaseUser.user_metadata?.full_name as string | undefined) ??
            null,
          avatarUrl:
            (supabaseUser.user_metadata?.avatar_url as string | undefined) ??
            null,
        })
        .returning();
      dbUser = newUser!;
    }

    const isAdmin = await db.query.admins.findFirst({
      where: eq(admins.email, dbUser.email),
    });
    role = isAdmin ? "admin" : "tenant";
  }

  return {
    db,
    supabase,
    supabaseUser,
    user: dbUser,
    role,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.supabaseUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      supabaseUser: ctx.supabaseUser,
      role: ctx.role!,
    },
  });
});

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAuth);

const enforceAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || ctx.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: { ...ctx, user: ctx.user, role: "admin" as const },
  });
});

export const adminProcedure = protectedProcedure.use(enforceAdmin);

const enforceTenantOrAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || (ctx.role !== "admin" && ctx.role !== "tenant")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tenant or admin access required",
    });
  }
  return next({
    ctx: { ...ctx, user: ctx.user, role: ctx.role as "admin" | "tenant" },
  });
});

export const tenantProcedure = protectedProcedure.use(enforceTenantOrAdmin);
