import { index } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { invoiceLineItems } from "./invoices";
import { users } from "./users";

export const payments = createTable(
  "payment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    invoiceLineItemId: d
      .integer("invoice_line_item_id")
      .notNull()
      .references(() => invoiceLineItems.id, { onDelete: "cascade" }),
    amount: d.numeric({ precision: 10, scale: 2 }).notNull(),
    status: d.varchar({ length: 32 }).notNull().default("pending"),
    paidAt: d.timestamp("paid_at", { withTimezone: true }),
    confirmedAt: d.timestamp("confirmed_at", { withTimezone: true }),
    confirmedByUserId: d
      .integer("confirmed_by_user_id")
      .references(() => users.id),
    notes: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("payment_line_item_idx").on(t.invoiceLineItemId)],
);
