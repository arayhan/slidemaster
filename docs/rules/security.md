# Security

## What this project's threat model actually is

Be honest about it, because a rule justified by a threat that does not exist is a
rule that gets ignored when it costs something.

SlideMaster runs on one person's machine, for one person. No accounts, no hosting,
no network calls it makes on its own, no credentials worth stealing —
`SLIDEMASTER_DB_PATH` and `SLIDEMASTER_DECKS_DIR` are filesystem paths, not
secrets. There is no login to bypass and no tenant to cross.

Two real risks remain, and they are the reason the rules below are not theatre:

1. **Deck content is untrusted input.** A `.md` file can come from anywhere — a
   colleague, a repo, a download. Rendering it is the one place this app processes
   something it did not write.
2. **The boundary decays quietly.** The moment this grows a sync feature, a
   hosted preview, or a shared link, the server folder becomes a real boundary.
   Boundaries are cheap to keep and expensive to retrofit, so they are kept now.

## The server boundary

**Everything under `src/server/db/` opens with `import
"@tanstack/react-start/server-only"`.** Not the `server-only` npm package — that
is a different ecosystem's convention and is not installed here. TanStack Start's
import-protection plugin recognises this specifier, fails the build, and names
both the file and the import chain that reached it.

`src/server/decks.ts` deliberately carries **no** marker. It defines the server
function the route imports so the plugin can strip the handler body; marking it
makes the build refuse the import. The boundary is `db/`, not `server/` wholesale.
See `docs/architecture.md` § `server/` is a folder, not a convention.

Three layers enforce this, and none of them is sufficient alone:

| Layer | Catches |
|---|---|
| The folder | A reviewer can check the whole surface by listing a directory |
| ESLint zones | `src/lib/`, `src/utils/`, `src/services/`, `src/components/`, `src/hooks/`, `src/modules/`, `src/domain/` cannot import `@/server/*`. `src/routes/` deliberately can |
| `pnpm build` | The marker fails the build when a client module reaches the data layer |

**Never prefix a path or a connection string with `VITE_`.** Anything `VITE_`
prefixed is inlined into the browser bundle, verbatim, forever — including in
builds already shipped.

## SQL

**Parameterised only.** Every statement is `db.prepare(...)` with bound
parameters. String interpolation into SQL is never acceptable, including for a
query only this user will ever run, and including when the value came from your
own code two lines earlier.

The reason is not that today's input is dangerous. It is that a `prepare` with an
interpolated value is indistinguishable, in a diff, from one that is safe — so the
habit is the control, not the individual judgement call.

`SELECT *` is banned for a related reason: it returns whatever the schema holds
today, so a column added later silently widens what every caller receives.

## Rendering deck content

This is the one place untrusted input is processed, and the rules are in
`docs/rules/ui-styling.md` and `.claude/skills/project-gotchas/SKILL.md`. The short
version:

- Rendered slide HTML is displayed **inside a sandboxed iframe**.
- If Marp is ever configured with `html: true`, the sandbox must **not** carry
  `allow-scripts`. A deck that can run scripts in the app's origin can read the
  library and anything else the page holds.
- The app's own CSS never styles slide content, and slide CSS never enters the
  Tailwind pipeline. That separation is a correctness rule first, but it also
  means deck content cannot reach app chrome through a selector.

## Secrets, if this ever grows any

- `.env` is gitignored and stays that way. `.env.example` documents keys and
  **never holds a real value**.
- A credential that has been committed is a credential that has been disclosed.
  Rotate it; do not rewrite history and call it handled.
- Read secrets in one module under `src/server/`, never scattered at point of use,
  so the surface stays listable.

## What is deliberately not here

No authentication, no authorisation, no rate limiting, no CSRF tokens, no audit
log, no dependency-scanning policy. There is one user, on one machine, with no
network surface. Adding any of these before the thing they protect exists would be
ceremony, and ceremony is what teaches people to skip the rules that matter.

Revisit this file the first time any of these becomes true: the app listens on a
non-loopback interface; a second person can reach it; a deck can be submitted by
someone who is not the author; or anything is stored that would matter if read.
