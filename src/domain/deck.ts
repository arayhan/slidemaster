// The deck vocabulary. See docs/DESIGN.md § Deck-level frontmatter.
//
// Pure: no filesystem, no database, no clock. Reading files is src/server/'s job
// and domain/ is the bottom of the import graph — it must not import upward.

/** A deck that indexes. Every field here came from the author, not from us. */
export interface Deck {
  id: string;
  title: string;
  topic: string;
  /** Repo-relative, forward slashes, stable across platforms. */
  path: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** A deck file that could not be indexed, and the reason, for the UI to show. */
export interface SkippedDeck {
  path: string;
  reason: string;
}

export const REQUIRED_KEYS = ["title", "topic"] as const;

/**
 * `decks/talks/why-ssr.md` -> `why-ssr`.
 *
 * Only used when frontmatter carries no explicit `id`. Renaming such a file
 * changes its id and the deck reads as a new one — which is why DESIGN.md tells
 * an author who renames freely to write the id down.
 */
export function slugFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.md$/i, "");
}

/** Frontmatter is whatever YAML the author wrote. Assume nothing. */
type Frontmatter = Record<string, unknown>;

const asString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  // A YAML date or number in `title:` is still a title the author typed.
  if (typeof value === "number" || value instanceof Date) return String(value);
  return undefined;
};

/**
 * `tags: [a, b]` and `tags: a` are both reasonable things to write, so both
 * work. Anything unusable is dropped rather than stringified — a tag reading
 * "[object Object]" is worse than no tag.
 */
const asTags = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const seen = new Set<string>();
  for (const entry of raw) {
    const tag = asString(entry);
    if (tag) seen.add(tag);
  }
  return [...seen].sort();
};

export interface ParseInput {
  /** Repo-relative path with forward slashes. */
  path: string;
  frontmatter: Frontmatter;
  /** Filesystem times, ISO-8601 UTC. Never from frontmatter — see DESIGN.md. */
  createdAt: string;
  updatedAt: string;
}

export type ParseResult =
  | { ok: true; deck: Deck }
  | { ok: false; skipped: SkippedDeck };

/**
 * Validate one deck's frontmatter.
 *
 * Missing `title` or `topic` skips the file rather than inventing a value from
 * the filename or the parent folder. docs/PRODUCT.md forbids the guess, and the
 * guess is the failure that never announces itself.
 */
export function parseDeck({ path, frontmatter, createdAt, updatedAt }: ParseInput): ParseResult {
  const missing = REQUIRED_KEYS.filter((key) => asString(frontmatter[key]) === undefined);
  if (missing.length > 0) {
    return {
      ok: false,
      skipped: {
        path,
        reason: `missing required ${missing.length === 1 ? "key" : "keys"}: ${missing.join(", ")}`,
      },
    };
  }

  return {
    ok: true,
    deck: {
      id: asString(frontmatter.id) ?? slugFromPath(path),
      title: asString(frontmatter.title)!,
      topic: asString(frontmatter.topic)!,
      path,
      tags: asTags(frontmatter.tags),
      createdAt,
      updatedAt,
    },
  };
}
