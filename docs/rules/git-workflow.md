# Git workflow

Three rules carry this whole file: every commit is **atomic**, every subject is
**semantic**, and every commit has a **body**. The rest is detail — plus
[worktrees](#worktrees), for work too big to sit in one branch.

## Atomic commits

One commit does one thing, and the repo works at every commit.

The test is mechanical: if the subject line needs an "and", it is two commits. A
commit that fixes a bug *and* renames a variable *and* bumps a dependency cannot
be reverted, cannot be bisected to, and cannot be reviewed — a reader has to
separate the three in their head before they can judge any of them.

- Formatting changes go in their own commit, never mixed with behaviour. A diff
  that is 90% reindentation hides the four lines that matter.
- A refactor and the feature it enables are two commits, in that order.
- Never commit a broken intermediate state to "fix it in the next one". The next
  one may not arrive, and bisect will land on this one.

Commit after each work step **passes**, not one giant commit at the end. A step
that passes is a point someone can return to; a 40-file commit is a point nobody
can bisect.

## Semantic subject lines

Conventional-Commits-flavored. The prefix is not decoration — it is what makes the
log skimmable a year later:

| Prefix | For |
|---|---|
| `feat:` | New behaviour a user could notice |
| `fix:` | A defect corrected |
| `chore:` | Tooling, dependencies, config |
| `docs:` | Documentation only |
| `refactor:` | Behaviour unchanged, shape changed |
| `revert:` | Undoing a previous commit, naming it |

Subject line: imperative mood, under ~70 characters, no trailing period. "add
order form validation", not "added" or "adds".

Use a scope when the repo has more than one obvious area: `feat(orders):`.

## Every commit gets a body

Subject, blank line, body. The subject says *what changed*; the body says **why**,
and why is the part nobody can reconstruct from the diff six months later.

Write the body about the decision, not the change:

- why this approach and not the obvious alternative
- what you tried that did not work, so nobody retries it
- the constraint that forced an odd-looking choice
- what this deliberately does **not** do, and what breaks if it is reverted

A body that restates the diff is worse than none — it costs a reader time and
teaches them to skip bodies. If you genuinely cannot say anything the diff does
not, that is a signal the commit is a mechanical one, and it should say so in one
line: "rename only, no behaviour change".

```
fix(orders): reject a submit that arrives while the first is in flight

The submit handler was not disabled between click and response, so a
double-click created two orders with the same idempotency window and the
second failed on a unique constraint the user then saw as a 500.

Guarding in the handler rather than disabling the button: the button is
rendered in three places and only one of them is ours.
```

## No attribution trailers

**No footer naming the agent that wrote the commit.** Not in the body, not as a
trailer, not in the subject. Banned in every form, including:

```
Co-Authored-By: Claude <...>          Co-Authored-By: <any agent>
Generated with Claude Code            Generated with <any tool>
by Claude                             by Antigravity / by opencode
🤖 anything
```

This is not a style preference. Commit metadata is permanent and rewriting history
to remove it is expensive; it is read by tools that do not care about your
workflow; and it is noise in every `git log` and `git blame` from now on. The
author field already records who ran the commit, which is the only attribution git
is asking for.

## Never commit

- `.env`, or any file holding a real credential
- a lockfile from a package manager this project does not use (pnpm is the
  one — a foreign lockfile silently resolves a different dependency tree than the
  one that was reviewed)
- generated output, `node_modules`, or build artifacts
- code that fails `pnpm lint` or `pnpm test`

## Branches

Work on a branch, not on the default branch directly. Name it after the outcome,
not the ticket alone: `feat/order-form-validation` beats `RAY-214`.

Rebase your own unpushed work to keep history readable. Do not rebase anything
someone else may have pulled — merge instead. The rule is about who else has the
commits, not about which command is better.

## Worktrees

A worktree is a second checkout of this repo on its own branch, in its own folder,
sharing one `.git`. It is the tool for a request too big to sit in one branch —
several independent surfaces, a long refactor that must not block other work, an
experiment that may be thrown away.

It is **not** for "this feels big". Two changes to the same module are one branch,
however large they are.

### Split by ownership, never by file

This is the precondition, not advice. Two worktrees may never touch the same
module. If you cannot draw that line cleanly, the work is **sequential** — do not
open a second worktree.

```
SAFE     wt-a: src/modules/order-list/
         wt-b: src/modules/checkout/
         disjoint folders; neither touches the other's

UNSAFE   wt-a: "the backend half"
         wt-b: "the frontend half"
         both land in src/domain/order.ts
         -> do it sequentially instead
```

The unsafe split is the tempting one, because it sounds like a clean division of
labour. It is not: a boundary between *layers* is crossed by every feature, so the
two worktrees meet in the middle on the shared file and each writes a version that
passes its own tests. Nothing fails. You find out when they merge, or later.

**Shared code is frozen while worktrees are open.** A change to `src/domain/`,
`src/lib/`, `src/components/` or a service lands on the default branch
first, and every open worktree rebases onto it. Editing shared code from inside a
worktree is exactly the failure this section exists to prevent.

### One writing session per worktree

One agent, one worktree, one branch. Two sessions editing one checkout ship
defects neither can see — each has a stale picture of the files the other is
holding. Commit before handing off.

### Commands

Put the worktree in a **sibling directory**, outside this repo. Nothing outside
the repo can be picked up by a test, lint, or build glob:

```bash
git worktree add ../slidemaster-checkout -b feat/checkout
cd ../slidemaster-checkout
pnpm install                    # worktrees do NOT share node_modules
```

When the branch is merged:

```bash
git worktree remove ../slidemaster-checkout
git worktree prune            # clears entries whose folder is already gone
```

`git worktree list` is the honest answer to "what is open right now" — a folder on
disk that is not in that list is a leftover, not a worktree.

### The in-repo trap

`claude --worktree <name>` is convenient but puts the checkout at
`.claude/worktrees/<name>` — **inside** this repo, where every glob can walk it.
Test, lint and typecheck configs will happily collect another session's copy of
every file and report its failures as yours.

If you use it, these three excludes are mandatory, not tidy-up:

```
vitest.config   exclude: ['.claude/worktrees/**']
eslint config   ignores: ['.claude/worktrees/**']
tsconfig.json   exclude:  ['.claude/worktrees']
```

This is not hypothetical, and it does not announce itself: the symptom is a test
suite that reports failures in files you did not touch, on a branch you are not
on. Add the excludes when you create the first in-repo worktree, not after you
have spent an afternoon debugging someone else's copy.

### Merging back

Rebase the worktree's branch onto the default branch, run the checks **in the
worktree**, then merge. Never merge one worktree's branch into another's — that
couples two lines of work that were split precisely so they would stay apart.

TODO(content) — this project's branch and PR convention: the default branch name,
whether PRs are required, who reviews, and whether merges squash.
