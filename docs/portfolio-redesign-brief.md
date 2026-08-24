# Brief: rework the Portfolio templates

> **Status, checked against the code on 2026-08-24.** Most of this brief has
> shipped, and the parts describing the old layouts are kept only as the record
> of why the current ones look as they do. Read this status block first; the
> sections below it were written before the rebuild and name files that no
> longer exist.
>
> **Done**
> - The four templates were rebuilt around four audiences, not four skins
>   (see "Direction change" at the end, which is the decision that governs).
> - Each variant has its own sample business - `mockDeveloperSite`,
>   `mockDesignerSite`, `mockBrandSite`, `mockFreelancerSite` in
>   `lib/mock-preview-data.ts`. One salon no longer stands in for four
>   professions.
> - `PublicSiteRenderer` is the single dispatch point from `layoutVariant` to
>   component, shared by the live site and every preview.
>
> **Still open**
> - **Persistent booking, on all four.** Only `PublicPortfolioSiteServices`
>   has a sticky bar, and it is `sm:hidden` - mobile only. The other three
>   leave a visitor mid-scroll with no visible way to act, which is the
>   problem this brief opened with.
> - **The enum rename is now done**, the first option below rather than the
>   second. `HERO`/`MINIMAL`/`BOLD`/`PROFILE` became
>   `PROFESSIONAL`/`VISUAL`/`BRAND`/`SERVICES`, with backend migration V19
>   mapping every stored row in both `business_websites` and `template_prices`.
>   Anything written against the old names needs updating.
>
> **Current file map** (the table further down is the old one):
>
> | File | Layout | Reads as |
> | --- | --- | --- |
> | `PublicPortfolioSiteProfessional.tsx` | `PORTFOLIO_PROFESSIONAL` | Professional / CV |
> | `PublicPortfolioSiteVisual.tsx` | `PORTFOLIO_VISUAL` | Creative / Visual |
> | `PublicPortfolioSiteBrand.tsx` | `PORTFOLIO_BRAND` | Brand / Product |
> | `PublicPortfolioSiteServices.tsx` | `PORTFOLIO_SERVICES` | Freelancer / Services |
>
> Names below this block are the pre-rename ones, kept as written.

Handover notes for picking this up in a fresh session. Written after reviewing
all four Portfolio layouts in a browser against the sample salon data.

## The goal, in the owner's words

Two problems, to be treated as one job:

1. **A visitor cannot find how to book.** Booking is the entire point of a
   salon site, but the only ways in are a `Contact` button in the top-right of
   the header and a "Get in touch" block at the very bottom of a very long
   page. Someone who lands mid-scroll has no visible way to act.
2. **The page is cluttered and too long.** Hero, About, Services, Work, Team,
   Testimonials and Contact are stacked into one endless scroll, and the
   sections look too similar to tell apart while scrolling past them.

So: cut and reorder the sections so the page reads in a sensible order, and
make booking reachable from any scroll position.

## Files

**Superseded** - none of these four files exist any more; see the current file
map in the status block above. Kept because the findings below refer to them.

| File | Layout |
| --- | --- |
| `components/public/PublicPortfolioSite.tsx` | `PORTFOLIO_HERO` |
| `components/public/PublicPortfolioSiteMinimal.tsx` | `PORTFOLIO_MINIMAL` |
| `components/public/PublicPortfolioSiteBold.tsx` | `PORTFOLIO_BOLD` |
| `components/public/PublicPortfolioSiteProfile.tsx` | `PORTFOLIO_PROFILE` |
| `components/public/DynamicSections.tsx` | About / Team / Testimonials / FAQ, shared by all layouts via a `tone` prop |
| `lib/mock-preview-data.ts` | `mockPortfolioSite()` — the sample salon the previews render |

Preview routes: `/preview/mock/PORTFOLIO_HERO`, `…_MINIMAL`, `…_BOLD`,
`…_PROFILE`.

## Findings already confirmed

Concrete, observed rather than assumed:

- **`PORTFOLIO_HERO` never renders `profile.coverImageUrl`.** The sample salon
  has a cover photo that goes unused, which is why its hero is a large empty
  area — `min-h-[85vh]` of mostly nothing.
- **The hero's nav is a bare `justify-between` row** of three items (name,
  links, button), so the links drift off-centre as the business name changes
  length. It needs a layout that holds the links put.
- **`PORTFOLIO_MINIMAL`'s docstring claims a "fixed left profile panel,
  scrollable right content" split-screen, but it does not render that way** at
  desktop width. Worth establishing whether the split was lost or never built,
  before redesigning around it.
- **`DynamicSections` renders testimonials for the `minimal` and `elegant`
  tones as a bare divided list** in light-grey italic, much weaker than the
  card treatment every other tone gets.
- **Vertical rhythm is loose across all four**, which is a large part of why
  the pages feel empty and endless.

## Constraints worth knowing before editing

- **The `tone` prop carries a hidden background assumption.** In
  `DynamicSections`, `tone="hero"` is written for a dark background
  (`text-white`, `text-zinc-300`, `border-white/10`) while `minimal` assumes a
  light one. Several bugs here trace back to that asymmetry. If the tones are
  reworked, make the assumption explicit rather than implied by class choices.
- **Do not add `backgroundColor` or `color` to `themeCssVars`.** An inline
  style outranks Tailwind classes, and `PORTFOLIO_HERO`'s root is
  `bg-zinc-950 text-white` by design — painting the theme palette inline forced
  it light and left its white text unreadable. The palette is published as CSS
  variables instead; a layout opts in with `bg-background text-foreground`.
  See the commit "Stop the theme palette overriding layouts that style their
  own shell".
