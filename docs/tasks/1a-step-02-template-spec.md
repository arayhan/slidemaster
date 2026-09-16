# 1a-step-02-template-spec

Specify the master slide template completely enough that 1b can implement it without
making a single design decision, and build a static mockup the human can sign off from.

> **Status: done.** The work below was completed by `ui-designer` in the 1a design pass.
> The acceptance criteria are **verification**, not a to-do list. Two items are genuinely
> outstanding and both are listed under *Not done here* — one of them blocks an honest
> answer at the gate.

## Goal

The product's value proposition is *zero design decisions per deck*. That only holds if
every question a deck can raise already has an answer in the spec — including the
awkward ones, which are all variations of "what does this slide look like when the
author did not supply that field?"

`docs/PRODUCT.md` sets the hard constraint: **the app renders slide content, it never
invents it.** No inferred job title, employer, handle, or logo. A missing field means the
slide does without it, and the spec has to say what "doing without it" looks like, or 1b
will invent something reasonable and the rule will have been broken by accident.

## Deliverables

- `docs/DESIGN.md`, section **Section anatomy — all seven types**:
  - one sub-section each for `title`, `profile`, `intermezzo`, `quote`, `references`,
    `contact`, `closing`
  - each with a key table (key · required · how it renders) and an explicit
    **Absent-field behaviour** list
  - one governing rule stated once and applied to all seven: an absent optional field
    removes its block and **nothing else moves**
  - the default content slide: headings, the signature rule, bullets, two levels of
    nesting, ordered lists, `**bold**` / `*italic*` / `==highlight==` / inline code,
    images (jpg/png/gif) with the two sanctioned placements and the caption rule, fenced
    code with a four-colour highlight palette, logo placement, slide number, and
    react-icons usage
  - the capacity table, derived arithmetically from the region heights
- `docs/references/template-mockup.html` — one self-contained file, no build step, no
  JavaScript, no external network request, rendering all ten frames at 1280×720 from a
  token block copied verbatim from `src/theme/slide-tokens.css`. Carries grid and
  safe-area overlays as a CSS-only review aid.
- The implementation note that `react-icons` cannot render into Marp output, so the
  pipeline must resolve an icon name to inline SVG at render time.

## Acceptance Criteria

Run from the repo root.

**1 — all seven section types are specified, each with a key table and an absent-field
list.**

```bash
rg -c "^### [1-7]\. " docs/DESIGN.md                        # expect 7
rg -c "^\| Key \| Required \| Renders as \|" docs/DESIGN.md  # expect 7
rg -c "Absent-field behaviour" docs/DESIGN.md               # expect 7
rg -c "^### Default content slide" docs/DESIGN.md           # expect 1
```

**2 — the no-fabrication rule is stated as behaviour, not as a principle.** These are the
four specific strings 1b would otherwise invent.

```bash
rg -c "never writes .Anonymous" docs/DESIGN.md   # expect 1
rg -c "never writes .Thank you" docs/DESIGN.md   # expect 1
rg -c "rather than writing .Untitled" docs/DESIGN.md   # expect 1
rg -c "No fallback avatar|no fallback avatar|There is no fallback avatar" docs/DESIGN.md   # expect >= 1
```

**3 — the mockup renders exactly ten frames, and each is labelled with the type it
demonstrates.**

```bash
rg -c "figure class=.frame." docs/references/template-mockup.html   # expect 10
rg -c "class=.slide g-" docs/references/template-mockup.html        # expect 10
node -e "const s=require('fs').readFileSync('docs/references/template-mockup.html','utf8');const want=['title','profile','intermezzo','quote','references','contact','closing','default content','code slide','image slide'];const missing=want.filter(w=>!s.includes('· '+w));console.log(missing.length?'MISSING: '+missing.join(', '):'OK - all 10 frames labelled');process.exit(missing.length?1:0)"
```

**4 — the mockup's slide-token block is identical to `src/theme/slide-tokens.css`.** This
is what makes "no value in the mockup comes from outside the table" true rather than
claimed.

```bash
node -e "const fs=require('fs');const n=s=>s.trim().replace(/\s+/g,' ');const grab=p=>[...fs.readFileSync(p,'utf8').matchAll(/(--slide-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m=>m[1]+' = '+n(m[2])).sort();const a=grab('src/theme/slide-tokens.css'),b=grab('docs/references/template-mockup.html');const diff=a.filter(v=>!b.includes(v)).concat(b.filter(v=>!a.includes(v)));if(a.length!==b.length||diff.length){console.log('count',a.length,'vs',b.length);console.log('differing:',diff);process.exit(1)}console.log('OK -',a.length,'tokens identical')"
```

