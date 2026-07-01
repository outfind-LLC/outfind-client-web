/**
 * One-time session capture for the visual-diff harness. Opens a real browser so
 * you can sign in (social auth) as the role you want to screenshot, then saves
 * the session (cookies + localStorage, incl. the "Demo: approve" verified state)
 * to `.auth.json`. The runner reuses it for every `auth:true` target.
 *
 * Run: `pnpm vdiff:auth`. Re-run whenever the session expires or you switch role.
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const STORAGE = path.join(ROOT, "scripts", "visual-diff", ".auth.json");
const APP_ORIGIN = "http://127.0.0.1:8000";

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(`${APP_ORIGIN}/?signin=1`);

console.log(`
────────────────────────────────────────────────────────────
  Sign in as the role you want to diff (employer for the app
  shell). To capture the *verified* employer state, finish the
  company setup and click "Demo: approve as admin".

  When the app shell is fully loaded, press ENTER here.
────────────────────────────────────────────────────────────
`);

await new Promise((resolve) => process.stdin.once("data", resolve));
await ctx.storageState({ path: STORAGE });
console.log(`Saved session → ${STORAGE}`);
await browser.close();
process.exit(0);
