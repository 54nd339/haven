import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { posts } from './posts';
import { users } from './users';

export const reactions = pgTable(
  'reactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    entityId: uuid('entity_id').notNull(),
    entityType: text('entity_type').notNull(),
    reactionType: text('reaction_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('reactions_user_entity_idx').on(table.userId, table.entityId, table.entityType),
  ],
);

export const shares = pgTable('shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id),
  quoteContent: text('quote_content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

export const sharesRelations = relations(shares, ({ one }) => ({
  user: one(users, {
    fields: [shares.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [shares.postId],
    references: [posts.id],
  }),
}));
