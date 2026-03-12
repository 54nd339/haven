import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/explore', '/post/*', '/hashtag/*'],
        disallow: [
          '/settings',
          '/messages',
          '/notifications',
          '/drafts',
          '/collections',
          '/vault',
          '/wellbeing',
          '/activity',
          '/api/',
          '/onboarding',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
