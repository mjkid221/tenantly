import { relations } from "drizzle-orm";
import { users, admins } from "./users";
import { properties, propertyImages, propertyTenants } from "./properties";
import { contracts } from "./contracts";
import { propertyDocuments } from "./documents";
import {
  conversations,
  conversationParticipants,
  messages,
  messageReadStatus,
} from "./messages";
import {
  invoices,
  invoiceLineItems,
  invoiceCategories,
  invoiceAttachments,
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
  documents: many(propertyDocuments),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const propertyTenantsRelations = relations(
  propertyTenants,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [propertyTenants.propertyId],
      references: [properties.id],
    }),
    user: one(users, {
      fields: [propertyTenants.userId],
      references: [users.id],
    }),
    invoices: many(invoices),
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
  tenant: one(propertyTenants, {
    fields: [invoices.propertyTenantId],
    references: [propertyTenants.id],
  }),
  createdBy: one(users, {
    fields: [invoices.createdByUserId],
    references: [users.id],
  }),
  lineItems: many(invoiceLineItems),
  attachments: many(invoiceAttachments),
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

export const invoiceAttachmentsRelations = relations(
  invoiceAttachments,
  ({ one }) => ({
    invoice: one(invoices, {
      fields: [invoiceAttachments.invoiceId],
      references: [invoices.id],
    }),
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

export const propertyDocumentsRelations = relations(
  propertyDocuments,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyDocuments.propertyId],
      references: [properties.id],
    }),
    uploadedBy: one(users, {
      fields: [propertyDocuments.uploadedByUserId],
      references: [users.id],
    }),
  }),
);

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

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  readStatuses: many(messageReadStatus),
}));

export const messageReadStatusRelations = relations(
  messageReadStatus,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageReadStatus.messageId],
      references: [messages.id],
    }),
    user: one(users, {
      fields: [messageReadStatus.userId],
      references: [users.id],
    }),
  }),
);
