import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { properties } from "./properties";
import { users } from "./users";

export const guestAccessCodes = createTable(
  "guest_access_code",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    propertyId: d
      .integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    code: d.varchar({ length: 64 }).notNull().unique(),
    label: d.varchar({ length: 256 }),
    isEnabled: d.boolean("is_enabled").notNull().default(true),
    expiresAt: d.timestamp("expires_at", { withTimezone: true }),
    allowedSections: d
      .jsonb("allowed_sections")
      .$type<string[]>()
      .default(["property_details"]),
    createdByUserId: d
      .integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    uniqueIndex("guest_code_idx").on(t.code),
    index("guest_property_idx").on(t.propertyId),
  ],
);
