---
name: bootstrap-project
description: One-time interview that fills in the judgment content the CLI generator couldn't know — PRODUCT.md, PRD.md, DESIGN.md, the coding rules, project-gotchas, and the first phase's task breakdown. Run this once, right after the project is generated, before any feature work starts.
tools: Read, Grep, Write, Edit, AskUserQuestion, Task
---

You are running the post-generation interview for this project. The CLI already wrote everything mechanical — folder structure, package.json, the Stack table in `docs/architecture.md`, the framework-conditional parts of `AGENTS.md`, and the coding rules in `docs/rules/`. What's left is business content and judgment calls no script can make. Do not re-derive or re-generate anything the CLI already got right; only fill placeholders.

`AGENTS.md` is the file you edit. `CLAUDE.md` is a two-line pointer at it and is never edited — a second copy is a copy that drifts.

## Step 0 — Have I already run?

This skill is meant to run **once**, on a freshly generated project. Nothing stops it being invoked again months later, and a second run rewrites content that a person wrote by hand. So check before doing anything.

Grep for `TODO(content)` across `docs/PRODUCT.md`, `docs/PRD.md`, `docs/DESIGN.md`, and `docs/rules/`.

- **No matches anywhere** → this project has already been bootstrapped. **Stop.** Say so plainly, and ask whether they are intentionally re-running (a pivot, a restart, a rewrite) before you write or edit a single file. If they confirm, continue — but treat every existing answer as a draft to revise *with* them, not a placeholder to overwrite.
- **Some matches remain** → either a first run, or a previous run that stopped partway. Continue normally and fill only what is still marked. Resuming is the point; that is why this tests for *zero* remaining markers rather than refusing whenever any content exists.

Judge from the placeholders rather than from a marker file or a note in `PROGRESS.md`. Those go stale, get committed by accident, or get deleted. The placeholders *are* what this skill exists to remove, so their absence is the one signal that cannot lie about whether the work was done.

## Step 1 — Orient

Read, in order:
- `docs/interview.json`, if it exists — raw answers from the raygent guided CLI interview. Treat these as already-collected input: in every step below, only ask about the gaps, and never re-ask a question this file already answers.
- `package.json` and `docs/architecture.md`'s Stack table — confirms the chosen frontend/backend/monorepo setup.
- `AGENTS.md` — note every remaining `<PLACEHOLDER>` (there should be exactly: `<PROJECT_DESCRIPTION>`, the three `<SCOPE>` cells, `<WHAT_BELONGS_HERE>`, `<WHAT_BELONGS_IN_A_SIBLING_REPO_IF_ANY>`, `<REQUIRED_ENV_VARS>`).
- `docs/rules/` — list the files. Which ones exist tells you what this stack is; their `TODO(content)` sections are step 5.
- `.claude/skills/project-gotchas/SKILL.md` — the TODO skeleton you'll fill in step 6.

## Step 2 — Product truth (`docs/PRODUCT.md`)

Use `AskUserQuestion` (batched, not serial) to establish:
- The problem and the solution — what problem, for whom, and what the product does about it.
- The vision — where the product is headed beyond the current phase.
- Who the user is — the actual end user of what's being built, not the stakeholder commissioning it.
- The target market — segment, size, geography; who is sold to, as distinct from who uses it.
- Competitors and alternatives — named competitors plus the do-nothing alternative, and the difference.
- The business model — how it makes (or saves) money, and who pays.
- Goals and success metrics — measurable outcomes, with numbers where they exist.
- What must never be fabricated — content, numbers, claims that need a real source rather than a placeholder.
- Which decisions are still open and whose call they are (the client's / the requesting team's / the product owner's, matching this project's engagement type already set in `.claude/agents/project-manager.md`).

Many of these may already be pre-filled — from `docs/interview.json` or by hand. Only fill the `<TODO(content)>` markers still remaining in `docs/PRODUCT.md`, and only ask about those. Write the answers into `docs/PRODUCT.md`, replacing its `<TODO(content)>` markers. This file is upstream of the spec — get it right before step 3.

## Step 3 — Spec and phases (`docs/PRD.md` + remaining `AGENTS.md` placeholders)

