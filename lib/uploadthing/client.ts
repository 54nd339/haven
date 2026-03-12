import { generateReactHelpers } from '@uploadthing/react';

import type { AppFileRouter } from './router';

export const { useUploadThing } = generateReactHelpers<AppFileRouter>();
