import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const userLists = pgTable('user_lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  emoji: text('emoji'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userListMembers = pgTable(
  'user_list_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listId: uuid('list_id')
      .notNull()
      .references(() => userLists.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('user_list_members_list_user_idx').on(table.listId, table.userId)],
);

export const userListsRelations = relations(userLists, ({ one, many }) => ({
  owner: one(users, {
    fields: [userLists.ownerId],
    references: [users.id],
  }),
  members: many(userListMembers),
}));

export const userListMembersRelations = relations(userListMembers, ({ one }) => ({
  list: one(userLists, {
    fields: [userListMembers.listId],
    references: [userLists.id],
  }),
  user: one(users, {
    fields: [userListMembers.userId],
    references: [users.id],
  }),
}));
