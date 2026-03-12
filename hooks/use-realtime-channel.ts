'use client';

import { useEffect, useRef } from 'react';
import type { Message } from 'ably';

import { getAblyClient } from '@/lib/ably/client';

export function useRealtimeChannel(
  channelName: string | null,
  eventName: string,
  callback: (data: unknown) => void,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!channelName) return;

    const ably = getAblyClient();
    const channel = ably.channels.get(channelName);

    const handler = (message: Message) => callbackRef.current(message.data);
    channel.subscribe(eventName, handler);

    return () => {
      channel.unsubscribe(eventName, handler);
      channel.detach().catch(() => {});
    };
  }, [channelName, eventName]);
}
