'use client';

import { useEffect, useRef } from 'react';
import type { Channel } from 'pusher-js';

import { getPusherClient } from '@/lib/pusher/client';

export function usePusherChannel(
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

    const pusher = getPusherClient();
    const channel: Channel = pusher.subscribe(channelName);

    const handler = (data: unknown) => callbackRef.current(data);
    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
      pusher.unsubscribe(channelName);
    };
  }, [channelName, eventName]);
}
