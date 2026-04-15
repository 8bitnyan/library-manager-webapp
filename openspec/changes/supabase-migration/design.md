# Supabase Migration — Design

## Context
SQLite → Supabase PostgreSQL. Drizzle ORM stays as query layer.

## Decisions

### 1. Database Driver
- Use `drizzle-orm/node-postgres` with `pg` package
- Connection via Supabase connection string (DATABASE_URL env var)
- Connection pooling via Supabase's built-in pooler (port 6543)

### 2. Schema Conversion
- `sqliteTable` → `pgTable`
- `d.text()` stays as `text()`
- `d.integer({ mode: 'timestamp' })` → `d.timestamp()` (native PG timestamps)
- `d.integer({ mode: 'boolean' })` → `d.boolean()`
- `sql\`(unixepoch())\`` → `sql\`now()\`` or `defaultNow()`
- UUID generation: keep `crypto.randomUUID()` as `$defaultFn`

### 3. Dependencies
- Add: `pg`, `@types/pg`
- Remove: (bun:sqlite is a built-in, no dep to remove)
- Keep: `drizzle-orm`, `drizzle-kit`

### 4. Environment
- `DATABASE_URL` → Supabase PostgreSQL connection string
- Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 5. Migration Strategy
- Use `drizzle-kit push` to sync schema to Supabase (no migration files needed for fresh DB)
- Existing SQLite data is not migrated (fresh start on Supabase)

## Risks
- better-auth compatibility with PG via Drizzle — confirmed supported
- Runtime migration script (`migrate-runtime.mjs`) needs updating for PG