# SlideMaster

<PROJECT_DESCRIPTION> — one or two sentences: who the user is, what the site does, and the commercial shape of the engagement (a product build). Ship the current phase's Definition of Done; do not explore alternatives.

**This file is the source of truth for how to work in this repo.** `CLAUDE.md` is a pointer to it, not a second copy — edit this file, never that one. It is named `AGENTS.md` because that is the convention every coding agent reads, so the instructions do not have to be duplicated per tool and cannot drift apart.

## First run — fill the placeholders

This project ships with `TODO(content)` markers everywhere a decision has not been made yet: `docs/PRODUCT.md`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/rules/`, and the rules section below. They are deliberate, not oversights — a generator cannot know the business.

Run the `bootstrap-project` skill once. It interviews for exactly this content and knows not to re-run over a finished project.

## Roles

One agent per job, and the boundaries matter more than the names. Two roles that both own a thing is how a decision gets made twice and reverted once.

| Role | Owns | Never |
|---|---|---|
| software-engineer | Everything under `src/` — modules, services, tests | Rewrites the design system to fit an implementation |
| ui-designer | `docs/DESIGN.md`, tokens, component specs, the verdict on built UI | Patches UI it finds wrong — reports with `file:line` and hands off |
| code-reviewer | The verdict on a change: APPROVE or FIX-FIRST | Writes or edits anything; a reviewer who fixes stops reporting |
| engineering-lead | Task breakdown in `docs/tasks/`, sequencing | Implements the tasks it wrote |
| project-manager | Scope, priorities, what counts as done | Decides technical approach |

Each is a subagent under `.claude/agents/`. Dispatch by name.

## Docs (read in this order)

| Doc | Content |
|---|---|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product truth — who the user is, what must not be fabricated, and which decisions are still the product owner's. Upstream of the spec |
| [docs/PRD.md](docs/PRD.md) | Product spec — phases, routes, static content, Definition of Done |
| [docs/architecture.md](docs/architecture.md) | System diagram, request flow, folder structure, import rules, verification practice |
| [docs/STATE.md](docs/STATE.md) | Where the project is right now — phase, next task, blockers. Read first, every session |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Decision/progress log — every agent appends what it decided and why |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual system — tokens, typography, components, do's and don'ts |

Add rows for whatever else this project grows — a database doc, a design-process doc. Keep the table ordered by reading order, not alphabetically.

## Coding rules

[`docs/rules/`](docs/rules/) holds the rules themselves, one file per concern (`principles`, `code-style`, `testing`, `git-workflow`, `sql-and-data`, `ui-styling`, `accessibility`), and is the only place they are stated. Read the ones your task touches. They are rules, not reasoning: when one looks arbitrary, `docs/architecture.md` says why. Never restate one here — a rule in two places is a rule with two versions.

## When to update this file

This file is **what an agent must know before touching code and cannot discover from the code itself** — a pointer document plus hard rules, not a spec. Every line added costs attention on every future session, so length is a real cost: at ~95 lines it gets read, at 300 it gets skimmed, and an instruction file nobody reads is worse than a short one.

**Update it when any of these change:**

- Phase structure — a phase added, removed, or renumbered
- A hard rule added, removed, or materially changed
- Tech stack — a library swapped in or out
- Folder structure
- A cross-cutting convention every agent must follow (e.g. a placeholder marker like `TODO(content)`)
- Install/run commands
- Repo scope — what belongs here versus a sibling repo

**Do NOT update it for:**

- Task-level detail inside a phase
- Definition-of-Done checkbox changes
- Rationale or explanation prose — that belongs in the doc the rule points at
- Anything an agent can look up in the spec at the moment they need it

A `Stop` hook (`.claude/hooks/check-agentsmd.ps1`) nudges **once per session** when a watched path changed and this file did not. It counts work **committed since the session started** as well as the working tree. It cannot judge whether a change crossed the threshold above; answering "deliberate, no update needed" is valid and expected.

## Phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Walking skeleton + deploy | Build first |
| 1 | <SCOPE> | Build now |
| 2 | <SCOPE> | After 1 |
| 3 | <SCOPE> | After 2 |

See [docs/PRD.md](docs/PRD.md) for the task breakdown per phase, and `docs/tasks/` for the work orders.

**Repo scope**: <WHAT_BELONGS_HERE>. <WHAT_BELONGS_IN_A_SIBLING_REPO_IF_ANY>.

## Folder structure

```
slidemaster/
├── AGENTS.md        # how to work here - the source of truth
├── CLAUDE.md        # pointer to AGENTS.md, for Claude Code
├── docs/            # PRODUCT, PRD, architecture, DESIGN, PROGRESS.md, tasks/, references/
│   └── rules/       # the coding rules - style, testing, git, security
├── .claude/         # agents, skills, hooks, settings
│   └── commands/    # slash commands: tooling only the agent runs
├── db/migrations/   # SQL, run manually
├── public/          # static assets — stays at the root; TanStack Start requires it there even with a src/ root
└── src/
    ├── routes/         # routes, layouts, composition
    ├── modules/     # named after SURFACES, never import each other; index.ts is each one's public API
    ├── domain/      # business rules — bottom of the import graph, dependency-light
    ├── server/      # every file opens with import "server-only"
    ├── services/    # outbound API clients
    ├── components/  # cross-module UI primitives only
    ├── hooks/       # cross-module React hooks, use-<thing>.ts — same one-consumer rule
    ├── lib/         # polish for installed libraries, flat (cn, motion, query-client)
    └── utils/       # own helpers (error, formatter)
