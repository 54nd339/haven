import * as Ably from 'ably';

import { env } from '@/lib/env';

const ably = new Ably.Rest(env.ABLY_API_KEY);

export async function publishEvent(channel: string, event: string, data: unknown) {
  await ably.channels.get(channel).publish(event, data);
}

export { ably };
