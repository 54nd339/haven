import { NextResponse } from 'next/server';
import { and, eq, isNull, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { memories, posts } from '@/lib/db/schema';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const candidates = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.isDraft, false),
        isNull(posts.scheduledAt),
        sql`EXTRACT(MONTH FROM ${posts.createdAt}) = EXTRACT(MONTH FROM NOW())`,
        sql`EXTRACT(DAY FROM ${posts.createdAt}) = EXTRACT(DAY FROM NOW())`,
        sql`EXTRACT(YEAR FROM ${posts.createdAt}) < EXTRACT(YEAR FROM NOW())`,
      ),
    );

  if (candidates.length > 0) {
    await db
      .insert(memories)
      .values(
        candidates.map((c) => ({
          userId: c.authorId,
          postId: c.id,
          originalDate: c.createdAt,
          surfacedAt: new Date(),
        })),
      )
      .onConflictDoNothing();
  }

  return NextResponse.json({ surfaced: candidates.length });
}
