'use client';

import { useMemo } from 'react';
import Image, { type ImageProps } from 'next/image';

import { blurhashToDataURL } from '@/lib/blurhash';

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  blurhash?: string | null;
}

export function OptimizedImage({ blurhash, alt, ...props }: OptimizedImageProps) {
  const blurDataURL = useMemo(
    () => (blurhash ? blurhashToDataURL(blurhash) : undefined),
    [blurhash],
  );

  return (
    <Image
      alt={alt}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      {...props}
    />
  );
}
