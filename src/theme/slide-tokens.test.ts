import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Guards the slide design system against silent drift.
 *
 * `src/theme/slide-tokens.css` and the token block inside
 * `docs/references/template-mockup.html` are two copies of the same data. The
 * mockup is what a human signs `1a-gate-template` from; the CSS is what Phase 1b
 * builds against. Tune a token in one and not the other and nothing errors — the
 * gate approves a mockup that no longer describes what gets built, and it
 * surfaces weeks later as "the slides don't look like the mockup".
 *
 * These assertions were the one-shot `node -e` acceptance criteria 4 and 5 in
 * `docs/tasks/1a-step-02-template-spec.md`. They are tests now so they keep
 * running. Keep the extraction regex identical to that file's, or the task and
 * the test will disagree about what "identical" means.
 *
 * NOTE: `docs/rules/testing.md` says to mock the filesystem. Not here — these
 * files ARE the subject under test. Mocking them would assert that two fixtures
 * match each other, which they always would. Do not "fix" this.
 */

// Resolved from this file, not from process.cwd(), so the test reads the same
// paths whoever runs it and from wherever.
const repoRoot = new URL("../../", import.meta.url);
const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, repoRoot), "utf8");

const TOKEN_CSS = "src/theme/slide-tokens.css";
const MOCKUP = "docs/references/template-mockup.html";
const DESIGN = "docs/DESIGN.md";

/**
 * Comments must go before anything is extracted.
 *
 * `1a-step-02-template-spec.md` acceptance criteria 4 and 5 match over the raw
 * text, and that is a bug in those criteria. `slide-tokens.css:69` explains one
 * token by naming another — "Not the same value as --slide-on-paper-accent:
 * cobalt on near-black is 3.1:1" — so the pattern matches inside the comment and
 * its `[^;]+` then runs past `*∕` and eats the real declaration that follows.
 * That hid a token from the comparison while keeping both counts at 74, which is
 * exactly the kind of agreement-for-the-wrong-reason this file exists to catch.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "");

/** Otherwise as 1a-step-02-template-spec.md acceptance criterion 4. */
const tokenDeclarations = (source: string) =>
  [...stripComments(source).matchAll(/(--slide-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(
    ([, name, value]) => `${name} = ${value.trim().replace(/\s+/g, " ")}`,
  );

describe("slide token parity", () => {
  const css = tokenDeclarations(read(TOKEN_CSS));
  const mockup = tokenDeclarations(read(MOCKUP));

  it("finds tokens in both files", () => {
    // A regex that silently stops matching would make every other case here
    // pass against two empty arrays.
    expect(css.length).toBeGreaterThan(0);
    expect(mockup.length).toBe(css.length);
  });

  it("declares no token in the CSS that the mockup is missing", () => {
    expect(css.filter((declaration) => !mockup.includes(declaration))).toEqual(
      [],
    );
  });

  it("declares no token in the mockup that the CSS is missing", () => {
    expect(mockup.filter((declaration) => !css.includes(declaration))).toEqual(
      [],
    );
  });
});

describe("the mockup uses only tokens", () => {
  const source = read(MOCKUP);
  const markerAt = source.indexOf("TOKENS:END");

  it("carries the TOKENS:END marker the checks anchor on", () => {
    expect(markerAt).toBeGreaterThan(-1);
  });

  // Comments stripped for the same reason as above: a hex quoted in prose is
  // documentation, not a styling decision that bypassed the tokens.
  const body = stripComments(source.slice(markerAt));

  it("has no raw colour outside the token block", () => {
    expect(body.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });

  it("has no raw length outside the token block", () => {
    expect(body.match(/\b\d+(\.\d+)?px\b/g) ?? []).toEqual([]);
  });
});

describe("DESIGN.md specifies every section type", () => {
  // Scoped to the section-anatomy chapter, not the whole file. DESIGN.md has
  // other chapters with key tables and absent-field rules — deck-level
  // frontmatter is one — and counting file-wide makes this fail whenever one is
  // added, which says nothing about the seven section types.
  const design = (() => {
    const all = read(DESIGN);
    const start = all.indexOf("## Section anatomy");
    const end = all.indexOf("\n## ", start + 1);
    return all.slice(start, end === -1 ? undefined : end);
  })();
  const count = (pattern: RegExp) => (design.match(pattern) ?? []).length;

  it("finds the section-anatomy chapter to scope to", () => {
    expect(design).toContain("## Section anatomy");
  });

  // Seven section types: title, profile, intermezzo, quote, references,
  // contact, closing. A type specified without an absent-field list is the gap
  // that lets 1b invent content, which docs/PRODUCT.md forbids.
  it("gives all seven a heading, a key table, and an absent-field list", () => {
    expect(count(/^### [1-7]\. /gm)).toBe(7);
    expect(count(/^\| Key \| Required \| Renders as \|$/gm)).toBe(7);
    expect(count(/Absent-field behaviour/g)).toBe(7);
  });

  it("specifies the default content slide", () => {
    expect(count(/^### Default content slide/gm)).toBe(1);
  });
});
