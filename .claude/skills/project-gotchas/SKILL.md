---
name: project-gotchas
description: Non-negotiable traps for SlideMaster — the invariants and content rules that fail silently. Every agent loads this once per session before touching source.
---

# SlideMaster — non-negotiable traps

**Not filled in yet.** Run `/bootstrap-project` in a Claude Code session at the repo root to interview for this content, or fill it in by hand. The short version of whatever lands here also belongs in `.claude/hooks/inject-gotchas.ps1`'s `$lines` array, so it's injected at the start of every session — keep the two in sync.

## Phases

<TODO(content)> — which phases are committed, which are deferred. See `docs/PRD.md`.

## This project's most expensive bug

<TODO(content)> — the single invariant that, if broken, costs the most rework. A concurrency assumption, a type-parser default, a date/timezone handling rule — whatever form it takes here. State the invariant, not just the symptom.

## Content rules

<TODO(content)> — what must never appear in the UI, what copy must be verbatim, what's fabricated vs. sourced from `docs/PRODUCT.md`.

## Placeholder convention

Every stand-in for real content carries a `// TODO(content)` marker (see CLAUDE.md hard rule 2). `rg "TODO\(content\)"` must find the complete set and nothing else.

## Silent traps

<TODO(content)> — anything else that fails without an error: a build-output size regression, a stale measured figure copied into a doc instead of recomputed, a secret that's one import away from the client bundle. These are the ones worth the context budget — lint and types already catch what fails loudly.
