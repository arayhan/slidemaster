# Code style

How code in this repo is named and laid out. The *why* behind these shapes is in
[architecture.md](../architecture.md) — read that when a rule here
seems arbitrary, not before. Every other rule file sits beside this one in
`docs/rules/`.

## Comments explain *why*, never *what*

If a comment restates the line below it, delete it — the code already said that,
and now there are two things to keep in sync. Rename the thing instead of
annotating it: a good name removes the need for the comment.

Keep only what a reader cannot recover from the code itself:

- a non-obvious constraint
- why a workaround exists
- an invariant that must hold
- a decision and the tradeoff behind it

Line-by-line narration is rework, not diligence. It goes stale silently, and a
comment that has drifted out of date is worse than no comment, because it is
believed.

## Module file naming

Inside a module, two kinds of file get two different names. A file that exports a
component is PascalCase, named after what it renders. Everything else — types,
state, data access, anything that isn't a component — carries the **module
folder's own name** with a dot-suffix saying what aspect it is:

```
src/modules/order-form/
├── index.ts                  # the module's public API (see below)
├── order-form.schema.ts      # the form's validation schema
├── order-form.query.ts       # data-fetching/mutation hooks
├── order-form.store.ts       # client/local state
├── OrderFormPage.tsx         # the page/route component
└── components/
    └── OrderForm.tsx         # a component only this surface renders
```

The dot-prefix always matches the folder, so `order-list/` holds
`order-list.query.ts` and `order-detail/` holds `order-detail.query.ts`. The name
is greppable and never ambiguous once several modules are open at once.

Aspects that don't exist for a surface are simply absent — no empty placeholder
files. A backend module has no components at all, so it stays entirely
dot-suffixed: `order.controller.ts`, `order.service.ts`, `order.dto.ts` instead of
a Page split (an Electron main-process module follows the same rule with
`order.ipc.ts`).

The framework's routing layer stays thin: a route file re-exports or renders
`OrderFormPage` (frontend) or hands straight off to `order.controller.ts`
(backend) — it never contains feature logic itself.

## The barrel is the module's public API

`index.ts` is the one file other code may import from, and it re-exports only what
the outside is meant to reach — usually the page component and the types a caller
needs to name. Everything else is private to the module by omission:
`components/`, `*.query.ts`, `*.store.ts`, and the schema stay unexported, so the
module can rearrange its own insides without breaking a single caller.

That is what makes the folder a real boundary rather than a naming scheme. A
reviewer reads one short file to know the entire surface area of a module, and a
rename inside the folder cannot ripple outward.

**The case to watch:** a barrel is only as cheap as what it re-exports. Re-export a
component whose module registers animations, imports CSS, or pulls a chart library
at import time and every consumer pays for it, because tree-shaking can only drop
what it can prove is side-effect-free. Keep the barrel to the surface's entry
points; if a heavy component genuinely needs to be shared, that is the signal it
belongs one layer down in `src/components/`, not
that the barrel should grow.

## Module-owned components

A component that only one surface renders lives in that surface's own
`components/` folder. `src/components/` is for the
opposite case — primitives that more than one module renders.

The graduation rule is the honest one: a component moves down to
`src/components/` the moment it has a **second**
consumer, not when it starts to look reusable. Guessing early produces a shared
folder full of things one module uses, each with props shaped by that one caller —
and the cost of moving a component down later is a single import change, so there
is nothing to buy by moving it early.

## Form schemas

A form's validation lives in `<module>.schema.ts` and is imported by both the form
component and whatever submits it. One definition, so the rules the user sees and
the rules the mutation enforces cannot drift apart. Derive the form's TypeScript
type from the schema rather than declaring it twice.

## `lib/` versus `utils/`

One question with a yes/no answer decides it: **does this file exist because of a
package in `package.json`?**

- Yes → `src/lib/`. A wrapper giving a third-party API a house style.
- No → `src/utils/`. Code you wrote, depending on nothing external.

Keep `src/lib/` flat. Nesting it is the first sign it has started collecting
features. The full argument for keeping them apart is in architecture.md.

## Where assets live

Decided by **how the asset is referenced**, not what kind of file it is.

- **Imported by code** → `src/assets/<kind>/` (`images/`, `icons/`, `fonts/`).
  The bundler hashes it (no stale caches after a redeploy), a missing file
  **fails the build** instead of shipping a broken image, and unused assets are
  findable.
- **Fetched by URL, or the path must be exact** → `public/`. Favicons, the OG
  image, `robots.txt`, downloadable files — crawlers and browsers fetch these by
  convention at fixed paths, and a hashed filename would break them.
- **Video and audio** → always `public/media/`. Never import media through the
  bundler: it bloats the build for zero benefit, and streaming needs range
  requests against a stable URL.

```
src/assets/images/hero.webp    imported by a component
src/assets/icons/arrow.svg     imported
public/favicon.ico             URL must be exact
public/og.png                  crawlers fetch it by URL
public/media/intro.mp4         video: always public
public/media/notify.mp3        audio: always public
```

When in doubt: if you would write the path as a string, it goes in `public/`;
if you would write an `import`, it goes in `src/assets/`.

For every kind: **kebab-case filenames, no spaces** — a space becomes `%20` in a
URL and a quoting bug in a script.
Prefer SVG where the consumer accepts it; the raster exceptions, and the brand
set (logo, icon, OG image — placed by generation, excluded from this rule), are
covered in [assets.md](../assets.md).

**Asset folders are created when the first file needs them, never scaffolded
empty.** An empty promised folder is a lie in the folder tree — this project
removed two of those on purpose.

## Project-specific style rules

TODO(content) — anything this project does differently from the above: a naming
convention the team already uses, a file layout the framework forces, a formatter
setting that is not the default. Delete this section if there is nothing.
