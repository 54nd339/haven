'use client';

import dynamic from 'next/dynamic';

const CommandPalette = dynamic(
  () => import('@/components/shared/command-palette').then((m) => m.CommandPalette),
  { ssr: false },
);

export function LazyCommandPalette() {
  return <CommandPalette />;
}
