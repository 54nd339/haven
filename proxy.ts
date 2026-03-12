import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing(.*)',
  '/api/embed(.*)',
  '/api/qr(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/opengraph-image(.*)',
  '/apple-icon(.*)',
  '/explore',
  '/post/(.*)',
  '/hashtag/(.*)',
  '/((?!settings|messages|notifications|drafts|collections|vault|wellbeing|activity|circles|lists|onboarding)[a-zA-Z0-9_-]+)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const { sessionClaims } = await auth.protect();

  const onboardingComplete =
    (sessionClaims?.metadata as Record<string, unknown>)?.onboardingComplete ||
    request.cookies.get('__haven_onboarded')?.value === '1';

  if (!onboardingComplete && !isOnboardingRoute(request)) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (onboardingComplete && isOnboardingRoute(request)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
