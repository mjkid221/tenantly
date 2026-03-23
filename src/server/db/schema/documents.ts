import { index } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { properties } from "./properties";
import { users } from "./users";

export const propertyDocuments = createTable(
  "property_document",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    propertyId: d
      .integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    documentType: d.varchar("document_type", { length: 64 }).notNull(),
    fileName: d.varchar("file_name", { length: 256 }).notNull(),
    storagePath: d.varchar("storage_path", { length: 1024 }).notNull(),
    mimeType: d.varchar("mime_type", { length: 100 }),
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
    index("property_document_property_idx").on(t.propertyId),
    index("property_document_type_idx").on(t.documentType),
  ],
);
