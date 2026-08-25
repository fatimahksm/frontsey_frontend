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
    // Both schemes, on purpose. The public site must follow the owner's theme
    // rather than the visitor's device, and several bugs here were only ever
    // visible in one of the two.
    { name: "desktop-light", use: { ...devices["Desktop Chrome"], colorScheme: "light", launchOptions: { executablePath: chromium } } },
    { name: "desktop-dark", use: { ...devices["Desktop Chrome"], colorScheme: "dark", launchOptions: { executablePath: chromium } } },
    { name: "mobile-light", use: { ...devices["Pixel 7"], colorScheme: "light", launchOptions: { executablePath: chromium } } },
    { name: "mobile-dark", use: { ...devices["Pixel 7"], colorScheme: "dark", launchOptions: { executablePath: chromium } } },
  ],

  webServer: {
    command: "npm run build && npx next start --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
