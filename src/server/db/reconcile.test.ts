import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { openDb, type Db } from "./connection";
import { listDecks } from "./queries";
import { reconcile } from "./reconcile";

/**
 * The expensive bug, made impossible.
 *
 * docs/rules/testing.md: "the decks / tags tables are a pure derived view of the
 * files under SLIDEMASTER_DECKS_DIR. After any reconcile, the set of decks rows
 * equals the set of deck .md files exactly." Nothing errors when this breaks —
 * it surfaces when a talk is opened in front of an audience.
 *
 * Real filesystem, real SQLite, temp dirs. The filesystem is the subject here,
 * not a boundary to mock: a mocked readdir would assert that the mock agrees
 * with itself.
 */

const MIGRATION = resolve(import.meta.dirname, "../../../db/migrations/001_decks.sql");

let root: string;
let db: Db;

const migrate = (database: Db) => database.exec(readFileSync(MIGRATION, "utf8"));

const deck = (frontmatter: Record<string, unknown>) => {
  const lines = Object.entries(frontmatter).map(([key, value]) =>
    Array.isArray(value) ? `${key}: [${value.join(", ")}]` : `${key}: ${value}`,
  );
  return `---\n${lines.join("\n")}\n---\n\n# Slide one\n`;
};

const write = (relativePath: string, frontmatter: Record<string, unknown>) => {
  const full = join(root, relativePath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, deck(frontmatter));
};

const rows = () => listDecks(db);

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "slidemaster-decks-"));
  db = openDb(join(mkdtempSync(join(tmpdir(), "slidemaster-db-")), "test.sqlite"));
  migrate(db);
});

afterEach(() => {
  db.close();
  rmSync(root, { recursive: true, force: true });
});

describe("reconcile", () => {
  it("indexes an added file with its topic and tags", () => {
    write("why-ssr.md", { title: "Why SSR", topic: "web", tags: ["react", "ssr"] });

    const result = reconcile(db, root);

    expect(result).toEqual({ indexed: 1, skipped: [] });
    expect(rows()).toEqual([
      expect.objectContaining({
        id: "why-ssr",
        title: "Why SSR",
        topic: "web",
        path: "why-ssr.md",
        tags: ["react", "ssr"],
      }),
    ]);
  });

  it("keeps the id and updates the path when a file moves", () => {
    write("why-ssr.md", { id: "ssr-2026", title: "Why SSR", topic: "web" });
    reconcile(db, root);

    rmSync(join(root, "why-ssr.md"));
    write("talks/why-ssr.md", { id: "ssr-2026", title: "Why SSR", topic: "web" });
    reconcile(db, root);

    const all = rows();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id: "ssr-2026", path: "talks/why-ssr.md" });
  });

  it("removes the row and its tags when a file is deleted", () => {
    write("why-ssr.md", { title: "Why SSR", topic: "web", tags: ["react"] });
    reconcile(db, root);
    expect(rows()).toHaveLength(1);

    rmSync(join(root, "why-ssr.md"));
    reconcile(db, root);

    expect(rows()).toEqual([]);
    // The cascade is the half of the invariant nothing in the UI would reveal.
    expect(db.prepare("SELECT COUNT(*) AS n FROM tags").get()).toEqual({ n: 0 });
  });

  it("reflects an edited topic, title and tag set", () => {
    write("why-ssr.md", { title: "Why SSR", topic: "web", tags: ["react"] });
    reconcile(db, root);

    write("why-ssr.md", { title: "Why Server Rendering", topic: "architecture", tags: ["ssr"] });
    reconcile(db, root);

    expect(rows()[0]).toMatchObject({
      title: "Why Server Rendering",
      topic: "architecture",
      tags: ["ssr"],
    });
  });

  it("leaves no orphan row after a rename that changes the derived id", () => {
    write("why-ssr.md", { title: "Why SSR", topic: "web" });
    reconcile(db, root);

    rmSync(join(root, "why-ssr.md"));
    write("why-server-rendering.md", { title: "Why SSR", topic: "web" });
    reconcile(db, root);

    expect(rows().map((d) => d.id)).toEqual(["why-server-rendering"]);
  });

  it("yields identical rows whether rebuilt from empty or reconciled incrementally", () => {
    write("a.md", { title: "A", topic: "web", tags: ["x"] });
    reconcile(db, root);
    write("b.md", { title: "B", topic: "tools", tags: ["y", "z"] });
    rmSync(join(root, "a.md"));
    write("c.md", { title: "C", topic: "web" });
    const incremental = reconcile(db, root);

    const fresh = openDb(join(mkdtempSync(join(tmpdir(), "slidemaster-db-")), "rebuild.sqlite"));
    migrate(fresh);
    const rebuilt = reconcile(fresh, root);

    expect(incremental).toEqual(rebuilt);
    expect(rows()).toEqual(listDecks(fresh));
    fresh.close();
  });

  it("skips a deck missing a required key and indexes the rest", () => {
    write("good.md", { title: "Good", topic: "web" });
    write("draft.md", { title: "Draft" });

    const result = reconcile(db, root);

    expect(result.indexed).toBe(1);
    expect(result.skipped).toEqual([{ path: "draft.md", reason: "missing required key: topic" }]);
    expect(rows().map((d) => d.id)).toEqual(["good"]);
  });

  it("treats a missing decks directory as an empty library, not a crash", () => {
    const result = reconcile(db, join(root, "does-not-exist"));
    expect(result).toEqual({ indexed: 0, skipped: [] });
  });

  it("holds rows == files across a random sequence of operations", () => {
    // The property the five cases above each check one slice of.
    const names = ["a", "b", "c", "d"];
    const live = new Set<string>();
    let seed = 7;
    const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648);

    for (let step = 0; step < 40; step += 1) {
      const name = names[next() % names.length];
      if (live.has(name)) {
        if (next() % 2 === 0) {
          rmSync(join(root, `${name}.md`));
          live.delete(name);
        } else {
          write(`${name}.md`, { title: name.toUpperCase(), topic: `t${next() % 3}` });
        }
      } else {
        write(`${name}.md`, { title: name.toUpperCase(), topic: `t${next() % 3}` });
        live.add(name);
      }

      reconcile(db, root);
      expect(rows().map((d) => d.id).sort()).toEqual([...live].sort());
    }
  });
});
