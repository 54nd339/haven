'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth, clerkClient } from '@clerk/nextjs/server';

import { getOrCreateUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUserByClerkId, isUsernameTaken } from '@/lib/db/queries/user.queries';
import { userInterests, users } from '@/lib/db/schema';
import { type OnboardingInput, onboardingSchema } from '@/lib/validators/user';

export async function completeOnboarding(input: OnboardingInput) {
  const user = await getOrCreateUser();
  const validated = onboardingSchema.parse(input);

  const taken = await isUsernameTaken(validated.username, user.id);
  if (taken) throw new Error('Username is already taken');

  await db
    .update(users)
    .set({
      username: validated.username,
      displayName: validated.displayName,
      bio: validated.bio,
      onboardingComplete: true,
    })
    .where(eq(users.id, user.id));

  if (validated.interests.length > 0) {
    await db.insert(userInterests).values(
      validated.interests.map((interest) => ({
        userId: user.id,
        interest,
      })),
    );
  }

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(user.clerkId, {
    publicMetadata: { onboardingComplete: true },
  });

  const cookieStore = await cookies();
  cookieStore.set('__haven_onboarded', '1', {
    maxAge: 86400,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  revalidatePath('/');
  return { success: true };
}

export async function setOnboardingCookie() {
  const cookieStore = await cookies();
  cookieStore.set('__haven_onboarded', '1', {
    maxAge: 86400,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function checkUsernameAvailability(username: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Unauthorized');

  const user = await getUserByClerkId(clerkId);
  const taken = await isUsernameTaken(username, user?.id);

  return { available: !taken };
}
