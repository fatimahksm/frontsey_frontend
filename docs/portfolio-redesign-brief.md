# Brief: rework the Portfolio templates

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
