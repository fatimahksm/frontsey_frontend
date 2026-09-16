<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Verifying a change to the public templates

`tsc`, `eslint` and `npm run build` all pass on a template that renders
unreadable text or scrolls sideways on a phone. Every visual regression this
project has had got through all three, so none of them is evidence a template
still works.

```bash
npm run test:e2e        # every template, both widths, both colour schemes
```

The suite drives `/preview/mock/{layoutVariant}`, which renders each template
from sample data with no backend running. It asserts the things that are never
intentional - a component that throws, an empty page, sideways scroll, a
heading that has vanished into its background - and deliberately not what a
design looks like, which is a judgement and would break on every intended
change.

Headings sitting over a photo or a gradient are skipped rather than guessed at;
judging those needs real pixels. A skip is reported as a skip so a green run is
never mistaken for coverage it does not have.

The suite runs at four widths, and 320 earns its place: the first run of it
found the Bistro menu's category strip pushing the page sideways, which nobody
had seen because it only happens below 375.

`/preview/mock/{variant}?count=200` pads the sample out to that many products.
Twelve is the right number for showing a design off and the wrong number for
reaching the paging, so `e2e/store-paging.spec.ts` drives that instead - it
asserts one page is rendered rather than the lot, that Show more adds another,
and that narrowing the list starts the count over. Confirmed to catch a
regression by removing the limit: six of its eight tests fail.

Note that `images.unsplash.com` is blocked in the sandbox, so the sample photos
fall back to `SafeImage`'s drawn placeholder. That is expected, and the failed
requests are filtered out of the console-error check.

Run that suite with the API stopped. It is built to need no backend; one that
is running but does not allow the suite's origin turns every template red with
a CORS error that says nothing about the templates.

# The owner's console

```bash
E2E_EMAIL=... E2E_PASSWORD=... E2E_WEBSITE_ID=... npx playwright test --project=console
```

Twenty-odd pages at 320, 390, 768 and 1280, asserting only that nothing sticks
out past the edge of the screen. Unlike the template suite this one signs in,
so it needs the API running with `http://localhost:3100` in its allowed
origins; without the three variables it skips rather than failing.

It exists because the console had no browser test at all, and the first run of
it found the top navigation pushing every dashboard page sideways on any phone,
plus five more pages doing the same at 320. All of those were invisible to
`tsc`, `eslint` and `npm run build`.

The same project also runs `e2e/console-item-paging.spec.ts`, which asserts the
owner's item list draws one page rather than the whole shop. Its first
assertion - that a load never draws more than a page - is checked before the
skip for a small website on purpose: deciding to skip from the absence of a
Show more button let a version that loaded all sixty items report a skip
instead of a failure. Confirmed to catch the regression by restoring the
unbounded fetch: it fails with "Expected <= 50, Received 60".

That suite signs in once per worker, so running it twice inside a quarter of an
hour spends the login allowance (ten attempts per fifteen minutes per address)
and every test then fails at `waitForURL`, which looks nothing like a rate
limit. Raise it for the run rather than reading it as a regression:

```bash
DBWB_RATELIMITS_LOGIN_LIMIT=1000 mvn spring-boot:run
```

# The console's design system

Everything a signed-in person looks at - the owner's console, the platform
admin, the dashboard - is built from the tokens at the top of
`app/globals.css` and the primitives in `components/ui/`. The public site
templates are **not**: they theme themselves from the owner's own palette
(`--theme-*`), which is the product.

Before adding a colour, a radius or a control, check whether one already
exists. The reason these were written down is that they had not been: the
console carried 127 hand-written copies of `text-zinc-500 dark:text-zinc-400`,
four radii used interchangeably, three separate segmented controls, three icon
vocabularies (one of them emoji), and a Button that defaulted to a full-width
gradient - which 92 call sites then fought with `w-auto`.

- **Text** is `text-foreground`, `text-muted`, `text-faint`. Three levels, no
  more.
- **Borders** are `border-line` between things inside a surface, and
  `border-line-strong` around something you can click or type into.
- **Radii**: buttons are `rounded-button` (a pill - part of how Frontsey
  looks, not an accident; a 10px button was tried and read as square against
  the rest of the product), fields are `rounded-control`, panels are
  `rounded-card`.
