import { type NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, lt } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import { getUserByUsername } from '@/lib/db/queries/user.queries';
import { posts, reactions } from '@/lib/db/schema';

const LIMIT = 20;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Math.min(Number(searchParams.get('limit') ?? LIMIT), 50);

  const conditions = [eq(reactions.userId, user.id), eq(reactions.entityType, 'post')];

  if (cursor) {
    conditions.push(lt(reactions.createdAt, new Date(cursor)));
  }

  const rawReactions = await db
    .select({
      reactionId: reactions.id,
      reactionType: reactions.reactionType,
      reactionCreatedAt: reactions.createdAt,
      postId: posts.id,
      postContent: posts.content,
      postContentWarning: posts.contentWarning,
    })
    .from(reactions)
    .innerJoin(posts, eq(reactions.entityId, posts.id))
    .where(and(...conditions))
    .orderBy(desc(reactions.createdAt))
    .limit(limit + 1);

  const hasMore = rawReactions.length > limit;
  const reactionsSlice = hasMore ? rawReactions.slice(0, limit) : rawReactions;
  const nextCursor = hasMore
    ? reactionsSlice[reactionsSlice.length - 1]!.reactionCreatedAt.toISOString()
    : null;

  const reactionItems = reactionsSlice.map((r) => ({
    id: r.reactionId,
    postId: r.postId,
    postContent: r.postContent,
    postContentWarning: r.postContentWarning,
    reactionType: r.reactionType,
    createdAt: r.reactionCreatedAt,
  }));

  return NextResponse.json({ reactions: reactionItems, nextCursor });
}
