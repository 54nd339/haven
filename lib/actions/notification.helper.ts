import { eq } from 'drizzle-orm';

import { publishEvent } from '@/lib/ably/server';
import { db } from '@/lib/db';
import { notifications, pushSubscriptions } from '@/lib/db/schema';
import { sendPushNotification } from '@/lib/web-push';

const NOTIFICATION_LABELS: Record<string, string> = {
  reaction: 'reacted to your post',
  comment: 'commented on your post',
  follow: 'started following you',
  follow_request: 'requested to follow you',
  mention: 'mentioned you',
  like: 'liked your post',
};

export async function createNotification(input: {
  recipientId: string;
  actorId: string;
  type: string;
  entityId: string;
  entityType: string;
}) {
  if (input.recipientId === input.actorId) return;

  const [notif] = await db
    .insert(notifications)
    .values({
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      entityId: input.entityId,
      entityType: input.entityType,
    })
    .returning({ id: notifications.id, createdAt: notifications.createdAt });

  await publishEvent(`private-user-${input.recipientId}`, 'new-notification', {
    id: notif!.id,
    type: input.type,
    actorId: input.actorId,
    entityId: input.entityId,
    entityType: input.entityType,
    createdAt: notif!.createdAt,
  }).catch(() => {});

  const subs = await db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, input.recipientId));

  if (subs.length > 0) {
    const body = NOTIFICATION_LABELS[input.type] ?? 'You have a new notification';
    const url = input.entityType === 'post' ? `/post/${input.entityId}` : '/notifications';

    await Promise.allSettled(
      subs.map((sub) => sendPushNotification(sub, { title: 'Haven', body, url, tag: input.type })),
    );
  }
}
