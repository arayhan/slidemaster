#!/usr/bin/env node
/**
 * Applies db/migrations/NNN_name.sql in filename order.
 *
 * Lives in scripts/ rather than .claude/scripts/ because a migration runner is
 * tooling the *product* needs, which is the line docs/architecture.md draws —
 * and `pnpm db:migrate` needs a package.json entry either way.
 *
 * Migrations are forward-only and run manually. Nothing in the app may assume
 * one has been applied (docs/rules/sql-and-data.md).
 *
 *   node scripts/db-migrate.mjs           apply what has not been applied
 *   node scripts/db-migrate.mjs --rebuild delete the database first
 */
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const dbPath = resolve(repoRoot, process.env.SLIDEMASTER_DB_PATH ?? "./db/slidemaster.sqlite");
const migrationsDir = join(repoRoot, "db", "migrations");
const rebuild = process.argv.includes("--rebuild");

if (rebuild && existsSync(dbPath)) {
  rmSync(dbPath);
  console.log(`dropped ${dbPath}`);
}

mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

// The ledger is itself a migration-free table: it must exist before the first
// migration can be recorded, so it is created here rather than in 001.
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`);

const applied = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((r) => r.name));
const pending = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .filter((f) => !applied.has(f));

if (pending.length === 0) {
  console.log(`up to date (${applied.size} applied) — ${dbPath}`);
  process.exit(0);
}

const record = db.prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)");
for (const name of pending) {
  const sql = readFileSync(join(migrationsDir, name), "utf8");
  // Each migration is one transaction: a half-applied schema file is worse than
  // an unapplied one, because the next run would replay the half that worked.
  db.transaction(() => {
    db.exec(sql);
    record.run(name, new Date().toISOString());
  })();
  console.log(`applied ${name}`);
}

console.log(`${pending.length} applied — ${dbPath}`);
