#!/usr/bin/env bun
import path from 'node:path';
import { existsSync } from 'node:fs';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

if (process.env.SKIP_DB_MIGRATE_ON_START === '1') {
  process.exit(0);
}

const migrationsFolder = path.join(process.cwd(), 'drizzle');

if (!existsSync(migrationsFolder)) {
  console.error(`[migrate-runtime] Missing migrations folder: ${migrationsFolder}`);
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
  console.log('[migrate-runtime] Migrations applied (or already up to date).');
} finally {
  await pool.end();
}