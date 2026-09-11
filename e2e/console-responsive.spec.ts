import { expect, test, type Page } from "@playwright/test";

/**
 * The owner's console, at the widths an owner actually uses.
 *
 * The public templates have had a browser test since they were built; the
 * twenty-odd pages an owner edits their site through had none, and it showed:
 * a first pass over them found the top navigation pushing every dashboard page
 * sideways on any phone, and five more pages doing the same at 320.
 *
 * This asserts only what is never intentional - a page that scrolls sideways,
 * or an element sticking out past the edge of the screen where nothing can
 * scroll it back. Not what anything looks like, which is a judgement and would
 * break on every intended change.
 *
 * It needs the API running, unlike the template suite, because there is no
 * console without a session. It skips itself when the credentials are not
 * given, so an ordinary run reports a skip rather than twenty misleading
 * failures.
 *
 *   E2E_EMAIL=... E2E_PASSWORD=... E2E_WEBSITE_ID=... npx playwright test --project=console
 *
 * The API must allow http://localhost:3100 as an origin, or the sign-in is
 * refused by CORS and every page fails for a reason that has nothing to do
 * with the layout - which is exactly what happened the first time this ran.
 */

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;
const WEBSITE_ID = process.env.E2E_WEBSITE_ID;

const WIDTHS = [
  { name: "320", width: 320, height: 720 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 900 },
];

function pagesFor(websiteId: string): string[] {
  return [
    "/dashboard", "/dashboard/account", "/dashboard/notifications", "/dashboard/websites/new",
    `/manage/${websiteId}`, `/manage/${websiteId}/setup`, `/manage/${websiteId}/profile`,
    `/manage/${websiteId}/menu`, `/manage/${websiteId}/menu/items/new`, `/manage/${websiteId}/menu/import`,
    `/manage/${websiteId}/gallery`, `/manage/${websiteId}/sections`, `/manage/${websiteId}/delivery`,
    // The content editors a portfolio or an events site uses. They render for
    // any website - an editor whose store is empty shows its empty state - so
    // they get the width check whatever the test account's template is.
    `/manage/${websiteId}/projects`, `/manage/${websiteId}/experience`,
    `/manage/${websiteId}/services`, `/manage/${websiteId}/event`,
    `/manage/${websiteId}/theme`, `/manage/${websiteId}/layout`, `/manage/${websiteId}/content`,
    `/manage/${websiteId}/share`, `/manage/${websiteId}/managers`, `/manage/${websiteId}/subscription`,
  ];
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(EMAIL!);
  await page.getByLabel(/password/i).fill(PASSWORD!);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 20000 });
}

/** Anything sticking out past the screen that no ancestor can scroll back into view. */
async function elementsPastTheEdge(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.right <= window.innerWidth + 2 && box.left >= -2) continue;
      // A deliberate scrolling strip is allowed to hold something wider than
      // itself - that is what it is for.
      let scrollable = false;
      for (let node = el.parentElement; node; node = node.parentElement) {
        const overflow = getComputedStyle(node).overflowX;
        if (overflow === "auto" || overflow === "scroll" || overflow === "hidden") { scrollable = true; break; }
      }
      if (scrollable || getComputedStyle(el).position === "fixed") continue;
      out.push(`<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> right=${Math.round(box.right)}`);
    }
    return out.slice(0, 4);
  });
}

for (const size of WIDTHS) {
  test.describe(`owner console at ${size.name}px`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test("fits the screen on every page", async ({ page }) => {
      test.skip(!EMAIL || !PASSWORD || !WEBSITE_ID,
        "Needs a running API and E2E_EMAIL / E2E_PASSWORD / E2E_WEBSITE_ID");
      // Nineteen pages, each given time to fetch its data before being
      // measured. The default thirty seconds is shorter than the walk itself,
      // which fails as a timeout and looks exactly like a layout failure.
      test.setTimeout(240_000);

      await signIn(page);

      const failures: string[] = [];
      for (const path of pagesFor(WEBSITE_ID!)) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        // The data lands after the shell, and it is the data that overflows.
        await page.waitForTimeout(2500);

        const sideways = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1);
        const past = await elementsPastTheEdge(page);
        if (sideways || past.length > 0) {
          failures.push(`${path}: ${sideways ? "page scrolls sideways; " : ""}${past.join(" | ")}`);
        }
      }

      expect(failures, `the console does not fit ${size.name}px:\n${failures.join("\n")}`).toEqual([]);
    });
  });
}
