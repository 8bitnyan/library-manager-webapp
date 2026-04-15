# UploadThing File Storage Integration

## Problem
3D model files are stored on the local filesystem (`storage/models/`). This doesn't work for cloud deployments and limits scalability.

## Proposed Solution
Replace local file storage with UploadThing for cloud-based file uploads and serving.

## Scope
- Replace local `saveModelFile` with UploadThing upload
- Replace local `readModelFile` / file serving API with UploadThing URLs
- Store UploadThing file URL in database instead of reading from disk
- Remove local filesystem storage code
- Keep existing upload form UX (or enhance with UploadThing components)

## Out of Scope
- Database changes (already on Supabase)
- Auth changes
- 3D viewer changes (just swap the URL source)