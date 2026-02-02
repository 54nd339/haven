import { z } from 'zod/v4';

import {
  MAX_IMAGES_PER_POST,
  MAX_POLL_OPTIONS,
  MAX_POST_LENGTH,
  POST_VISIBILITY,
} from '@/lib/constants';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty').max(MAX_POST_LENGTH),
  visibility: z.enum(POST_VISIBILITY),
  circleId: z.string().uuid().nullable().optional(),
  contentWarning: z.string().max(200).nullable().optional(),
  slowModeSeconds: z.number().int().min(0).optional(),
  collabUserId: z.string().uuid().nullable().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        blurhash: z.string().optional(),
      }),
    )
    .max(MAX_IMAGES_PER_POST)
    .optional(),
  poll: z
    .object({
      question: z.string().min(1).max(300),
      options: z.array(z.string().min(1).max(100)).min(2).max(MAX_POLL_OPTIONS),
      expiresInHours: z.number().int().positive().optional(),
    })
    .nullable()
    .optional(),
});

export const editPostSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(MAX_POST_LENGTH),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type EditPostInput = z.infer<typeof editPostSchema>;
