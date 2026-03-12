'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { setOnboardingCookie } from '@/lib/actions/user.actions';

export function RedirectHome() {
  const router = useRouter();

  useEffect(() => {
    setOnboardingCookie().then(() => {
      router.push('/');
    });
  }, [router]);

  return (
    <div className="flex items-center gap-2">
      <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
