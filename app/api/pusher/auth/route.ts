import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { getUserByClerkId } from '@/lib/db/queries/user.queries';
import { pusherServer } from '@/lib/pusher/server';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get('socket_id');
  const channel = params.get('channel_name');

  if (!socketId || !channel) {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel, {
    user_id: user.id,
    user_info: {
      username: user.username,
      avatarUrl: user.avatarUrl,
    },
  });

  return NextResponse.json(authResponse);
}