- **Prefer changing the layout components over the shared styling layer.**
  Every regression in this area so far came from editing shared primitives
  (`themeCssVars`, `DynamicSections`' class maps) rather than a single layout.
- **Images go through `SafeImage` / `MotionSafeImage`**, not raw `<img>`, so a
  dead URL degrades to a drawn placeholder instead of a broken-image glyph.
- **New UI strings need `lib/i18n/translations.ts` entries for all three
  locales** (en / fr / ar). The dictionary is typed, so a missing one fails the
  build.
- **Read `node_modules/next/dist/docs/` before writing code.** Per `AGENTS.md`,
  this Next version differs from training data — `unstable_retry` rather than
  `reset` on error boundaries is one example already hit.

## Suggested scope

Booking reachability is the higher-value half and the smaller change; do it
first so it can ship even if the restructure runs long.

1. **Persistent booking affordance** on all four layouts — a floating button or
   sticky bar wired to the existing `whatsappUrl(...)` helper, visible from any
   scroll position, without covering content on mobile.
2. **Section order and density** — decide the canonical order (suggestion:
   hero → services → work → about/team → testimonials → contact) and give each
   section a stronger visual boundary so they are distinguishable while
   scrolling.
3. **Hero rework** — use the cover photo behind `PORTFOLIO_HERO` with a scrim,
   reduce its height, and fix the nav centring.
4. **Testimonials for `minimal`/`elegant`** — bring them up to the standard of
   the card treatment the other tones use.

## Verifying

Tests do not cover any of this. `npx tsc --noEmit`, `npx eslint .` and
`npm run build` all pass on broken layouts, so a browser check is the only real
verification:

```bash
npm run build && npm run start   # then visit the four preview routes
```

Check at both a phone width (~430px) and desktop (~1440px), and in **both**
colour schemes — Playwright's `colorScheme: 'dark'` reproduces the condition
behind several bugs here, since the public site must follow the owner's theme
rather than the visitor's device.

Note that `images.unsplash.com` is blocked from the sandbox, so the sample
photos fall back to the drawn placeholder there. That is expected and is not a
bug to chase.

---

## Direction change: four professions, not four skins

The owner's decision, and it supersedes the framing above. The four Portfolio
variants are currently the same section list rearranged and recoloured, which
is why they read as interchangeable. They should instead each target a
different kind of professional, with genuinely different sections, ordering and
emphasis:

```
Portfolio
├── Minimal       — the general-purpose one (salon, tutor, consultant, trades)
├── Creative      — designers, artists, agencies
├── Developer     — software engineers
└── Photographer  — photo and video
```

The test for whether this is done: someone should be able to tell which
template they are looking at with the colours stripped out. If two of them
differ only by palette and heading size, the job is not finished.

### What differs per template

Sketch, not settled - worth deciding deliberately before writing code, because
each variant's section set drives its data needs.

| Template | Leads with | Distinct sections | De-emphasised |
| --- | --- | --- | --- |
| Minimal | Who you are, what you do, how to book | Services with prices, hours, location | Long-form work showcase |
| Creative | A visual showreel | Big-format work grid, process, clients | Price lists |
| Developer | Projects and stack | Project cards with tech tags and repo/demo links, experience timeline, skills | Photo galleries, prices |
| Photographer | The photographs themselves | Full-bleed masonry/lightbox gallery, packages, booking | Text-heavy about |

Note that Developer needs data the model does not currently carry - a project's
tech tags and its repo/live links have no home in `PublicService` or the
gallery. Decide early whether to extend the content model or to express those
through existing fields, because it is the one item here that reaches the
backend.

### Implementation implications

- **`LayoutVariant` is persisted.** `business_websites.layout_variant` stores
  the enum name as a string, and `LayoutVariant.java` is the source of truth
  (it also carries the `displayOnly` flag). Renaming values therefore needs a
  migration mapping old names to new, in the same commit as the enum change -
  an unmapped row would fail to deserialise on read.
- **Decide rename vs. reuse.** Either rename the four values to
  `PORTFOLIO_MINIMAL` / `_CREATIVE` / `_DEVELOPER` / `_PHOTOGRAPHER` (clear
  code, one migration), or keep `HERO`/`BOLD`/`PROFILE` and change only their
  labels and designs (no migration, permanently confusing names). Renaming is
  worth the migration; the names are read constantly.
- **Frontend touch points for a rename:** the `LayoutVariant` union in
  `lib/api/types.ts`, `TEMPLATE_OPTIONS` and `DISPLAY_ONLY_LAYOUTS` in
  `lib/website/layout-options.ts`, `mockSiteFor()` in `lib/mock-preview-data.ts`,
  and the `/preview/mock/[variant]` route.
- **Each template needs its own sample business.** One salon cannot demonstrate
  four professions - a developer template showing "Haircut & Style · $25" makes
  the template look wrong rather than the data. `mockPortfolioSite()` currently
  returns one salon for all four; it needs to branch per variant, with photos
  to match (see `lib/mock-preview-images.ts`, which already has salon and food
  sets and would need developer/photographer ones).
- **The `tone` prop in `DynamicSections` is per-design, not per-template.** If
  the four designs diverge properly, the existing tones (`hero`, `minimal`,
  `bold`) will not map cleanly onto them and should be revisited alongside the
  layouts rather than bent to fit.

### Suggested sequencing

1. Settle the section list per template on paper first. Everything else follows
   from it, and it is cheap to change at this stage.
2. Rename the enum plus migration, as one commit, while the layouts still look
   as they do. A rename that changes no behaviour is easy to review and easy to
   revert.
3. Per-variant sample data, so each template can be judged against realistic
   content.
4. Then the designs, one template per commit.

Booking reachability from the section above still applies to all four, and is
still worth doing first - it is small, valuable on the current designs, and
survives the restructure.
