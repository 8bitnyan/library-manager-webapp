# Supabase PostgreSQL Migration

## Problem
The app currently uses SQLite (bun:sqlite) with Drizzle ORM. This causes:
- FOREIGN KEY constraint errors in production (e.g. categories.tsx:42)
- No cloud-native database support
- Limited concurrent access

## Proposed Solution
Migrate from SQLite to Supabase PostgreSQL while keeping Drizzle ORM as the query layer.

## Scope
- Swap Drizzle dialect from `sqlite` to `pg` (PostgreSQL)
- Replace `bun:sqlite` driver with `postgres` (node-postgres) or Supabase's connection pooler
- Convert all schema definitions from `sqliteTable` to `pgTable`
- Update drizzle.config.ts for PostgreSQL
- Update all SQLite-specific SQL expressions (e.g. `unixepoch()`) to PostgreSQL equivalents
- Keep better-auth as authentication layer
- Keep local file storage (UploadThing migration is a separate future task)

## Out of Scope
- File storage migration (future: UploadThing)
- Auth migration (keeping better-auth)
- Schema redesign beyond dialect conversion