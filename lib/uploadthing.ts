import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

async function authMiddleware() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return { userId };
}

export const uploadRouter = {
  avatar: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  banner: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  postImage: f({ image: { maxFileSize: '16MB', maxFileCount: 10 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => {
      // TODO: Compute blurhash on upload. Requires fetching the image and decoding
      // (e.g., via sharp or canvas). Defer to avoid heavy server dependencies.
      return { url: file.ufsUrl };
    }),

  storyMedia: f({ image: { maxFileSize: '16MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  chatImage: f({ image: { maxFileSize: '16MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  chatDocument: f({
    pdf: { maxFileSize: '32MB', maxFileCount: 1 },
    'application/msword': { maxFileSize: '32MB', maxFileCount: 1 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  voiceMessage: f({ audio: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;
