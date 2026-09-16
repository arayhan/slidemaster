// No server-only marker here, deliberately. This module defines a server
// function, and a server function exists to be CALLED from the client — the
// route imports this file and the plugin strips the handler body out of the
// client bundle. Marking the whole file server-only makes the build refuse the
// import, which is what it did the first time.
//
// The boundary is one level down: everything under src/server/db/ carries the
// marker, and nothing in the client graph may reach it.
import { createServerFn } from "@tanstack/react-start";

import type { Deck, SkippedDeck } from "@/domain";

import { decksDir, getDb } from "./db/connection";
import { listDecks } from "./db/queries";
import { reconcile } from "./db/reconcile";

export interface Library {
  decks: Deck[];
  skipped: SkippedDeck[];
}

/**
 * The library, reconciled then read.
 *
 * It reconciles on every call rather than trusting whatever rows are there.
 * project-gotchas silent trap 4: a session that edited .md files outside the
 * running app shows stale data until reconcile runs, and stale is the failure
 * mode nobody notices. A personal library is tens of files — the walk is cheap
 * and correctness is not negotiable. A watcher replaces this in Phase 1b.
 */
export const getLibrary = createServerFn({ method: "GET" }).handler(async (): Promise<Library> => {
  const db = getDb();
  const { skipped } = reconcile(db, decksDir());
  return { decks: listDecks(db), skipped };
});
