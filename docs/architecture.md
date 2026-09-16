# SlideMaster — Architecture

**Copy this file's rendered output stays at `docs/architecture.md`.** Leave the reasoning sections alone unless the project genuinely differs — they are the part that makes the folder tree enforceable rather than decorative, and a tree without them decays into a junk drawer inside a month.

Stack: TanStack Start, TypeScript, single repo.

## System shape

<DIAGRAM> — the request path from browser to data store and back, one box per hop. Name the hosting target, the database, the object store, and anything third-party in the path. If a request can be served three ways (static, server-rendered, client-fetched), say which routes take which.

## Data flow

<FLOW> — for each route, what fetches what, where it runs, and what the failure mode is. This section is where an agent looks before inventing a contract, so it must name real field names and real status codes, not shapes.

## Folder structure

```
slidemaster/
├── AGENTS.md        # how to work here - the source of truth
├── CLAUDE.md        # pointer to AGENTS.md, for Claude Code
├── docs/            # PRODUCT, PRD, architecture, DESIGN, PROGRESS.md, tasks/, references/
│   └── rules/       # the coding rules - style, testing, git, security
├── .claude/         # agents, skills, hooks, settings — Claude Code entry point
│   └── commands/    # slash commands: tooling only the agent runs
├── .agent/          # tool-neutral agent assets (skills, taste)
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

`db/`, `docs/`, `.claude/`, `.agent/`, and `public/` stay at the repo root. All but `public/` are outside the build entirely; `public/` is there because TanStack Start serves it from the project root and does not follow it into `src/`.

A `scripts/` folder is **not** scaffolded. Create one only for tooling the product needs — a migration runner, a deploy step. Tooling only the agent runs belongs in `.claude/commands/` (the prompt) and `.claude/scripts/` (any executable it calls), never in `package.json`, where it becomes a script every human developer scrolls past forever.

## The import rules

1. **Nothing under `src/` imports from `src/routes/`.**
2. **Feature modules never import each other.** Shared vocabulary goes in `src/domain/`.
3. **`src/domain/` imports nothing from the rest of `src/`.** It is the bottom of the graph.

All rules are one ESLint rule. Zones, not conventions — a convention is honour-system, and honour-system boundaries are the ones nobody notices being crossed:

```js
// eslint.config.js (flat) or .eslintrc.json "overrides" (legacy) — this project's actual
// config file is the source of truth for which shape is in use; the rule is the same either way.
"no-restricted-imports": ["error", {
  patterns: [
    { group: ["@/routes/*", "@/routes"],
      message: "routes/ composes; nothing composes routes/. Move the shared piece down." },
    { group: ["@/modules/*"],
      message: "Modules never import each other. Put the shared vocabulary in domain/.",
      // plus a relative-path twin — see the note below on why the alias
      // ban alone is bypassable, and why its regex depends on file depth
    },
    { group: ["@/server/*"],
      message: "server-only. Reachable from route handlers and server components, not from a client module."
    },
  ],
}]
```

Scope each zone with `files`/`excludedFiles` (legacy) or a second config object with `files`/`ignores` (flat) so each zone applies where it means something: rule 2 binds `src/modules/**`, rule 3 binds `src/domain/**`. `src/routes/**` is outside `src/modules/**` and therefore never bound by rule 2 — composing modules is exactly its job.

Rule 2 needs **two** patterns, because banning the alias alone leaves the door open: a module can reach a sibling by relative path (`../order-list/OrderListPage`) without ever writing `@/modules`. The relative twin is depth-sensitive, so it is two zones rather than one regex:

```js
// module root files — src/modules/*/*.ts(x). Here "../" is always a sibling
// module; a legitimate reach for services/ or domain/ starts with "../../".
{ regex: "^\\.\\./(?!\\.\\./)", message: "..." }

