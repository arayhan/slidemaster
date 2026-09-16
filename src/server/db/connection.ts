import "@tanstack/react-start/server-only";

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * The SQLite handle.
 *
 * SLIDEMASTER_DB_PATH and SLIDEMASTER_DECKS_DIR are read here and nowhere a
 * client component can reach — see AGENTS.md hard rule 1. They are never
 * VITE_-prefixed, so they do not reach the browser bundle.
 */
export type Db = Database.Database;

const DEFAULT_DB_PATH = "./db/slidemaster.sqlite";
const DEFAULT_DECKS_DIR = "./decks";

export function dbPath(): string {
  return resolve(process.env.SLIDEMASTER_DB_PATH ?? DEFAULT_DB_PATH);
}

export function decksDir(): string {
  return resolve(process.env.SLIDEMASTER_DECKS_DIR ?? DEFAULT_DECKS_DIR);
}

/**
 * Opened once per process. better-sqlite3 is synchronous and in-process, so
 * there is no pool to manage and no connection to await.
 *
 * Migrations are NOT applied here. docs/rules/sql-and-data.md: nothing may assume
 * a migration has been applied, "not at import time, not on first request". Run
 * `pnpm db:migrate`.
 */
let handle: Db | undefined;

export function getDb(path = dbPath()): Db {
  if (handle) return handle;
  mkdirSync(dirname(path), { recursive: true });
  handle = new Database(path);
  handle.pragma("foreign_keys = ON");
  return handle;
}

/** Opens an independent handle. For tests over a temp database. */
export function openDb(path: string): Db {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("foreign_keys = ON");
  return db;
}
