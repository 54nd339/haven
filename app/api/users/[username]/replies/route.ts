import { type NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, lt } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import { getUserByUsername } from '@/lib/db/queries/user.queries';
import { comments, posts } from '@/lib/db/schema';

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

  const conditions = [eq(comments.authorId, user.id)];

  if (cursor) {
    conditions.push(lt(comments.createdAt, new Date(cursor)));
  }

  const rawReplies = await db
    .select({
      commentId: comments.id,
      commentContent: comments.content,
      commentCreatedAt: comments.createdAt,
      postId: posts.id,
      postContent: posts.content,
      postContentWarning: posts.contentWarning,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .where(and(...conditions))
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1);

  const hasMore = rawReplies.length > limit;
  const repliesSlice = hasMore ? rawReplies.slice(0, limit) : rawReplies;
  const nextCursor = hasMore
    ? repliesSlice[repliesSlice.length - 1]!.commentCreatedAt.toISOString()
    : null;

  const replies = repliesSlice.map((r) => ({
    id: r.commentId,
    postId: r.postId,
    postContent: r.postContent,
    postContentWarning: r.postContentWarning,
    commentContent: r.commentContent,
    createdAt: r.commentCreatedAt,
  }));

  return NextResponse.json({ replies, nextCursor });
}
