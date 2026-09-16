import "@tanstack/react-start/server-only";

import matter from "gray-matter";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import type { Deck, SkippedDeck } from "@/domain";
import { parseDeck } from "@/domain";

import type { Db } from "./connection";
import { deckPaths, deleteDeck, upsertDeck } from "./queries";

/**
 * Makes the index match the filesystem exactly.
 *
 * THE INVARIANT (docs/rules/testing.md): after this returns, the set of `decks`
 * rows equals the set of indexable deck files — no orphan rows, no stale path,
 * topic or updated_at. A full rebuild from empty yields identical rows to an
 * incremental run over the same tree. Break it and the library shows renamed or
 * deleted decks with no error, which surfaces in front of an audience.
 */

export interface ReconcileResult {
  indexed: number;
  skipped: SkippedDeck[];
}

/** Repo-relative, forward slashes, so an index built on Windows matches one built elsewhere. */
const toPosix = (path: string) => path.split(sep).join("/");

function deckFiles(root: string): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      // Dotfiles are editor and OS noise, never decks.
      if (entry.name.startsWith(".")) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) found.push(full);
    }
  };
  try {
    walk(root);
  } catch (error) {
    // No decks directory is an empty library, not a crash. Anything else is real.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return found.sort();
}

function readDeck(absolutePath: string, root: string): ReturnType<typeof parseDeck> {
  const stats = statSync(absolutePath);
  const { data } = matter(readFileSync(absolutePath, "utf8"));
  return parseDeck({
    path: toPosix(relative(root, absolutePath)),
    frontmatter: data,
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString(),
  });
}

export function reconcile(db: Db, root: string): ReconcileResult {
  const decks: Deck[] = [];
  const skipped: SkippedDeck[] = [];

  for (const file of deckFiles(root)) {
    let result: ReturnType<typeof parseDeck>;
    try {
      result = readDeck(file, root);
    } catch (error) {
      // Unreadable or malformed YAML is one bad deck, not a dead library.
      skipped.push({
        path: toPosix(relative(root, file)),
        reason: error instanceof Error ? error.message : "could not be read",
      });
      continue;
    }
    if (result.ok) decks.push(result.deck);
    else skipped.push(result.skipped);
  }

  // One transaction: a half-reconciled index is precisely the drift this exists
  // to prevent, and a caller that crashed mid-run would leave one behind.
  db.transaction(() => {
    const live = new Set(decks.map((deck) => deck.id));
    for (const id of deckPaths(db).keys()) {
      if (!live.has(id)) deleteDeck(db, id);
    }
    for (const deck of decks) upsertDeck(db, deck);
  })();

  return { indexed: decks.length, skipped };
}
