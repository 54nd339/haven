import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const vaultItems = pgTable('vault_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  encryptedContent: text('encrypted_content').notNull(),
  encryptedKey: text('encrypted_key').notNull(),
  type: text('type').notNull().default('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const vaultItemsRelations = relations(vaultItems, ({ one }) => ({
  user: one(users, {
    fields: [vaultItems.userId],
    references: [users.id],
  }),
}));
