import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { circles } from './social';
import { users } from './users';

export const storyHighlights = pgTable('story_highlights', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  coverUrl: text('cover_url'),
  order: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const stories = pgTable('stories', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id),
  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type').notNull().default('image'),
  caption: text('caption'),
  bgColor: text('bg_color'),
  fontStyle: text('font_style'),
  visibility: text('visibility').notNull().default('public'),
  circleId: uuid('circle_id').references(() => circles.id, { onDelete: 'set null' }),
  highlightId: uuid('highlight_id').references(() => storyHighlights.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const storyViews = pgTable(
  'story_views',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    storyId: uuid('story_id')
      .notNull()
      .references(() => stories.id),
    viewerId: uuid('viewer_id')
      .notNull()
      .references(() => users.id),
    viewedAt: timestamp('viewed_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('story_views_story_viewer_idx').on(table.storyId, table.viewerId)],
);

export const storyReactions = pgTable(
  'story_reactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    storyId: uuid('story_id')
      .notNull()
      .references(() => stories.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('story_reactions_story_user_idx').on(table.storyId, table.userId)],
);

export const storyHighlightsRelations = relations(storyHighlights, ({ one, many }) => ({
  user: one(users, {
    fields: [storyHighlights.userId],
    references: [users.id],
  }),
  stories: many(stories),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  author: one(users, {
    fields: [stories.authorId],
    references: [users.id],
  }),
  highlight: one(storyHighlights, {
    fields: [stories.highlightId],
    references: [storyHighlights.id],
  }),
  views: many(storyViews),
  reactions: many(storyReactions),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  story: one(stories, {
    fields: [storyViews.storyId],
    references: [stories.id],
  }),
  viewer: one(users, {
    fields: [storyViews.viewerId],
    references: [users.id],
  }),
}));

export const storyReactionsRelations = relations(storyReactions, ({ one }) => ({
  story: one(stories, {
    fields: [storyReactions.storyId],
    references: [stories.id],
  }),
  user: one(users, {
    fields: [storyReactions.userId],
    references: [users.id],
  }),
}));
