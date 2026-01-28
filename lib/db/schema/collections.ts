import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { posts } from './posts';
import { users } from './users';

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  emoji: text('emoji'),
  isDefault: boolean('is_default').default(false).notNull(),
  order: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const collectionItems = pgTable(
  'collection_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    collectionId: uuid('collection_id')
      .notNull()
      .references(() => collections.id),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('collection_items_collection_post_idx').on(table.collectionId, table.postId),
  ],
);

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionItems.collectionId],
    references: [collections.id],
  }),
  post: one(posts, {
    fields: [collectionItems.postId],
    references: [posts.id],
  }),
}));
