import { ratelimit } from '@/lib/redis';

export async function checkRateLimit(identifier: string) {
  const { success, remaining, reset } = await ratelimit.limit(identifier);

  if (!success) {
    return {
      limited: true as const,
      headers: {
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    };
  }

  return { limited: false as const, remaining };
}