```

Single repo by default. Full reasoning — why each boundary is shaped this way, and how each is enforced — is in [docs/architecture.md](docs/architecture.md); read it before adding a folder.

### The import rules

1. **Nothing under `src/` imports from `src/routes/`.** `routes/` composes; it is never composed with. This is the extraction boundary — anything below it can be lifted into another app without dragging routing along.
2. **Feature modules never import each other.** Shared vocabulary goes in `src/domain/`. Two surfaces that need the same words agree on them one level down, not by reaching sideways.
3. **`src/domain/` imports nothing from the rest of `src/`.** It is the bottom of the graph. If it imported upward, rule 2 could be bypassed through it.

All three are ESLint `no-restricted-imports` zones. Configure them in the first phase — a boundary that is only written down is a boundary that is already broken somewhere.

[docs/architecture.md](docs/architecture.md) has the zone config and the reasoning; [`docs/rules/code-style.md`](docs/rules/code-style.md) has how to name and lay out what lives inside a module.

## Install & run

```bash
pnpm install
cp .env.example .env   # fill: <REQUIRED_ENV_VARS>
pnpm dev                # http://localhost:3000
```

Migrations in `db/migrations/` are run **manually** — never assume one is applied. See [`docs/rules/sql-and-data.md`](docs/rules/sql-and-data.md).

## DX

- Commit conventions, when to commit, and what never gets committed are in [`docs/rules/git-workflow.md`](docs/rules/git-workflow.md). The short version: **atomic** commits, a **semantic** subject, a **body saying why**, and **no attribution trailers of any kind** — no `Co-Authored-By`, no "Generated with", no agent footer.
- **Start Claude sessions inside the repo root** — hooks and settings load from session root; starting one level up leaves the `Stop` and `SessionStart` hooks silently inactive.
- A request too big for one branch gets split across **worktrees** — but only along module boundaries, and never two sessions in one checkout. Rules and commands in [`docs/rules/git-workflow.md`](docs/rules/git-workflow.md).
- Questions to the user go through `AskUserQuestion`.
- **Tooling only the agent runs does not go in `scripts/` or `package.json`.** A cost check, a codebase audit, a repo-wide rename — those are agent work, and putting them in `package.json` hands every human developer a script they will never type. Put the prompt in `.claude/commands/<name>.md` and any executable it needs in `.claude/scripts/`. `scripts/` at the repo root is for tooling the *product* needs — a migration runner, a deploy step — and is not created until something real goes in it.

## Hard rules (violations = rework)

1. **Secrets never reach the client.** Connection strings, API keys, and storage credentials live only in files under `src/server/`, never in a `VITE_*` variable and never in a module a client component can import. The browser talks to your route handlers; only they talk to anything else. The mechanics are in [`docs/rules/security.md`](docs/rules/security.md).
2. **Placeholders are marked and enumerated.** Every stand-in for real content carries a `// TODO(content)` marker, and this file lists the complete set of categories. `rg "TODO\(content\)"` must find all of them and nothing else — an unmarked placeholder is the one that ships.
3. **Never claim something works without running the check and quoting its output.** What must be tested and what the checks catch is in [`docs/rules/testing.md`](docs/rules/testing.md).

**Project-specific rules get added here.** The ones worth the space are the traps that fail *silently*: the invariant behind this project's most expensive bug, content that must never appear in the UI, copy that must be verbatim, a performance budget with a number in it. A rule that fails loudly is already caught by types or lint and does not need a line here. Whatever lands in this section should also land in `.claude/hooks/inject-gotchas.ps1`, which injects the short version into every session.
