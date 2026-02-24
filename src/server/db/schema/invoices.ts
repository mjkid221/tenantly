import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { properties, propertyTenants } from "./properties";
import { users } from "./users";

export const invoiceCategories = createTable("invoice_category", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 128 }).notNull().unique(),
  description: d.varchar({ length: 512 }),
  icon: d.varchar({ length: 64 }),
  sortOrder: d.integer("sort_order").notNull().default(0),
  isActive: d.boolean("is_active").notNull().default(true),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const invoices = createTable(
  "invoice",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    propertyId: d
      .integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    propertyTenantId: d
      .integer("property_tenant_id")
      .references(() => propertyTenants.id, { onDelete: "set null" }),
    billingPeriodStart: d.date("billing_period_start").notNull(),
    billingPeriodEnd: d.date("billing_period_end").notNull(),
    label: d.varchar({ length: 256 }),
    status: d.varchar({ length: 32 }).notNull().default("draft"),
    notes: d.text(),
    createdByUserId: d
      .integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    emailSentAt: d.timestamp("email_sent_at", { withTimezone: true }),
    emailSentTo: d.text("email_sent_to"),
  }),
  (t) => [
    index("invoice_property_idx").on(t.propertyId),
    index("invoice_period_idx").on(t.propertyId, t.billingPeriodStart),
    index("invoice_tenant_idx").on(t.propertyTenantId),
  ],
);

export const invoiceLineItems = createTable(
  "invoice_line_item",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    invoiceId: d
      .integer("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    categoryId: d
      .integer("category_id")
      .notNull()
      .references(() => invoiceCategories.id),
    totalBillAmount: d
      .numeric("total_bill_amount", { precision: 10, scale: 2 })
      .notNull(),
    tenantChargeAmount: d
      .numeric("tenant_charge_amount", { precision: 10, scale: 2 })
      .notNull(),
    proportionType: d
      .varchar("proportion_type", { length: 32 })
      .notNull()
      .default("fixed"),
    proportionValue: d.numeric("proportion_value", {
      precision: 5,
      scale: 2,
    }),
    description: d.text(),
    proofStoragePath: d.varchar("proof_storage_path", { length: 1024 }),
    proofFileName: d.varchar("proof_file_name", { length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("line_item_invoice_idx").on(t.invoiceId),
    uniqueIndex("line_item_invoice_category_idx").on(t.invoiceId, t.categoryId),
  ],
);

export const invoiceAttachments = createTable(
  "invoice_attachment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    invoiceId: d
      .integer("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    storagePath: d.varchar("storage_path", { length: 1024 }).notNull(),
    fileName: d.varchar("file_name", { length: 256 }).notNull(),
    mimeType: d.varchar("mime_type", { length: 100 }),
    sizeBytes: d.integer("size_bytes"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("invoice_attachment_invoice_idx").on(t.invoiceId)],
);
