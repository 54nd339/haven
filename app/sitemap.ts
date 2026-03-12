import type { MetadataRoute } from 'next';
import { and, desc, eq, isNotNull } from 'drizzle-orm';

import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${appUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  const [publicProfiles, publicPosts] = await Promise.all([
    db
      .select({ username: users.username, updatedAt: users.updatedAt })
      .from(users)
      .where(isNotNull(users.username))
      .orderBy(desc(users.updatedAt))
      .limit(5000),
    db
      .select({ id: posts.id, updatedAt: posts.updatedAt })
      .from(posts)
      .where(and(eq(posts.visibility, 'public'), eq(posts.isDraft, false)))
      .orderBy(desc(posts.updatedAt))
      .limit(10000),
  ]);

  const profileRoutes: MetadataRoute.Sitemap = publicProfiles
    .filter((u) => u.username)
    .map((u) => ({
      url: `${appUrl}/${u.username}`,
      lastModified: u.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const postRoutes: MetadataRoute.Sitemap = publicPosts.map((p) => ({
    url: `${appUrl}/post/${p.id}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...profileRoutes, ...postRoutes];
}
