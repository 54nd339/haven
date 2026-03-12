import * as Ably from 'ably';

let realtimeInstance: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (realtimeInstance) return realtimeInstance;

  realtimeInstance = new Ably.Realtime({
    authUrl: '/api/ably/auth',
    authMethod: 'GET',
  });

  return realtimeInstance;
}
