# UploadThing Storage — Tasks

- [ ] Install uploadthing and @uploadthing/react
- [ ] Create UploadThing server file router (app/lib/uploadthing.server.ts)
- [ ] Create API route handler (app/routes/api.uploadthing.ts)
- [ ] Add fileUrl column to models table schema
- [ ] Update upload.tsx to use UploadThing for file uploads
- [ ] Update model-detail.tsx to use fileUrl from DB instead of /api/models/:id/file
- [ ] Update/remove api.models.$id.file.ts (no longer needed for serving)
- [ ] Remove local storage utilities (storage.server.ts)
- [ ] Add UPLOADTHING_TOKEN to .env.example
- [ ] Verify typecheck and build pass