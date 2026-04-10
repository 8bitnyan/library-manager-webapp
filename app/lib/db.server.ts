import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

import * as schema from '~/db/schema';

const databasePath = process.env.DATABASE_URL ?? 'sqlite.db';
const sqlite = new Database(databasePath, { create: true });
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });
