import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { users } from "./users";

export const properties = createTable(
  "property",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    addressLine1: d.varchar("address_line_1", { length: 512 }).notNull(),
    addressLine2: d.varchar("address_line_2", { length: 512 }),
    city: d.varchar({ length: 256 }).notNull(),
    state: d.varchar({ length: 256 }),
    postalCode: d.varchar("postal_code", { length: 20 }),
    country: d.varchar({ length: 100 }).notNull().default("AU"),
    description: d.text(),
    isActive: d.boolean("is_active").notNull().default(true),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
);

export const propertyImages = createTable(
  "property_image",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    propertyId: d
      .integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    storagePath: d.varchar("storage_path", { length: 1024 }).notNull(),
    fileName: d.varchar("file_name", { length: 256 }).notNull(),
    mimeType: d.varchar("mime_type", { length: 100 }),
    sizeBytes: d.integer("size_bytes"),
    sortOrder: d.integer("sort_order").notNull().default(0),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("property_image_property_idx").on(t.propertyId)],
);

export const propertyTenants = createTable(
  "property_tenant",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    propertyId: d
      .integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    userId: d
      .integer("user_id")
      .references(() => users.id, { onDelete: "set null" }),
    email: d.varchar({ length: 320 }).notNull(),
    moveInDate: d.date("move_in_date"),
    moveOutDate: d.date("move_out_date"),
    isActive: d.boolean("is_active").notNull().default(true),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("property_tenant_property_idx").on(t.propertyId),
    index("property_tenant_user_idx").on(t.userId),
    uniqueIndex("property_tenant_unique_idx").on(t.propertyId, t.email),
  ],
);
