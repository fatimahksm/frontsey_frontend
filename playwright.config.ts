import { defineConfig, devices } from "@playwright/test";

/**
 * The Chromium this image already ships. Playwright otherwise looks for a
 * build numbered for its own version and asks you to run `playwright install`,
 * which is both a large download and unnecessary here. Override with
 * CHROMIUM_PATH if you are running somewhere that keeps it elsewhere.
 */
const chromium = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

/**
 * Browser tests, because nothing else here can see the templates.
 *
 * `tsc`, `eslint` and `npm run build` all pass on a layout that renders white
 * text on a white background or scrolls sideways on a phone - every visual
 * regression this project has had got through all three. A real browser is the
 * only thing that catches them.
 *
 * Against a production build rather than the dev server: dev-only overlays and
 * unminified CSS are not what visitors get, and the public site is exactly
 * where a difference would matter.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "line" : "list",

  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    // The public templates, in both schemes on purpose: the public site must
    // follow the owner's theme rather than the visitor's device, and several
    // bugs here were only ever visible in one of the two.
    { name: "desktop-light", testMatch: /template-smoke|store-paging/, use: { ...devices["Desktop Chrome"], colorScheme: "light", launchOptions: { executablePath: chromium } } },
    { name: "desktop-dark", testMatch: /template-smoke/, use: { ...devices["Desktop Chrome"], colorScheme: "dark", launchOptions: { executablePath: chromium } } },
    { name: "mobile-light", testMatch: /template-smoke|store-paging/, use: { ...devices["Pixel 7"], colorScheme: "light", launchOptions: { executablePath: chromium } } },
    { name: "mobile-dark", testMatch: /template-smoke/, use: { ...devices["Pixel 7"], colorScheme: "dark", launchOptions: { executablePath: chromium } } },
    // 320px: the narrowest phone still in real use, and where five of the
    // console's layout faults were found. The templates get it too, since a
    // page that scrolls sideways is a page that scrolls sideways.
    { name: "narrow-phone", testMatch: /template-smoke/, use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 720 }, isMobile: false, launchOptions: { executablePath: chromium } } },
    // The owner's console sets its own widths and does not depend on the
    // colour scheme, so it runs once rather than four times.
    // localhost rather than 127.0.0.1, which is the same machine and a
    // different origin as far as the API's CORS list is concerned - the
    // console suite signs in for real, so it has to come from an origin the
    // API allows.
    { name: "console", testMatch: /console-responsive/, use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3100", launchOptions: { executablePath: chromium } } },
  ],

  webServer: {
    command: "npm run build && npx next start --port 3100",
    url: "http://127.0.0.1:3100",
    // Never reuse. A server left running from an earlier build serves the code
    // from that build, so the suite passes on what was there before the change
    // under test - which is exactly how a deliberately broken layout once went
    // green here. Rebuilding every run costs a few seconds and is the only
    // thing that makes a green run mean anything.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
