import { expect, test, type Page } from "@playwright/test";

/**
 * The sidebar: full height, foldable, and a drawer on a phone.
 *
 * Each of these was reported from a real screen rather than found here. The
 * platform admin's rail stopped under its last row because the element was
 * `h-full` inside a row only as tall as its content - correct-looking CSS that
 * no amount of typechecking can catch - and there was no way to fold either
 * sidebar away on a small laptop.
 *
 *   E2E_EMAIL=... E2E_PASSWORD=... E2E_WEBSITE_ID=... npx playwright test --project=console
 *
 * Skips without credentials, the same as the other console specs.
 */

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;
const WEBSITE_ID = process.env.E2E_WEBSITE_ID;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 20000 });
}

/** The navigation rail - named, because the live preview beside it is a complementary region too. */
function rail(page: Page) {
  return page.getByRole("complementary", { name: /^(Sections|Platform sections)$/ });
}

/** The rail's height as a share of the window, so the assertion survives a different viewport. */
async function railHeightRatio(page: Page): Promise<number> {
  const box = await rail(page).boundingBox();
  if (!box) return 0;
  return box.height / page.viewportSize()!.height;
}

test.describe("the console sidebar", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.setTimeout(120_000);

  test("runs the full height of the screen", async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD || !WEBSITE_ID, "needs E2E_EMAIL, E2E_PASSWORD and E2E_WEBSITE_ID");
    await signIn(page, EMAIL!, PASSWORD!);
    await page.goto(`/manage/${WEBSITE_ID}`);
    await expect(rail(page)).toBeVisible();

    // A rail that stops under its last row is the bug this exists for. Not an
    // exact height: the console's sidebar is the window's, the admin's is the
    // window minus the top bar, and both are "the whole side".
    expect(await railHeightRatio(page), "the sidebar should reach the bottom of the window").toBeGreaterThan(0.9);
  });

  test("folds to its icons, and stays folded on the next page", async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD || !WEBSITE_ID, "needs E2E_EMAIL, E2E_PASSWORD and E2E_WEBSITE_ID");
    await signIn(page, EMAIL!, PASSWORD!);
    await page.goto(`/manage/${WEBSITE_ID}`);

    const aside = rail(page);
    const expanded = (await aside.boundingBox())!.width;
    expect(expanded).toBeGreaterThan(200);

    await page.getByRole("button", { name: /collapse the menu/i }).click();
    await expect.poll(async () => (await aside.boundingBox())!.width).toBeLessThan(100);

    // Still reaches the bottom folded - a narrower rail is still a rail.
    expect(await railHeightRatio(page)).toBeGreaterThan(0.9);
    // And the labels are gone rather than clipped, which is what makes it
    // narrow in the first place.
    await expect(rail(page).getByText("Business profile")).toHaveCount(0);

    // The point of remembering it: a preference about how someone works should
    // not have to be set again on every page.
    await page.goto(`/manage/${WEBSITE_ID}/profile`);
    await expect.poll(async () => (await aside.boundingBox())!.width).toBeLessThan(100);

    await page.getByRole("button", { name: /expand the menu/i }).click();
    await expect.poll(async () => (await aside.boundingBox())!.width).toBeGreaterThan(200);
  });

  test("is a drawer on a phone, not a rail", async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD || !WEBSITE_ID, "needs E2E_EMAIL, E2E_PASSWORD and E2E_WEBSITE_ID");
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, EMAIL!, PASSWORD!);
    await page.goto(`/manage/${WEBSITE_ID}/menu`);

    // Nothing takes the side of a 390px screen.
    await expect(rail(page)).toBeHidden();

    await page.getByRole("button", { name: /open menu/i }).click();
    const drawerLink = page.getByRole("link", { name: "Business profile" });
    await expect(drawerLink).toBeVisible();

    // Following a link closes it, rather than leaving the sheet over the page
    // it just opened.
    await drawerLink.click();
    await expect(drawerLink).toBeHidden();
  });

  test("the platform admin's rail is full height too", async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "needs E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");
    await signIn(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    await page.goto("/admin/websites");
    await expect(rail(page)).toBeVisible();

    // This is the one that was broken: `h-full` in a row that was only as tall
    // as its own content.
    expect(await railHeightRatio(page), "the admin sidebar should reach the bottom").toBeGreaterThan(0.9);
  });
});
