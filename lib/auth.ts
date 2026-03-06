import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import { getUserByClerkId } from '@/lib/db/queries/user.queries';
import { collections, users } from '@/lib/db/schema';

export async function getAuthenticatedUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Unauthorized');

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  return user;
}

/**
 * Like getAuthenticatedUser but creates the DB record from the Clerk session
 * when it doesn't exist yet (handles the webhook race condition during signup).
 */
export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Unauthorized');

  const existing = await getUserByClerkId(clerkId);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Unauthorized');

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

  const [created] = await db
    .insert(users)
    .values({
      clerkId,
      username: clerkUser.username ?? clerkId,
      displayName,
      email,
      avatarUrl: clerkUser.imageUrl,
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    await db.insert(collections).values({
      userId: created.id,
      name: 'Saved',
      isDefault: true,
      order: 0,
    });
    return created;
  }

  const retry = await getUserByClerkId(clerkId);
  if (!retry) throw new Error('User creation failed');
  return retry;
}
