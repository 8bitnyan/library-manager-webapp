#!/usr/bin/env bun
import path from 'node:path';
import { existsSync } from 'node:fs';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

if (process.env.SKIP_DB_MIGRATE_ON_START === '1') {
  process.exit(0);
}

const databasePath = process.env.DATABASE_URL ?? 'sqlite.db';
const migrationsFolder = path.join(process.cwd(), 'drizzle');

if (!existsSync(migrationsFolder)) {
  console.error(
    `[migrate-runtime] Missing migrations folder: ${migrationsFolder}`,
  );
  process.exit(1);
}

const sqlite = new Database(databasePath, { create: true });
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

try {
  const db = drizzle(sqlite);
  migrate(db, { migrationsFolder });
  console.log('[migrate-runtime] Migrations applied (or already up to date).');
} finally {
  sqlite.close();
}
