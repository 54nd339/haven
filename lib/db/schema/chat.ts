import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const conversationFolders = pgTable('conversation_folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  emoji: text('emoji'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull().default('direct'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  wallpaperUrl: text('wallpaper_url'),
  isPinned: boolean('is_pinned').default(false),
  isMuted: boolean('is_muted').default(false),
  isArchived: boolean('is_archived').default(false),
  isLocked: boolean('is_locked').default(false),
  folderId: uuid('folder_id').references(() => conversationFolders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const conversationMembers = pgTable(
  'conversation_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull().default('member'),
    lastReadAt: timestamp('last_read_at'),
    customWallpaperUrl: text('custom_wallpaper_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('conversation_members_conversation_user_idx').on(t.conversationId, t.userId)],
);

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id),
  content: text('content'),
  type: text('type').notNull().default('text'),
  mediaUrl: text('media_url'),
  fileName: text('file_name'),
  replyToId: uuid('reply_to_id'),
  isDisappearing: boolean('is_disappearing').default(false),
  disappearSeconds: integer('disappear_seconds'),
  isViewOnce: boolean('is_view_once').default(false),
  viewedAt: timestamp('viewed_at'),
  isSilent: boolean('is_silent').default(false),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at'),
  scheduledAt: timestamp('scheduled_at'),
  forwardedFromId: uuid('forwarded_from_id'),
  isDeletedForEveryone: boolean('is_deleted_for_everyone').default(false),
  linkPreviewUrl: text('link_preview_url'),
  linkPreviewTitle: text('link_preview_title'),
  linkPreviewDescription: text('link_preview_description'),
  linkPreviewImage: text('link_preview_image'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messageEditHistory = pgTable('message_edit_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id),
  previousContent: text('previous_content').notNull(),
  editedAt: timestamp('edited_at').defaultNow(),
});

export const messageReactions = pgTable(
  'message_reactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('message_reactions_message_user_idx').on(t.messageId, t.userId)],
);

export const pinnedMessages = pgTable('pinned_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id),
  pinnedBy: uuid('pinned_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatPolls = pgTable('chat_polls', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => users.id),
  question: text('question').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatPollOptions = pgTable('chat_poll_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  pollId: uuid('poll_id')
    .notNull()
    .references(() => chatPolls.id),
  text: text('text').notNull(),
  order: integer('order').notNull().default(0),
});

export const chatPollVotes = pgTable(
  'chat_poll_votes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    optionId: uuid('option_id')
      .notNull()
      .references(() => chatPollOptions.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('chat_poll_votes_option_user_idx').on(t.optionId, t.userId)],
);

export const conversationFoldersRelations = relations(conversationFolders, ({ one, many }) => ({
  user: one(users, {
    fields: [conversationFolders.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  folder: one(conversationFolders, {
    fields: [conversations.folderId],
    references: [conversationFolders.id],
  }),
  members: many(conversationMembers),
  messages: many(messages),
  pinnedMessages: many(pinnedMessages),
  polls: many(chatPolls),
}));

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMembers.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationMembers.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: 'messageReplies',
  }),
  replies: many(messages, {
    relationName: 'messageReplies',
  }),
  forwardedFrom: one(messages, {
    fields: [messages.forwardedFromId],
    references: [messages.id],
    relationName: 'messageForwards',
  }),
  forwardedAs: many(messages, {
    relationName: 'messageForwards',
  }),
  editHistory: many(messageEditHistory),
  reactions: many(messageReactions),
}));

export const messageEditHistoryRelations = relations(messageEditHistory, ({ one }) => ({
  message: one(messages, {
    fields: [messageEditHistory.messageId],
    references: [messages.id],
  }),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, {
    fields: [messageReactions.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}));

export const pinnedMessagesRelations = relations(pinnedMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [pinnedMessages.conversationId],
    references: [conversations.id],
  }),
  message: one(messages, {
    fields: [pinnedMessages.messageId],
    references: [messages.id],
  }),
  pinnedByUser: one(users, {
    fields: [pinnedMessages.pinnedBy],
    references: [users.id],
  }),
}));

export const chatPollsRelations = relations(chatPolls, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [chatPolls.conversationId],
    references: [conversations.id],
  }),
  creator: one(users, {
    fields: [chatPolls.creatorId],
    references: [users.id],
  }),
  options: many(chatPollOptions),
}));

export const chatPollOptionsRelations = relations(chatPollOptions, ({ one, many }) => ({
  poll: one(chatPolls, {
    fields: [chatPollOptions.pollId],
    references: [chatPolls.id],
  }),
  votes: many(chatPollVotes),
}));

export const chatPollVotesRelations = relations(chatPollVotes, ({ one }) => ({
  option: one(chatPollOptions, {
    fields: [chatPollVotes.optionId],
    references: [chatPollOptions.id],
  }),
  user: one(users, {
    fields: [chatPollVotes.userId],
    references: [users.id],
  }),
}));

export const chatRelations = {
  conversationFolders: conversationFoldersRelations,
  conversations: conversationsRelations,
  conversationMembers: conversationMembersRelations,
  messages: messagesRelations,
  messageEditHistory: messageEditHistoryRelations,
  messageReactions: messageReactionsRelations,
  pinnedMessages: pinnedMessagesRelations,
  chatPolls: chatPollsRelations,
  chatPollOptions: chatPollOptionsRelations,
  chatPollVotes: chatPollVotesRelations,
};
