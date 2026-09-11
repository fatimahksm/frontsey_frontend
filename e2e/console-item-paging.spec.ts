import { expect, test, type Page } from "@playwright/test";

/**
 * The owner's item list pages rather than drawing the whole shop.
 *
 * It used to fetch every item in one request and render the lot: a shop with
 * two thousand products assembled, sent and drew two thousand rows to show a
 * list the owner scrolls the first screen of. The API now answers with one
 * page and a total, and this asserts the screen actually uses it - that a
 * first load stops at the page size, that the count line is honest about how
 * much of the shop is on screen, and that Show more adds the next page rather
 * than reloading the same one.
 *
 * Needs the same three variables as the console suite, and additionally an
 * account whose website has more items than one page. With fewer it reports a
 * skip naming the reason, so a green run is never mistaken for coverage of
 * paging it could not reach.
 *
 *   E2E_EMAIL=... E2E_PASSWORD=... E2E_WEBSITE_ID=... npx playwright test --project=console
 */

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;
const WEBSITE_ID = process.env.E2E_WEBSITE_ID;

/** Must match ItemsPanel's own PAGE_SIZE; the point of the test is that the screen honours it. */
const PAGE_SIZE = 50;

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(EMAIL!);
  await page.getByLabel(/password/i).fill(PASSWORD!);
  await page.getByRole("button", { name: /log in|sign in/i }).first().click();
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 20000 });
}

/** The item rows, told apart from the other lists on the page by their links. */
function itemRows(page: Page) {
  return page.locator(`a[href*="/menu/items/"]`).filter({ hasNot: page.locator("button") });
}

test.describe("the owner's item list", () => {
  test.skip(!EMAIL || !PASSWORD || !WEBSITE_ID, "needs E2E_EMAIL, E2E_PASSWORD and E2E_WEBSITE_ID");
  test.setTimeout(120_000);

  test("renders one page, then one more on Show more", async ({ page }) => {
    await signIn(page);
    await page.goto(`/manage/${WEBSITE_ID}/menu`);

    const count = page.getByText(/Showing \d+ of \d+ items/);
    const showMore = page.getByRole("button", { name: "Show more" });

    // The list is fetched after the page renders, so nothing below is
    // meaningful until the first load has finished. Waiting for the first row
    // rather than a timeout is what keeps the skip honest.
    await expect(itemRows(page).first()).toBeVisible({ timeout: 30_000 });

    // The one assertion that holds for any website, and the one the screen
    // used to break: a first load never draws more than a page, whatever the
    // shop's size. It is checked before the skip on purpose - deciding to skip
    // from the absence of Show more would let a change that loads everything
    // at once turn this test into a silent skip, which is exactly the
    // regression it exists to catch.
    expect(await itemRows(page).count(), "a first load never draws more than one page")
      .toBeLessThanOrEqual(PAGE_SIZE);

    // A website small enough to fit on one page cannot exercise the rest.
    if (!(await showMore.isVisible().catch(() => false))) {
      test.skip(true, "this website has one page of items or fewer - nothing to page through");
    }

    const firstLine = (await count.textContent()) ?? "";
    const [, shown, total] = firstLine.match(/Showing (\d+) of (\d+) items/) ?? [];
    expect(Number(shown), "a first load stops at one page").toBe(PAGE_SIZE);
    expect(Number(total), "the total is the whole shop, not the page").toBeGreaterThan(PAGE_SIZE);
    await expect(itemRows(page)).toHaveCount(PAGE_SIZE);

    await showMore.click();

    const expected = Math.min(Number(total), PAGE_SIZE * 2);
    await expect(itemRows(page)).toHaveCount(expected);
    if (expected < Number(total)) {
      await expect(count).toHaveText(`Showing ${expected} of ${total} items`);
    } else {
      // Everything is on screen: the count line and the button have both gone.
      await expect(count).toHaveCount(0);
      await expect(showMore).toHaveCount(0);
    }
  });
});
