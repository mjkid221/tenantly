import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { createTable } from "./shared";
import { users } from "./users";

export const conversations = createTable("conversation", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const conversationParticipants = createTable(
  "conversation_participant",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    conversationId: d
      .integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: d
      .integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    uniqueIndex("conversation_participant_unique_idx").on(
      t.conversationId,
      t.userId,
    ),
    index("conversation_participant_user_idx").on(t.userId),
  ],
);

export const messages = createTable(
  "message",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    conversationId: d
      .integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: d
      .integer("sender_id")
      .notNull()
      .references(() => users.id),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("message_conversation_idx").on(t.conversationId)],
);

export const messageReadStatus = createTable(
  "message_read_status",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    messageId: d
      .integer("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: d
      .integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    uniqueIndex("message_read_status_unique_idx").on(t.messageId, t.userId),
  ],
);
