import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { posts } from './posts';
import { users } from './users';

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  depth: integer('depth').notNull().default(0),
  isEdited: boolean('is_edited').default(false).notNull(),
  editedAt: timestamp('edited_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'commentReplies',
  }),
  replies: many(comments, {
    relationName: 'commentReplies',
  }),
}));
