import { NextResponse } from 'next/server';
import * as Ably from 'ably';
import { auth } from '@clerk/nextjs/server';

import { getUserByClerkId } from '@/lib/db/queries/user.queries';
import { env } from '@/lib/env';

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const ably = new Ably.Rest(env.ABLY_API_KEY);
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: user.id,
  });

  return NextResponse.json(tokenRequest);
}
