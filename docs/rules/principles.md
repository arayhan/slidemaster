# Principles

The named principles, stated as the decision they actually change. You already
know what the acronyms stand for; what follows is where each one binds in this
codebase and what test settles it.

Every entry here is about **restraint** — when to stop, not what to add. The other
files in `docs/rules/` tell you how to build a thing well. This one tells you
when not to build it.

## YAGNI

Build for the case in front of you.

A second real case changes the shape you would have guessed; a hypothetical one
guesses it wrong and then has to be lived with. The generality you add today is
paid for by every reader between now and the day the second case arrives — and
often the second case never arrives at all.

**The test: if you cannot name the caller, do not add the parameter.** Same for
the config option, the strategy interface, the plugin hook, and the "we might
need this later" branch. Name a real caller or leave it out.

A `TODO` is not a design. If the future case is real and known, write it in
`docs/PRD.md` where it can be scheduled; do not encode a guess about it in the
signature.

## Duplication is cheaper than the wrong abstraction

Two things that look alike are not necessarily one thing. Merging them binds
their futures together, and the moment they need to differ you get a parameter,
then a flag, then a branch — and now one function serves two callers badly.

The cost asymmetry decides it: **un-duplicating is one import change.
Un-coupling is a refactor.** So the default when in doubt is to copy, and to
merge only once the evidence is in.

This project already fixes where that evidence threshold sits. The numbers are
deliberately **not** repeated here — a threshold stated in two files is a
threshold that will eventually disagree with itself:

- When a component graduates to shared — [code-style.md](./code-style.md), under
  "Module-owned components".
- When a repeated class list becomes a component — [ui-styling.md](./ui-styling.md).
- Where shared logic goes instead of sideways —
  [architecture.md](../architecture.md), under "Feature-driven
  development".

## KISS, with a test that bites

"Keep it simple" is unfalsifiable as written. Use this instead:

**The simplest thing that passes a check you can name.** If you cannot name the
check, you do not yet know what you are building.

And the counter-test, because short and simple are not the same thing: **if
explaining the design takes longer than reading it, it is not simple — it is
merely short.** Clever compression, a chain of ternaries, a regex doing three
jobs: all short, none simple.

## Delete before you add

The cheapest code is the code not written. The second cheapest is the code
removed.

Before adding a branch to a function, check whether the branch you are working
around should exist at all. Before adding a config option, check whether the
behaviour it toggles has a defensible default.

**Dead code behind a flag is not dead — it is a second codebase**, one nobody
tests and everybody has to read past. Delete it; git remembers. Commented-out
code is the same thing with worse ergonomics.

## SRP, in this codebase's terms

**A module owns one surface.** The test is mechanical: if deleting the folder
leaves orphans behind, it owned two things.

This one is already enforced rather than merely believed — the
`no-restricted-imports` zones in this project's ESLint config fail the build on a
cross-module import. [architecture.md](../architecture.md) has the
reasoning and the zone config.

## DIP, in this codebase's terms

**Depend on the `src/domain/` type, not on the thing that fetches it.**

A module that imports a service to get at a type has coupled itself to how the
data arrives. Import the type from `src/domain/` and take the data as an
argument, and the same module works against a fetch, a cache, or a test fixture
without knowing which it got.

Which direction dependencies may point is stated once, in
[architecture.md](../architecture.md), and enforced by the same
lint zones as SRP above.

## The three that do not bind here

Liskov Substitution, Interface Segregation, and Open/Closed are shaped for class
hierarchies. This codebase is TypeScript modules and
React function components, so they
rarely find anything to hold onto — and a worked example for them would have to be
invented rather than drawn from this project, which is the cargo cult this file
exists to prevent.

They are named here so their absence reads as a decision. If this project grows a
real class hierarchy, that is the moment to write them up with an example from
the code rather than from a textbook.

## This project's principles

1. **Wrap, don't build.** The Markdown-to-slides renderer is `@marp-team/marp-core`.
   We do not fork it, reimplement slide splitting, or write a parser. Owned code
   is the one template, the catalog, and the present shell — nothing that Marp,
   `gray-matter`, or a syntax highlighter already does.

2. **The `.md` files are the only source of truth.** The SQLite index is a
   derived cache. It must be fully reconstructible from the deck files by one
   command, and no feature may store deck content that exists nowhere else.

3. **One template, finalized.** Phase 1 ships exactly one master template. "Make
   it configurable" is a Phase 3 conversation, not a Phase 1 shortcut.

4. **Dependency budget.** A new runtime dependency needs a one-line justification
   and `engineering-lead` sign-off (see `AGENTS.md` roles). Prefer the platform
   and what is already installed.