// files nested deeper — src/modules/*/*/**. Here "../" is this module's own
// root (legitimate, e.g. components/ reading its module's types), and it is
// "../../" that lands in a sibling module.
{ regex: "^\\.\\./\\.\\./(?!\\.\\./)", message: "..." }
```

One regex cannot cover both: `../order-detail.types` from `components/` and `../order-list` from a module root are the same shape at different depths, and ESLint patterns cannot see the importing file's depth. The `files` glob is what supplies it.

## Feature-driven development

A surface is one folder under `src/modules/<surface>/`, and that folder owns everything the surface is made of — its components, its hooks, its routes, its tests. Nothing about a surface lives anywhere else; when a surface is cut, deleting its folder deletes it. That is the test of ownership: if removing the folder leaves orphaned pieces behind, those pieces were never really the surface's.

`src/services/` holds cross-feature integrations — API clients, connectors to external systems, anything that talks to the outside world on behalf of more than one feature. A service is infrastructure the features share, not a feature itself; it has no UI and no route.

Dependencies point downward only:

```
modules → services → src/lib → src/domain
```

Never sideways. When feature A needs feature B's logic, the answer is not an import across the module boundary (rule 2 forbids it) — it is extraction: pull the shared piece *down* into `src/domain/` if it is vocabulary or a business rule, or into a service if it is an integration. The sideways import feels cheaper in the moment, but it welds two surfaces together so that neither can change, move, or be deleted without the other — exactly the coupling rules 2 and 3 exist to prevent.

The downward-only rule is what keeps the layers honest: a module can be deleted without touching a service, a service without touching `src/lib/`, and `src/domain/` at the bottom depends on nothing above it (rule 3). Anything that would need to point upward is in the wrong layer.

How to name files inside a module, what `index.ts` may export, when a component
graduates to `src/components/`, and where a form schema lives are **rules**, not
reasoning — they live in [`docs/rules/code-style.md`](rules/code-style.md).
This file keeps the argument for why the boundaries are shaped that way; that file
keeps the shapes themselves.

### One concept, several surfaces

Modules are named after surfaces, not concepts (see the reasoning below), so a
single concept with a list, a detail view, and an editor is **three modules, not
one folder with three pages**:

```
src/modules/order-list/     OrderListPage.tsx,   order-list.query.ts
src/modules/order-detail/   OrderDetailPage.tsx, order-detail.query.ts
src/modules/order-form/     OrderFormPage.tsx,   order-form.schema.ts
src/services/order-service.ts     ← the data access all three share
src/domain/order.ts              ← the Order concept itself
```

They may not import each other (rule 2), which is exactly what forces the
shared pieces down into `services/` and `domain/` where all three can
reach them. One editor handles both create and update — the same fields and the
same schema, differing only by whether an id was passed — so there is no separate
`order-create/` and `order-edit/`.

Nesting inside a module is the escape hatch, not the default. Promote a
sub-area to its own folder (`order-form/steps/`) only once it has grown state or
data access of its own; until then a flat module with a `components/` folder is
easier to read.

### Relating two concepts

When one surface needs a second concept — an order's detail view listing that
order's transactions — the answer is never an import across the module boundary.
It is the same move as sharing between surfaces of one concept:

- The **relation** is a field on the entity: `src/domain/transaction.ts`
  declares `orderId`. The two concepts know about each other in the one layer
  that is allowed to hold vocabulary.
- The **read** goes through `src/services/transaction-service.ts`, which
  `order-detail.query.ts` calls directly.
- `order-detail/` never imports `modules/transaction-list/`, even though both
  display transactions. They render different surfaces; sharing the *rendering*
  is what `src/components/` is for, and sharing the *data* is what the service is
  for.

This is deliberately the same mechanism as the previous section. There is one
rule for "two things need the same thing" — push it down — and it does not matter
whether those two things are surfaces of one concept or of two.

## Why the boundaries are shaped this way

### Modules are named after surfaces, not features

A module named for a domain concept collides with the concept itself the moment more than one route touches it.

Worked example. An e-commerce site has products. Name a module `products/` and you immediately owe an answer to: does the product grid on the home page live there? The detail page? The line items in checkout? All three touch products, so all three have a claim, and the folder becomes a shared mutable space that every route reaches into — rule 2 is dead on arrival because there is nothing left to keep separate.

Name modules after the surface they render instead — `catalog-landing/`, `product-detail/`, `checkout-form/` — and the *concept* moves to `src/domain/product.ts`, where its type, its price rules, and its validation live once. Now "the thing" and "the page showing the thing" are separate words, and the question "where does this go?" has one answer: is it about the product, or about this page's presentation of it?

The test for a good module name: it should read like something you could screenshot.

### `lib/` and `utils/` are separate folders

`lib/` is polish for a library you **installed**: a wrapper module that gives a third-party API a house style — a `cn()` wrapping a class-merge utility, a query-client factory with the project's defaults, a validated env accessor. Every file there exists because a third-party API needed a house style.

`utils/` is code you **wrote**, depending on nothing external: error normalisation, formatters, small pure helpers.

The split looks pedantic until you merge them. One folder for both has no admission criterion — "is this a util?" is answerable about anything — so it accretes, and within a month it holds a date formatter, an API-client wrapper, three constants, and a stray hook. Two folders each have a question with a yes/no answer: *does this file exist because of a package in `package.json`?* Keep `lib/` flat; nesting it is the first sign it has started collecting features.

### `server/` is a folder, not a convention

Every file under `src/server/` opens with `import "server-only"`. Putting them all in one place makes the secrets boundary a **folder** boundary: one ESLint zone forbids importing it from client code, and a reviewer can check the whole surface by listing a directory.

Scattered across feature folders, the same discipline is honour-system. `import "server-only"` still throws at build time if a client component pulls it in, but nothing tells you which files were *supposed* to have the marker and don't — and the one that silently lacks it is the one holding a connection string. The folder is what makes the absence visible.

### `domain` sits at the bottom

`src/domain/` is the shared vocabulary the modules agree on — types, invariants, pure business rules. It is dependency-light on purpose: the fewer packages it pulls, the more freely everything else can import it, and the cheaper it is to test.

It must not import upward. If `src/domain/` could reach into `modules/`, the module graph would have a cycle, and rule 2 would be trivially bypassable: `checkout-form` imports `domain/cart`, which imports `product-detail`, and the two modules are now coupled through a folder whose whole job was to keep them apart. The bottom of the graph only works as a boundary if it is actually the bottom.


### Route-specific packages stay in their module

If a package serves one surface — a form library used by a single form, a heavy client for one integration, a chart library on one dashboard — import it only from within that module. Three layers enforce it, in this order:

1. **Structure first.** The package is imported from exactly one module. Nothing else can reach it without an import that looks wrong in review.
2. **Lint second.** An ESLint zone naming the package, scoped to everything *except* that module, turns "looks wrong" into a failing build:

   ```js
   // config object with files: ["src/**/*"], ignores: ["src/modules/checkout-form/**"]
   "no-restricted-imports": ["error", {
     paths: [{ name: "<HEAVY_PACKAGE>", message: "checkout-form only." }],
   }]
   ```

3. **A build-time per-route size check third.** Lint catches the direct import; it does not catch the package arriving transitively through a shared file someone added last week. A CI check that reads the build's per-route output and fails when a route crosses its ceiling is the only layer that catches that, because it measures the actual artifact rather than the source.

Set the ceilings from a measurement of your own framework baseline, taken once the scaffold builds and before any feature code exists. Do not carry numbers across projects — a figure copied from another repo is a figure nobody can defend, and it will be either so loose it never fires or so tight it gets disabled.

## Stack

| Concern | Choice | Version | Notes |
|---|---|---|---|
| Frontend framework | TanStack Start | ^1.87.0 | |
| Language | TypeScript | ^5.5.4 | |
| Package manager | pnpm | ^9.0.0 | |
| Styling | <X> | <X> | |
| Data fetching | <X> | <X> | |
| Validation | <X> | <X> | |
| Tests | <X> | <X> | |

Pin versions here. Anything outside this table needs approval and must clear whatever budget the project set.

## Verification

The commands that prove the architecture still holds, and what each one catches, are in [`docs/rules/testing.md`](rules/testing.md). `pnpm lint` is the one that enforces this file: every import zone above is a lint failure, not a review comment.

## If a sibling repo ever shares `src/domain/`

Two repos holding copies of the same domain module need a byte-identity check in CI, because a one-character drift produces two apps that disagree silently rather than one that errors.
