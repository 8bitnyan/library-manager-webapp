import { createUploadthing, type FileRouter } from 'uploadthing/server';

const f = createUploadthing();

export const uploadRouter = {
  modelUploader: f({
    blob: {
      maxFileSize: '128MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, name: file.name, size: file.size };
  }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
