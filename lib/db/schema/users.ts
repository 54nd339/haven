import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  bannerUrl: text('banner_url'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  statusText: text('status_text'),
  statusEmoji: text('status_emoji'),
  isPrivate: boolean('is_private').default(false).notNull(),
  profileViewsEnabled: boolean('profile_views_enabled').default(true).notNull(),
  zenMode: boolean('zen_mode').default(false).notNull(),
  incognitoMode: boolean('incognito_mode').default(false).notNull(),
  quietHoursStart: text('quiet_hours_start'),
  quietHoursEnd: text('quiet_hours_end'),
  dailyLimitMinutes: integer('daily_limit_minutes'),
  breakReminderMinutes: integer('break_reminder_minutes'),
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userInterests = pgTable('user_interests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  interest: text('interest').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  badgeType: text('badge_type').notNull(),
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const profileViews = pgTable(
  'profile_views',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    viewerId: uuid('viewer_id')
      .notNull()
      .references(() => users.id),
    viewedUserId: uuid('viewed_user_id')
      .notNull()
      .references(() => users.id),
    viewedAt: timestamp('viewed_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('profile_views_viewer_viewed_idx').on(table.viewerId, table.viewedUserId),
  ],
);

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  interests: many(userInterests),
  badges: many(userBadges),
  profileViewsAsViewer: many(profileViews, {
    relationName: 'viewerProfileViews',
  }),
  profileViewsAsViewed: many(profileViews, {
    relationName: 'viewedProfileViews',
  }),
  pushSubscriptions: many(pushSubscriptions),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
  viewer: one(users, {
    fields: [profileViews.viewerId],
    references: [users.id],
    relationName: 'viewerProfileViews',
  }),
  viewedUser: one(users, {
    fields: [profileViews.viewedUserId],
    references: [users.id],
    relationName: 'viewedProfileViews',
  }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));
