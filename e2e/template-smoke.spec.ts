import { expect, test, type Locator } from "@playwright/test";

/**
 * A smoke pass over every template, at both widths and in both colour schemes.
 *
 * These do not assert what a design looks like - that is a judgement, and
 * pinning it would break on every intentional change. They assert the things
 * that are never on purpose: text nobody can read, a page that scrolls
 * sideways on a phone, a component that throws, an empty screen.
 *
 * Every one of those has actually happened here. The theme palette being
 * applied inline once forced a deliberately dark layout light and left its
 * white text invisible, and `npm run build` was perfectly happy with it.
 */

const LAYOUTS = [
  "MENU_CLASSIC",
  "MENU_GRID",
  "MENU_ELEGANT",
  "MENU_BISTRO",
  "PORTFOLIO_PROFESSIONAL",
  "PORTFOLIO_VISUAL",
  "PORTFOLIO_BRAND",
  "PORTFOLIO_SERVICES",
] as const;

/** Relative luminance, per WCAG. */
function luminance([r, g, b]: number[]): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(foreground: number[], background: number[]): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(colour: string): number[] | null {
  const match = colour.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  // A fully transparent colour is not what the eye sees; the walk up the
  // ancestor chain below is what resolves it.
  if (match[4] !== undefined && Number(match[4]) === 0) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * What is painted behind an element: either a flat colour we can measure, or
 * media we cannot.
 *
 * The distinction matters. A heading over a cover photo with a dark scrim is
 * white text on a black gradient - perfectly readable, and both the photo and
 * the gradient are background *images*, so reading backgroundColor up the
 * ancestor chain sees white on white and cries wolf. Judging that case needs
 * real pixels, which is a heavier tool than this file should reach for, so it
 * says so rather than guessing.
 */
type Backdrop = { kind: "colour"; rgb: number[] } | { kind: "media" } | { kind: "unknown" };

async function backdropBehind(heading: Locator): Promise<Backdrop> {
  const chain = await heading.evaluate((start: Element) => {

    const box = start.getBoundingClientRect();
    // Anything absolutely placed that covers the heading's box and carries a
    // photo or a gradient - the scrim pattern every hero here uses.
    const covered = Array.from(document.querySelectorAll("img, [class], [style]")).some((node) => {
      const style = getComputedStyle(node);
      if (style.position !== "absolute" && style.position !== "fixed") return false;
      const other = node.getBoundingClientRect();
      const covers = other.left <= box.left && other.right >= box.right
        && other.top <= box.top && other.bottom >= box.bottom;
      return covers && (node.tagName === "IMG" || style.backgroundImage !== "none");
    });

    const layers: { colour: string; image: string }[] = [];
    for (let node: Element | null = start; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      layers.push({ colour: style.backgroundColor, image: style.backgroundImage });
    }
    const bodyStyle = getComputedStyle(document.body);
    layers.push({ colour: bodyStyle.backgroundColor, image: bodyStyle.backgroundImage });
    return { covered, layers };
  });

  if (!chain) return { kind: "unknown" };
  if (chain.covered) return { kind: "media" };

  for (const layer of chain.layers) {
    if (layer.image !== "none") return { kind: "media" };
    const parsed = parseRgb(layer.colour);
    if (parsed) return { kind: "colour", rgb: parsed };
  }
  return { kind: "unknown" };
}

for (const layout of LAYOUTS) {
  test.describe(layout, () => {
    test("renders without throwing, and shows something", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        // A blocked or dead image URL is not a code failure - SafeImage exists
        // precisely to degrade to a drawn placeholder when one happens, and
        // this sandbox blocks images.unsplash.com, which the samples use. Only
        // real script errors should fail this.
        if (/Failed to load resource|net::ERR_/.test(message.text())) return;
        errors.push(message.text());
      });

      await page.goto(`/preview/mock/${layout}`);
      await page.waitForLoadState("networkidle");

      // The sample banner proves the route resolved and the renderer mounted.
      await expect(page.getByText("Sample preview", { exact: false })).toBeVisible();

      // A heading somewhere - an empty template is the failure this catches.
      await expect(page.locator("h1, h2").first()).toBeVisible();

      expect(errors, `console/page errors on ${layout}:\n${errors.join("\n")}`).toEqual([]);
    });

    test("does not scroll sideways", async ({ page }) => {
      await page.goto(`/preview/mock/${layout}`);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      // One pixel of slack for sub-pixel rounding; anything more is a real
      // element pushing the page wider than the screen.
      expect(
        overflow.scrollWidth,
        `${layout} is ${overflow.scrollWidth - overflow.clientWidth}px wider than the viewport`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    });

    test("its headings are readable against what is behind them", async ({ page }, testInfo) => {
      await page.goto(`/preview/mock/${layout}`);
      await page.waitForLoadState("networkidle");

      const headings = page.locator("h1, h2");
      const total = await headings.count();
      expect(total, `${layout} renders no headings at all`).toBeGreaterThan(0);

      // Every heading, not just the first. Checking only the top one meant a
      // heading further down could vanish into its section's background and
      // the test would still be green - which is exactly what happened when
      // this was tried against a deliberately broken layout.
      const unreadable: string[] = [];
      let measured = 0;

      for (let i = 0; i < total; i++) {
        const heading = headings.nth(i);
        if (!(await heading.isVisible())) continue;

        const backdrop = await backdropBehind(heading);
        // Text over a photo or a gradient needs real pixels to judge; see the
        // note on backdropBehind. Left unmeasured rather than guessed at.
        if (backdrop.kind !== "colour") continue;

        const style = await heading.evaluate((el) => {
          const computed = getComputedStyle(el);
          return { color: computed.color, opacity: Number(computed.opacity) };
        });
        const colour = parseRgb(style.color);
        if (!colour) continue;

        // Opacity is part of what the eye gets: a heading at opacity 0.05 is
        // invisible however good its colour is on paper. Blend it against the
        // backdrop before measuring.
        const blended = colour.map((channel, c) =>
          Math.round(channel * style.opacity + backdrop.rgb[c] * (1 - style.opacity)));

        measured++;
        // 3:1 is WCAG AA for large text. Deliberately the large-text threshold
        // and not 4.5 - these are headings, and the point is to catch text that
        // has vanished into its background, not to grade the palette.
        const ratio = contrastRatio(blended, backdrop.rgb);
        if (ratio < 3) {
          const text = (await heading.textContent())?.trim().slice(0, 40) ?? "";
          unreadable.push(`"${text}" - ${style.color} at opacity ${style.opacity} on rgb(${backdrop.rgb}) is ${ratio.toFixed(2)}:1`);
        }
      }

      expect(unreadable, `${layout} has unreadable headings:\n${unreadable.join("\n")}`).toEqual([]);

      if (measured === 0) {
        testInfo.skip(true, `${layout}: every heading sits over media, so none could be measured this way`);
      }
    });
  });
}
