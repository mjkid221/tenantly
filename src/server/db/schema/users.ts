import { uniqueIndex } from "drizzle-orm/pg-core";
import { createTable } from "./shared";

export const users = createTable(
  "user",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    supabaseUserId: d.uuid("supabase_user_id").notNull().unique(),
    email: d.varchar({ length: 320 }).notNull().unique(),
    fullName: d.varchar("full_name", { length: 256 }),
    avatarUrl: d.varchar("avatar_url", { length: 1024 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    uniqueIndex("user_supabase_id_idx").on(t.supabaseUserId),
    uniqueIndex("user_email_idx").on(t.email),
  ],
);

export const admins = createTable(
  "admin",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    email: d.varchar({ length: 320 }).notNull().unique(),
    addedByUserId: d.integer("added_by_user_id"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [uniqueIndex("admin_email_idx").on(t.email)],
);
