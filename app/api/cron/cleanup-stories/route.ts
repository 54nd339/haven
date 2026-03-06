import { NextResponse } from 'next/server';
import { and, inArray, isNull, lt } from 'drizzle-orm';

import { db } from '@/lib/db';
import { stories, storyReactions, storyViews } from '@/lib/db/schema';
import { extractFileKey, utapi } from '@/lib/uploadthing/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expired = await db
    .select({ id: stories.id, mediaUrl: stories.mediaUrl })
    .from(stories)
    .where(and(lt(stories.expiresAt, new Date()), isNull(stories.highlightId)));

  if (expired.length === 0) {
    return NextResponse.json({ cleaned: 0 });
  }

  const ids = expired.map((s) => s.id);
  const fileKeys = expired
    .map((s) => extractFileKey(s.mediaUrl))
    .filter((k): k is string => k !== null);

  if (fileKeys.length > 0) {
    await utapi.deleteFiles(fileKeys).catch(() => {});
  }

  await db.delete(storyViews).where(inArray(storyViews.storyId, ids));
  await db.delete(storyReactions).where(inArray(storyReactions.storyId, ids));
  await db.delete(stories).where(inArray(stories.id, ids));

  return NextResponse.json({ cleaned: ids.length });
}