- **Buttons** are auto-width. `primary` is the gradient and **should appear
  once per screen** - a screen with two primaries has none. Everything else is
  `secondary`, `ghost` or `danger`. Pass `block` for a form's submit.
- **A Button never shrinks and never wraps its label**, so the row holding it
  has to wrap: any `flex` row with more than one button needs `flex-wrap`, or
  it will push a 320px screen sideways. This is the one way this design can
  break a phone, and it is what `e2e/console-responsive.spec.ts` caught the
  first time the new Button landed.
- **Icons** all come from `components/ui/icons.tsx`. No emoji anywhere behind a
  login: they render at a different size, weight and colour on every platform,
  which is the surest "unfinished" tell in an admin panel.
- **Fields** (`TextField`, `Select`, `Textarea`) share `FIELD_BASE`, and the
  select's chevron is drawn rather than left to the operating system.

## One console per website

`/manage/<id>/*` is the console. `/s/<slug>` is a short link that resolves the
slug and forwards into it, so an old bookmark still works.

There used to be two consoles - a "setup area" and a "site admin" with its own
shell, its own sign-in page and its own sessionStorage gate - listing mostly
the same sections. An owner clicking "Open dashboard" was asked to sign in
again to a product they were already signed in to, and the gate protected
nothing: the same account could open the same website from its dashboard
without it. Authorization is server-side and unchanged.

The sidebar comes from `components/console/nav.ts`, and section names come from
the template's own content plan - so the sidebar row, the page heading and the
page's own title are the same word. They were three different words.
**Section pages therefore have no `<h1>` of their own**; the shell prints it.
A sub-route (`/menu/items/new`) keeps its heading, and the shell stays quiet.

## Your own account

`components/layout/AccountMenu.tsx` in the top bar is where identity lives: the
signed-in email, the role, Account settings, Support and Log out.

It exists because there was no route to any of that. Support and Account sat in
the owner's nav as peers of Websites, and the Super Admin's nav had neither -
so the person who runs the platform could not open their own account page
without typing the URL. The page itself offered to export and permanently
delete an account it never named, and there was no way to change a password
while signed in at all.

`GET/PUT /api/account/me` and `POST /api/account/password` back it. The email
is deliberately not editable: it is the login and the address every reset goes
to, so changing it needs confirming at the new address rather than a text field
a typo can lock someone out of. Changing a password requires the current one
even though the caller is authenticated - a session on an unattended machine is
exactly the case that stops - and sends a "your password was changed" email,
because the time the owner did not do it is the time it matters.

One trap to know: `GlobalExceptionHandler` puts the humanised field name in
front of a constraint's message, so **every validation message must be a
fragment that completes the name** ("must be at least 8 characters"), never a
whole sentence. A sentence gets the name stapled to it - registration shipped
"Password Password must be at least 8 characters long" that way.
`ApiErrorResponseTest.aFieldsNameIsNotRepeatedInsideItsOwnMessage` holds it.

## The sidebar

Both consoles use one rail (`components/ui/SidebarNav.tsx`), and it does three
things, each of which was reported from a real screen rather than found here:

- **Full height.** It is `sticky` inside a box sized to the viewport - the
  console's is `h-screen`, the admin's is `h-[calc(100vh-3.5rem)]` under the
  top bar. The admin's was `h-full` inside a flex row only as tall as its own
  content, so the rail stopped under its last item. Correct-looking CSS that
  `tsc`, `eslint` and `npm run build` are all blind to.
- **Foldable**, down to its icons, remembered across visits
  (`lib/console/sidebar-collapse.ts`). localStorage is read through
  `useSyncExternalStore`, not copied into state in an effect: that gives a
  server snapshot matching the server's markup, the real value on the next
  render, and two tabs that agree. The width transition is gated on
  `hasToggled` so it animates when someone folds it and not on load.
- **A drawer below `lg`**, never a folded rail - it is already a sheet you
  opened, so offering to shrink it would be two ways to dismiss one thing.

`e2e/console-sidebar.spec.ts` holds all three. Confirmed against the original
bug by restoring `h-full`: the height test fails with "Expected > 0.9,
Received 0.6".

Both navigation rails carry an `aria-label` ("Sections", "Platform sections")
because the live preview panel beside them is a complementary region too -
without names, neither a screen reader nor a test can tell the two apart.
