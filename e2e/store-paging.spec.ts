import { expect, test, type Page } from "@playwright/test";

import { PAGE_SIZE } from "../lib/site/paging";

/**
 * What the shop templates do with a shop's actual stock.
 *
 * The sample has twelve products, which is the right number for showing a
 * design off and the wrong number for ever reaching the paging - so until this
 * existed, "renders 30 and offers the rest" was verified by hand and by
 * nothing else. `?count=` pads the sample out, and these drive the result.
 *
 * The assertions are about behaviour, not appearance: how many rows are
 * rendered, that the button adds more, that narrowing the list starts the
 * count again. A page that showed everything at once would fail the first one.
 */

const STORES = ["STORE_SHOWCASE", "STORE_CATALOG"] as const;
const STOCK = 120;

async function openShop(page: Page, variant: string) {
  await page.goto(`/preview/mock/${variant}?count=${STOCK}`);
  await page.waitForLoadState("networkidle");
  // The sample banner sits over the top of the page; out of the way first.
  await page.getByRole("button", { name: /^Close$/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);
}

/**
 * Products on screen. Both templates mark a product as an <article>, so this
 * is one selector rather than a structural guess per template - the first
 * attempt counted "main ul > li", which also counted the opening hours.
 */
async function productCount(page: Page): Promise<number> {
  return page.locator("article").count();
}

for (const variant of STORES) {
  test.describe(variant, () => {
    test(`renders one page of ${PAGE_SIZE} rather than all ${STOCK}`, async ({ page }) => {
      await openShop(page, variant);

      const rendered = await productCount(page);
      expect(rendered, `${variant} rendered ${rendered} of ${STOCK} products at once`).toBe(PAGE_SIZE);
      await expect(page.getByRole("button", { name: /show more/i })).toBeVisible();
    });

    test("show more adds another page, and says how far through the list it is", async ({ page }) => {
      await openShop(page, variant);

      await expect(page.getByText(new RegExp(`showing ${PAGE_SIZE} of `, "i"))).toBeVisible();
      await page.getByRole("button", { name: /show more/i }).click();
      await page.waitForTimeout(400);

      expect(await productCount(page)).toBe(PAGE_SIZE * 2);
      await expect(page.getByText(new RegExp(`showing ${PAGE_SIZE * 2} of `, "i"))).toBeVisible();
    });

    test("narrowing the list starts the count again", async ({ page }) => {
      await openShop(page, variant);

      await page.getByRole("button", { name: /show more/i }).click();
      await page.waitForTimeout(400);
      expect(await productCount(page)).toBe(PAGE_SIZE * 2);

      // Keeping ninety rows of a list you no longer have would be the page
      // lying about what is at the top of it.
      const search = page.getByPlaceholder(/search products/i);
      if (await search.count() === 0) {
        // The shop front keeps its search behind an icon.
        await page.getByRole("button", { name: /search products/i }).first().click();
      }
      await page.getByPlaceholder(/search products/i).fill("Soy");
      await page.waitForTimeout(600);

      const afterSearch = await productCount(page);
      expect(afterSearch).toBeLessThanOrEqual(PAGE_SIZE);
    });

    test("a hundred products still fit the screen sideways", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await openShop(page, variant);

      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(sideways, `${variant} scrolls sideways at 320px with ${STOCK} products`).toBe(false);
    });
  });
}