**5 — nothing in the mockup uses a raw colour or length outside its token block.** A
one-off value is a bug, and this is the command that says so.

```bash
node -e "const s=require('fs').readFileSync('docs/references/template-mockup.html','utf8');const i=s.indexOf('TOKENS:END');if(i<0){console.log('TOKENS:END marker missing');process.exit(1)}const body=s.slice(i);const hex=[...body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m=>m[0]);const px=[...body.matchAll(/\b[0-9]+(\.[0-9]+)?px\b/g)].map(m=>m[0]);if(hex.length||px.length){console.log('raw hex outside token block:',hex);console.log('raw px outside token block:',px);process.exit(1)}console.log('OK - no raw hex or px outside the token block')"
```

**6 — the mockup is genuinely self-contained and offline.**

```bash
rg -c "<script" docs/references/template-mockup.html        # expect NO matches
rg "https?://" docs/references/template-mockup.html         # expect NO matches
rg -c "src=|@import|url\(" docs/references/template-mockup.html   # expect NO matches
```

**7 — placeholder content is marked exactly once and enumerated.** `AGENTS.md` hard rule 2
requires `rg "TODO\(content\)"` to find the complete set and nothing else; one marker
covering the whole specimen file is the complete set for this file.

```bash
rg -c "TODO\(content\)" docs/references/template-mockup.html   # expect 1
rg -c "Lorem" docs/references/template-mockup.html             # expect NO matches
rg "TODO\(content\)" --glob "!node_modules"                    # read the full list
```

**8 — the mockup is reviewable at true size.** Open it and confirm:

```bash
node -e "const s=require('fs').readFileSync('docs/references/template-mockup.html','utf8');const ok=s.includes('--slide-canvas-w: 1280px')&&s.includes('--slide-canvas-h: 720px')&&s.includes('width: var(--slide-canvas-w)')&&s.includes('height: var(--slide-canvas-h)');console.log(ok?'OK - frames are 1280x720 from tokens':'frame size is not token-driven');process.exit(ok?0:1)"
```

Then open `docs/references/template-mockup.html` in a browser at 100% zoom. The two
CSS-only toggles at the top hide the annotations and overlay the 8-column grid plus the
safe area.

### What could not be written as a check

- **Whether each section type still reads correctly with fields missing.** The mockup
  deliberately renders three absent-field cases (`profile.photo`, `contact.icon` on row 3,
  `references[6].url`) so a reviewer can see them. The other absences are specified in
  prose and cannot be verified until 1b renders them. This is gate question 2 and it needs
  eyes.
- **Whether the template leaves any decision to the deck author.** Every such decision is
  a design decision per deck, which is the thing this product exists to remove. The spec
  names the ones it deliberately leaves (split an overflowing slide; shorten a title past
  64 characters) and argues they are content decisions. Judging that line is gate
  question 4.
- **Whether the mockup renders a real past presentation.** It does not — see below.

## Not done here

| Item | Why not | Owner |
|---|---|---|
| **The mockup is not tracked by git.** `.gitignore:29` ignores `docs/references/*` with a single negation for `README.md`. As written, this file is scratch and will be lost. It is a gate deliverable and a 1b reference, so it needs `!docs/references/template-mockup.html` added, or the file relocated to a tracked path | `.gitignore` is not this role's file to edit | `software-engineer` |
| The Archivo `woff2` files | Gated on *Open question 1* in `docs/DESIGN.md`. **The mockup currently renders in the platform-grotesk fallback**, and the reviewer must be told that before judging the type | `software-engineer`, after the gate |
| The Marp theme CSS | Phase 1b, and gated on this step's sign-off | `software-engineer` |

## The gap that blocks an honest gate

`docs/tasks/1a-gate-template.md` question 1 asks whether the mockup renders a **real past
presentation — not a contrived demo deck** — and where the template fought the content.

**It does not.** It renders specimen content, because no real deck exists in this repo yet,
and a designing agent inventing one would be exactly the fabrication `docs/PRODUCT.md`
forbids. Before sign-off, one real past talk should be poured into these ten frames by
hand. It is about an hour of work, it is the same hour `docs/STATE.md` already parks as
the riskiest-assumption test, and it is the cheapest possible way to find out that the
capacity table is wrong or that the seven section types do not cover a real talk.

Signing off on specimen content answers a different question than the one the gate asks.

**Depends:** 1a-step-01-art-direction · **Blocks:** 1a-gate-template · **handoff:** project-manager