Ask for:
- A one-or-two-sentence project description (fills `AGENTS.md`'s `<PROJECT_DESCRIPTION>`).
- Phase 1/2/3 scope (fills both `AGENTS.md`'s Phases table `<SCOPE>` cells and `docs/PRD.md`'s per-phase sections). If the project genuinely doesn't need three phases, say so and collapse the table — don't invent scope to fill three rows.
- Repo scope: what belongs in this repo vs. a sibling repo, if any (fills `<WHAT_BELONGS_HERE>` / `<WHAT_BELONGS_IN_A_SIBLING_REPO_IF_ANY>`).
- Required environment variables (fills `<REQUIRED_ENV_VARS>` in the Install & run block, and `.env.example`).

Write `docs/PRD.md` and edit `AGENTS.md` in place — this is the only step that touches `AGENTS.md`; everything else in it was already correct.

## Step 4 — Design system (`docs/DESIGN.md`) — skip if this project has no frontend

Ask for the visual direction: tokens (color/spacing/radius/shadow), typography, and any do's/don'ts. Point the user at `docs/references/` if they have benchmark screenshots or moodboards to drop in first — read that folder's README for the lifecycle (findings get written into `DESIGN.md` before the reference file is deleted). Write `docs/DESIGN.md`.

## Step 5 — Coding rules (`docs/rules/`)

Every file in `docs/rules/` is already written — the rules that hold for any
project of this shape are stated, and only the project-specific parts are marked
`TODO(content)`. Your job is those markers, and nothing else. Do not rewrite a
rule that is already correct, and do not add a rule the project has not asked for.

Read each file's `TODO(content)` sections and resolve every one of them **either
by filling it or by deleting the section**. Deleting is a real answer: "this
project has no styling convention beyond what is written here" is common and
honest, and leaving the marker in place would make Step 0 report a finished
project as half-bootstrapped forever.

Ask in one batched `AskUserQuestion` per file that still has markers, not one
question per marker. Most of these have a sensible default you can propose:

- `testing.md` — the expensive-bug invariant (this is the same answer as step 6;
  ask once, write it in both places with the detail here and the one-liner there).
- `git-workflow.md` — branch and PR convention.
- `api-conventions.md` — versioning, and anything the project must mirror.
- `sql-and-data.md` — the database, the access layer, naming.
- `ui-styling.md` — anything not already covered by `docs/DESIGN.md`.
- `accessibility.md` — the conformance target, if the engagement commits to one.
- `security.md` — what this project must not leak, and who the untrusted actors are.
- `code-style.md` — usually nothing. Delete the section rather than inventing one.

When you are done, `rg "TODO\(content\)" docs/rules/` must return nothing.

## Step 6 — Project gotchas

Ask one targeted question: *"What's the single most expensive bug this kind of project could ship, and what invariant prevents it?"* Offer stack-appropriate hints in the question itself — a concurrency invariant for a database-backed API, a secrets-in-bundle check for a client-rendered frontend, a timezone/date-parsing default for anything with dates. Also ask for content rules (what must never appear in the UI, what copy must be verbatim) if not already fully covered by `docs/PRODUCT.md`.

Fill `.claude/skills/project-gotchas/SKILL.md`'s `<TODO(content)>` sections. Then mirror the short version into `.claude/hooks/inject-gotchas.ps1`'s `$lines` array — edit only the data inside that array, never the script's logic around it (the STACK/ONE PACKAGE MANAGER lines the CLI already wrote stay as-is; add your new lines alongside them, and replace the `TODO:` placeholder lines with real content).

## Step 7 — Hand off the task breakdown

Do not write `docs/tasks/*` yourself — that's `engineering-lead`'s job, not this skill's. Use the `Task` tool to hand off to `engineering-lead` with the Phase 1 scope you just wrote into `docs/PRD.md`, asking it to produce the first batch of step/gate files per `docs/tasks/README.md`'s convention.

## Step 8 — Summary

List every file you wrote or edited. End with a `handoff:` line naming `engineering-lead` (or whichever agent should act next, if the Task handoff in step 7 already covered it — don't duplicate).

Then tell the user, in one line, that bootstrap is complete and this skill will not run again without checking with them first (see Step 0). It stays in the repo deliberately — a real pivot or restart is a legitimate reason to run it again — but it will no longer fire by accident.
