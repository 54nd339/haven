import { decode } from 'blurhash';

/**
 * Decode a blurhash string to a CSS-compatible data URI for use as placeholder.
 * Used client-side only; returns empty string during SSR (no document/canvas).
 */
export function blurhashToDataURL(hash: string, width = 32, height = 32): string {
  if (!hash) return '';

  try {
    if (typeof document === 'undefined') return '';

    const pixels = decode(hash, width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  } catch {
    return '';
  }
}
