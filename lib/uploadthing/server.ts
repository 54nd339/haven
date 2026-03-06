import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi();

export function extractFileKey(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/');
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}
