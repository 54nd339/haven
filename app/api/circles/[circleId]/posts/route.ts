import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import { getCirclePosts } from '@/lib/db/queries/circle.queries';
import { getUserByClerkId } from '@/lib/db/queries/user.queries';
import { circleMembers, circles } from '@/lib/db/schema';

export async function GET(req: Request, { params }: { params: Promise<{ circleId: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { circleId } = await params;

  const [circle] = await db.select().from(circles).where(eq(circles.id, circleId));
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  const isOwner = circle.ownerId === user.id;
  const [membership] = await db
    .select()
    .from(circleMembers)
    .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, user.id)));

  if (!isOwner && !membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? '20');

  const result = await getCirclePosts(circleId, cursor, limit);
  return NextResponse.json(result);
}
