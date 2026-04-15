# Supabase Migration — Tasks

## Tasks
- [ ] Install `pg` and `@types/pg` dependencies
- [ ] Convert schema.ts from sqliteTable to pgTable with PG types
- [ ] Update db.server.ts to use node-postgres + drizzle-orm/node-postgres
- [ ] Update drizzle.config.ts for PostgreSQL dialect
- [ ] Update migrate-runtime.mjs for PostgreSQL
- [ ] Add .env with DATABASE_URL placeholder
- [ ] Update auth.server.ts if any SQLite-specific config exists
- [ ] Run drizzle-kit push to verify schema syncs to Supabase
- [ ] Verify app builds and runs without errors