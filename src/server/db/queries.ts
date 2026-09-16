import "@tanstack/react-start/server-only";

import type { Deck } from "@/domain";

import type { Db } from "./connection";

/**
 * Hand-written parameterised SQL. No ORM, no query builder
 * (docs/rules/sql-and-data.md). Every statement binds its parameters; nothing is
 * interpolated into SQL, ever.
 */

/** Columns named explicitly — SELECT * returns whatever the schema holds today. */
const DECK_COLUMNS = "id, title, topic, path, created_at, updated_at";

interface DeckRow {
  id: string;
  title: string;
  topic: string;
  path: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_LIMIT = 500;

/**
 * Every list query has a limit (docs/rules/sql-and-data.md), including this one,
 * even though a personal deck library is tens of rows. The day it is not, the
 * limit is already here.
 */
export function listDecks(db: Db, limit = DEFAULT_LIMIT): Deck[] {
  const rows = db
    .prepare<[number], DeckRow>(
      `SELECT ${DECK_COLUMNS} FROM decks ORDER BY topic ASC, updated_at DESC LIMIT ?`,
    )
    .all(limit);

  const tags = db
    .prepare<[], { deck_id: string; tag: string }>(
      "SELECT deck_id, tag FROM tags ORDER BY tag ASC",
    )
    .all();

  const byDeck = new Map<string, string[]>();
  for (const { deck_id, tag } of tags) {
    const existing = byDeck.get(deck_id);
    if (existing) existing.push(tag);
    else byDeck.set(deck_id, [tag]);
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    topic: row.topic,
    path: row.path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: byDeck.get(row.id) ?? [],
  }));
}

export function deckPaths(db: Db): Map<string, string> {
  const rows = db.prepare<[], { id: string; path: string }>("SELECT id, path FROM decks").all();
  return new Map(rows.map((row) => [row.id, row.path]));
}

/**
 * Insert or update one deck and replace its tags.
 *
 * Writes more than one row and must be all-or-nothing, so it runs in a
 * transaction — a deck whose tags half-updated is a lie the UI cannot detect.
 * The caller wraps batches of these in an outer transaction; better-sqlite3
 * nests them as savepoints.
 */
export function upsertDeck(db: Db, deck: Deck): void {
  const write = db.transaction((d: Deck) => {
    db.prepare(
      `INSERT INTO decks (id, title, topic, path, created_at, updated_at)
       VALUES (@id, @title, @topic, @path, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         topic = excluded.topic,
         path = excluded.path,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at`,
    ).run(d);

    db.prepare("DELETE FROM tags WHERE deck_id = ?").run(d.id);
    const insertTag = db.prepare("INSERT INTO tags (deck_id, tag) VALUES (?, ?)");
    for (const tag of d.tags) insertTag.run(d.id, tag);
  });

  write(deck);
}

/** Tags go with it — the schema cascades, so this is one statement. */
export function deleteDeck(db: Db, id: string): void {
  db.prepare("DELETE FROM decks WHERE id = ?").run(id);
}
