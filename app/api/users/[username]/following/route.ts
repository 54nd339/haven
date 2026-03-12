import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { getFollowing } from '@/lib/db/queries/profile.queries';
import { getUserByUsername } from '@/lib/db/queries/user.queries';

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const following = await getFollowing(user.id);
  return NextResponse.json(following);
}
