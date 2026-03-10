import { z } from 'zod/v4';

import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH, MAX_USERNAME_LENGTH } from '@/lib/constants';

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(MAX_USERNAME_LENGTH, `Username must be at most ${MAX_USERNAME_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  displayName: z.string().min(1, 'Display name is required').max(MAX_DISPLAY_NAME_LENGTH),
  bio: z.string().max(MAX_BIO_LENGTH),
  interests: z.array(z.string().min(1)).max(10),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
