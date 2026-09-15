import { expect, test, type Page } from "@playwright/test";

/**
 * The platform admin, at the widths it is actually opened at.
 *
 * It had no browser test at all, which is how it kept its own icon set, its
 * own sidebar and its own row of pills for three surfaces that were supposed
 * to be one product - nothing was watching. Now that those are shared with the
 * owner's console, a change to the shared pieces can break this layout without
 * touching a file under app/admin, and only a browser can tell.
 *
 * It asserts the same one thing the owner suite does and nothing more: no
 * element sticking out past the edge of the screen where nothing can scroll it
 * back. Not what anything looks like, which is a judgement.
 *
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npx playwright test --project=console
 *
 * Without the two variables it skips rather than failing, the same way the
 * owner suite does - a run with no admin account reports a skip, not a pass.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

const WIDTHS = [
  { name: "320", width: 320, height: 720 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 900 },
];

const PAGES = [
  "/admin",
  "/admin/websites",
  "/admin/users",
  "/admin/support",
  "/admin/template-pricing",
  "/admin/plans",
  "/admin/themes",
  "/admin/audit-log",
];

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(EMAIL!);
  await page.getByLabel(/password/i).fill(PASSWORD!);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/(admin|dashboard)/, { timeout: 20000 });
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
      // itself - a wide table is read by scrolling it, not by shrinking it.
      let scrollable = false;
      for (let node = el.parentElement; node; node = node.parentElement) {
        const overflow = getComputedStyle(node).overflowX;
        if (overflow === "auto" || overflow === "scroll" || overflow === "hidden") {
          scrollable = true;
          break;
        }
      }
      if (scrollable || getComputedStyle(el).position === "fixed") continue;
      out.push(`<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> right=${Math.round(box.right)}`);
    }
    return out.slice(0, 4);
  });
}

for (const size of WIDTHS) {
  test.describe(`platform admin at ${size.name}px`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test("fits the screen on every page", async ({ page }) => {
      test.skip(!EMAIL || !PASSWORD, "Needs a running API and E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD");
      // Eight pages, each given time to fetch before being measured. The
      // default thirty seconds is shorter than the walk itself, and a timeout
      // reads exactly like a layout failure.
      test.setTimeout(180_000);

      await signIn(page);

      const failures: string[] = [];
      for (const path of PAGES) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);

        const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        const past = await elementsPastTheEdge(page);
        if (sideways || past.length > 0) {
          failures.push(`${path}: ${sideways ? "page scrolls sideways; " : ""}${past.join(" | ")}`);
        }
      }

      expect(failures, `the admin does not fit ${size.name}px:\n${failures.join("\n")}`).toEqual([]);
    });
  });
}
