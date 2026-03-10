import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const follows = pgTable(
  'follows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id),
    followingId: uuid('following_id')
      .notNull()
      .references(() => users.id),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('follows_follower_following_idx').on(t.followerId, t.followingId)],
);

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    blockerId: uuid('blocker_id')
      .notNull()
      .references(() => users.id),
    blockedId: uuid('blocked_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('blocks_blocker_blocked_idx').on(t.blockerId, t.blockedId)],
);

export const mutes = pgTable(
  'mutes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    muterId: uuid('muter_id')
      .notNull()
      .references(() => users.id),
    mutedId: uuid('muted_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('mutes_muter_muted_idx').on(t.muterId, t.mutedId)],
);

export const restricts = pgTable(
  'restricts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restricterId: uuid('restricter_id')
      .notNull()
      .references(() => users.id),
    restrictedId: uuid('restricted_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('restricts_restricter_restricted_idx').on(t.restricterId, t.restrictedId)],
);

export const circles = pgTable('circles', {
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

export const circleMembers = pgTable(
  'circle_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    circleId: uuid('circle_id')
      .notNull()
      .references(() => circles.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('circle_members_circle_user_idx').on(t.circleId, t.userId)],
);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id),
  entityId: uuid('entity_id').notNull(),
  entityType: text('entity_type').notNull(),
  reason: text('reason').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'followsAsFollower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'followsAsFollowing',
  }),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, {
    fields: [blocks.blockerId],
    references: [users.id],
    relationName: 'blocksAsBlocker',
  }),
  blocked: one(users, {
    fields: [blocks.blockedId],
    references: [users.id],
    relationName: 'blocksAsBlocked',
  }),
}));

export const mutesRelations = relations(mutes, ({ one }) => ({
  muter: one(users, {
    fields: [mutes.muterId],
    references: [users.id],
    relationName: 'mutesAsMuter',
  }),
  muted: one(users, {
    fields: [mutes.mutedId],
    references: [users.id],
    relationName: 'mutesAsMuted',
  }),
}));

export const restrictsRelations = relations(restricts, ({ one }) => ({
  restricter: one(users, {
    fields: [restricts.restricterId],
    references: [users.id],
    relationName: 'restrictsAsRestricter',
  }),
  restricted: one(users, {
    fields: [restricts.restrictedId],
    references: [users.id],
    relationName: 'restrictsAsRestricted',
  }),
}));

export const circlesRelations = relations(circles, ({ one, many }) => ({
  owner: one(users, {
    fields: [circles.ownerId],
    references: [users.id],
  }),
  members: many(circleMembers),
}));

export const circleMembersRelations = relations(circleMembers, ({ one }) => ({
  circle: one(circles, {
    fields: [circleMembers.circleId],
    references: [circles.id],
  }),
  user: one(users, {
    fields: [circleMembers.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
}));

export const socialRelations = {
  follows: followsRelations,
  blocks: blocksRelations,
  mutes: mutesRelations,
  restricts: restrictsRelations,
  circles: circlesRelations,
  circleMembers: circleMembersRelations,
  reports: reportsRelations,
};
