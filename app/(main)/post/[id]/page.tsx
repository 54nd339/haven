import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';

import { CommentThread } from '@/components/comments';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCommentsForPost, getPostById } from '@/lib/db/queries/comment.queries';
import { getUserByClerkId } from '@/lib/db/queries/user.queries';

import { PostDetailCard } from './post-detail-card';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: 'Post not found' };

  const contentSlice = post.content.slice(0, 60);
  const title = `${contentSlice}${post.content.length > 60 ? '...' : ''}`;
  const description = post.content.slice(0, 160) + (post.content.length > 160 ? '...' : '');

  const images: Array<{ url: string; alt?: string }> = [];
  if (post.media?.length) {
    images.push(...post.media.slice(0, 4).map((m) => ({ url: m.url })));
  }
  if (post.linkPreview?.imageUrl && images.length < 4) {
    images.push({ url: post.linkPreview.imageUrl });
  }

  const ogTitle = `${title} | Haven`;
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      ...(images.length > 0 && { images }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const { userId: clerkId } = await auth();
  const user = clerkId ? await getUserByClerkId(clerkId) : null;

  const post = await getPostById(id, user?.id);
  if (!post) return notFound();

  if (post.visibility !== 'public' && !user) return notFound();

  const comments = user ? await getCommentsForPost(id, user.id) : [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-sm">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Post</h1>
      </div>

      <PostDetailCard post={post} currentUserId={user?.id ?? null} />
      <Separator />

      {user ? (
        <div id="comments-section">
          <CommentThread postId={id} initialComments={comments} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <p className="text-muted-foreground text-sm">Sign in to join the conversation</p>
          <Button asChild size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
