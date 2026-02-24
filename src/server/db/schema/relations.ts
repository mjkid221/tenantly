import { relations } from "drizzle-orm";
import { users, admins } from "./users";
import {
  properties,
  propertyImages,
  propertyTenants,
} from "./properties";
import { contracts } from "./contracts";
import {
  invoices,
  invoiceLineItems,
  invoiceCategories,
} from "./invoices";
import { payments } from "./payments";
import { guestAccessCodes } from "./guest-access";

export const usersRelations = relations(users, ({ many }) => ({
  propertyTenants: many(propertyTenants),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  addedBy: one(users, {
    fields: [admins.addedByUserId],
    references: [users.id],
  }),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  images: many(propertyImages),
  tenants: many(propertyTenants),
  contracts: many(contracts),
  invoices: many(invoices),
  guestAccessCodes: many(guestAccessCodes),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const propertyTenantsRelations = relations(
  propertyTenants,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyTenants.propertyId],
      references: [properties.id],
    }),
    user: one(users, {
      fields: [propertyTenants.userId],
      references: [users.id],
    }),
  }),
);

export const contractsRelations = relations(contracts, ({ one }) => ({
  property: one(properties, {
    fields: [contracts.propertyId],
    references: [properties.id],
  }),
  uploadedBy: one(users, {
    fields: [contracts.uploadedByUserId],
    references: [users.id],
  }),
}));

export const invoiceCategoriesRelations = relations(
  invoiceCategories,
  ({ many }) => ({
    lineItems: many(invoiceLineItems),
  }),
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  property: one(properties, {
    fields: [invoices.propertyId],
    references: [properties.id],
  }),
  createdBy: one(users, {
    fields: [invoices.createdByUserId],
    references: [users.id],
  }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(
  invoiceLineItems,
  ({ one, many }) => ({
    invoice: one(invoices, {
      fields: [invoiceLineItems.invoiceId],
      references: [invoices.id],
    }),
    category: one(invoiceCategories, {
      fields: [invoiceLineItems.categoryId],
      references: [invoiceCategories.id],
    }),
    payments: many(payments),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  lineItem: one(invoiceLineItems, {
    fields: [payments.invoiceLineItemId],
    references: [invoiceLineItems.id],
  }),
  confirmedBy: one(users, {
    fields: [payments.confirmedByUserId],
    references: [users.id],
  }),
}));

export const guestAccessCodesRelations = relations(
  guestAccessCodes,
  ({ one }) => ({
    property: one(properties, {
      fields: [guestAccessCodes.propertyId],
      references: [properties.id],
    }),
    createdBy: one(users, {
      fields: [guestAccessCodes.createdByUserId],
      references: [users.id],
    }),
  }),
);
