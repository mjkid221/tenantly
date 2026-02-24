import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { properties } from "./properties";
import { users } from "./users";

export const contracts = createTable(
  "contract",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    propertyId: d
      .integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    version: d.integer().notNull().default(1),
    storagePath: d.varchar("storage_path", { length: 1024 }).notNull(),
    fileName: d.varchar("file_name", { length: 256 }).notNull(),
    sizeBytes: d.integer("size_bytes"),
    notes: d.text(),
    uploadedByUserId: d
      .integer("uploaded_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("contract_property_idx").on(t.propertyId),
    uniqueIndex("contract_property_version_idx").on(t.propertyId, t.version),
  ],
);
