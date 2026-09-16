---
title: How SlideMaster decks work
topic: slidemaster
tags: [meta, getting-started]
---

# How SlideMaster decks work

This directory is the source of truth. The SQLite index is derived from it and
can be thrown away at any time — `pnpm db:rebuild` reconstructs it.

---

## Deck-level frontmatter

`title` and `topic` are required. A deck missing either is skipped by the
indexer, named in the library with the key it is missing, and never guessed at.

`id`, `tags`, `speaker` and `logo` are optional. See
`docs/DESIGN.md` § Deck-level frontmatter for the full contract.

---

## Slides

Slides split on `---`. A slide with no `section:` key is a default content
slide; the seven section types are specified in `docs/DESIGN.md`.

Rendering arrives in Phase 1b. Right now this file exists to be indexed.
