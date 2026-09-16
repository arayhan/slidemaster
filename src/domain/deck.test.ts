import { describe, expect, it } from "vitest";

import { parseDeck, slugFromPath } from "./deck";

const base = {
  path: "decks/why-ssr.md",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-16T10:00:00.000Z",
};

const parse = (frontmatter: Record<string, unknown>) => parseDeck({ ...base, frontmatter });

const complete = { title: "Why SSR", topic: "web", tags: ["react", "ssr"] };

describe("required keys", () => {
  // Both sides of the branch that decides whether a deck exists in the library.
  it("indexes a deck that has title and topic", () => {
    const result = parse(complete);
    expect(result.ok).toBe(true);
  });

  it.each([
    ["title", { topic: "web" }, "missing required key: title"],
    ["topic", { title: "Why SSR" }, "missing required key: topic"],
  ])("skips a deck missing %s", (_key, frontmatter, reason) => {
    const result = parse(frontmatter);
    expect(result).toEqual({ ok: false, skipped: { path: base.path, reason } });
  });

  it("names both keys when both are missing", () => {
    const result = parse({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.skipped.reason).toBe("missing required keys: title, topic");
  });

  // The failure this rule exists to prevent: docs/PRODUCT.md forbids inferring a
  // topic, and "decks/web/why-ssr.md" carries exactly what a fallback would take
  // — "why-ssr" for the title, "web" for the topic. The skipped record still
  // names the path, because the UI has to say which file it is.
  it("never falls back to the filename or folder for a missing title or topic", () => {
    const result = parseDeck({ ...base, path: "decks/web/why-ssr.md", frontmatter: {} });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result).not.toHaveProperty("deck");
    expect(Object.keys(result.skipped)).toEqual(["path", "reason"]);
    expect(result.skipped.reason).toBe("missing required keys: title, topic");
  });

  it("treats blank and whitespace-only values as missing", () => {
    expect(parse({ title: "  ", topic: "web" }).ok).toBe(false);
    expect(parse({ title: "Why SSR", topic: "" }).ok).toBe(false);
  });
});

describe("id", () => {
  it("uses an explicit id when the author wrote one", () => {
    const result = parse({ ...complete, id: "ssr-2026" });
    expect(result.ok && result.deck.id).toBe("ssr-2026");
  });

  it("derives the id from the filename when absent", () => {
    const result = parse(complete);
    expect(result.ok && result.deck.id).toBe("why-ssr");
  });

  it("strips directories and the .md suffix", () => {
    expect(slugFromPath("decks/talks/2026/why-ssr.md")).toBe("why-ssr");
    expect(slugFromPath("why-ssr.md")).toBe("why-ssr");
  });
});

describe("tags", () => {
  it("accepts a list", () => {
    const result = parse(complete);
    expect(result.ok && result.deck.tags).toEqual(["react", "ssr"]);
  });

  it("accepts a bare string", () => {
    const result = parse({ ...complete, tags: "react" });
    expect(result.ok && result.deck.tags).toEqual(["react"]);
  });

  it("is empty when absent — never inferred", () => {
    const result = parse({ title: "Why SSR", topic: "web" });
    expect(result.ok && result.deck.tags).toEqual([]);
  });

  it("drops unusable entries rather than stringifying them", () => {
    const result = parse({ ...complete, tags: ["react", { nope: 1 }, null, "  "] });
    expect(result.ok && result.deck.tags).toEqual(["react"]);
  });

  it("deduplicates and sorts, so tag order in the file does not churn the index", () => {
    const result = parse({ ...complete, tags: ["ssr", "react", "ssr"] });
    expect(result.ok && result.deck.tags).toEqual(["react", "ssr"]);
  });
});

describe("timestamps", () => {
  it("takes them from the filesystem, never from frontmatter", () => {
    const result = parse({ ...complete, created_at: "1999-01-01", updatedAt: "1999-01-01" });
    expect(result.ok && result.deck.createdAt).toBe(base.createdAt);
    expect(result.ok && result.deck.updatedAt).toBe(base.updatedAt);
  });
});
