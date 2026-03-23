import { createTable } from "./shared";

export const appSettings = createTable("app_setting", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  key: d.varchar({ length: 128 }).notNull().unique(),
  value: d.text().notNull().default(""),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const paymentMethods = createTable("payment_method", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  details: d.text().notNull(),
  isActive: d.boolean("is_active").notNull().default(true),
  sortOrder: d.integer("sort_order").notNull().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
