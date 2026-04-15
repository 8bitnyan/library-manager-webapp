import { generateReactHelpers } from '@uploadthing/react';
import type { UploadRouter } from '~/lib/uploadthing.server';

export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadRouter>({
  url: '/api/uploadthing',
});
