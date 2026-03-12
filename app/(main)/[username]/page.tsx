import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, QrCode } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';

import {
  BadgeList,
  CustomStatus,
  PinnedPosts,
  ProfileHeader,
  ProfilePosts,
  ProfileTabs,
  ProfileViewers,
  StoryHighlights,
} from '@/components/profile';
import { RecordView } from '@/components/profile/record-view';
import { QRCodeDialog } from '@/components/shared/qr-code';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getProfileByUsername } from '@/lib/db/queries/profile.queries';
import {
  getPinnedPosts,
  getStoryHighlights,
  getUserBadges,
} from '@/lib/db/queries/profile-power.queries';
import { getUserByClerkId } from '@/lib/db/queries/user.queries';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username, null);
  if (!profile) return { title: 'User not found' };

  const title = profile.displayName ?? profile.username;
  const description = profile.bio ?? `Profile of ${title} on Haven`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(profile.avatarUrl && {
        images: [{ url: profile.avatarUrl, alt: title }],
      }),
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const { userId: clerkId } = await auth();
  const currentUser = clerkId ? await getUserByClerkId(clerkId) : null;

  const profile = await getProfileByUsername(username, currentUser?.id ?? null);
  if (!profile) return notFound();

  const isSelf = !!currentUser && profile.followStatus === 'self';

  const [pinnedPostsList, badges, highlights] = await Promise.all([
    getPinnedPosts(profile.id),
    getUserBadges(profile.id),
    getStoryHighlights(profile.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-sm">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="text-muted-foreground text-xs">{profile.postCount} posts</p>
        </div>
        <QRCodeDialog username={profile.username}>
          <Button variant="ghost" size="icon-sm" type="button" aria-label="QR code">
            <QrCode className="size-4" />
          </Button>
        </QRCodeDialog>
      </div>

      {currentUser && !isSelf && <RecordView viewedUserId={profile.id} />}
      <ProfileHeader profile={profile} />
      {isSelf && (
        <div className="px-4 pb-2">
          <CustomStatus initialText={profile.statusText} initialEmoji={profile.statusEmoji} />
        </div>
      )}
      <PinnedPosts posts={pinnedPostsList} />
      <BadgeList badges={badges} />
      <StoryHighlights highlights={highlights} isSelf={isSelf} />
      <Separator />

      {currentUser ? (
        <>
          <ProfileTabs
            username={profile.username}
            isSelf={isSelf}
            showReplies={profile.showReplies}
            showReactions={profile.showReactions}
          >
            <ProfilePosts username={profile.username} />
          </ProfileTabs>
          {isSelf && (
            <>
              <Separator />
              <div>
                <h2 className="text-muted-foreground px-4 py-3 text-sm font-medium">
                  Profile viewers
                </h2>
                <ProfileViewers />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <p className="text-muted-foreground text-sm">Sign in to see posts and interact</p>
          <Button asChild size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
