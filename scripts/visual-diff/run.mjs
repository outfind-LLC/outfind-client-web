/**
 * Visual-diff runner — screenshots the prototype and the app at every breakpoint
 * and pixel-diffs them, so "pixel-perfect" becomes a measured number instead of
 * a guess. Run: `pnpm vdiff` (optionally `pnpm vdiff <nameFilter>`).
 *
 * Prereqs: dev server up on :8000; for `auth:true` targets, a captured session
 * (`pnpm vdiff:auth`). Output → `scripts/visual-diff/out/<name>/<width>-{proto,app,diff}.png`
 * plus a ranked `out/report.json` / console table (worst mismatch first).
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { targets, WIDTHS, APP_ORIGIN, PROTO_DIR } from "./targets.mjs";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const DIR = path.join(ROOT, "scripts", "visual-diff");
const OUT = path.join(DIR, "out");
const STORAGE = path.join(DIR, ".auth.json");
const TOKENS = path.join(DIR, ".auth.tokens.json");
/** Persisted per-role session — carries the rotated refresh token between runs
 * so the backend's refresh-token rotation doesn't dead-end the seed token. */
const stateFile = (role) => path.join(DIR, `.auth.${role}.state.json`);
const only = process.argv[2];

/** Full-page PNG with dynamic regions painted out (so the diff ignores data). */
async function shoot(page, masks) {
  const locators = (masks ?? []).map((s) => page.locator(s));
  return page.screenshot({
    fullPage: true,
    animations: "disabled",
    mask: locators,
    maskColor: "#FF00FF",
  });
}

/** Dev-only chrome that exists in the running app but never in the prototype
 * (or in production) — hidden so it can't pollute the diff. */
const HIDE_DEV_OVERLAYS = `
  nextjs-portal, [data-next-badge-root], [data-next-badge], [data-nextjs-toast],
  #__next-build-watcher, .nextjs-toast, [data-nextjs-dev-tools-button],
  .tsqd-parent-container, [data-tsqd], #react-query-devtools,
  .TanStackQueryDevtools { display: none !important; }
`;

/** Settle a page: light theme, no motion, hide dev chrome, fonts loaded, paint flushed. */
async function settle(page) {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.addStyleTag({ content: HIDE_DEV_OVERLAYS }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(450);
}

/** Crop a PNG to (w,h); returns the same object if already that size. */
function crop(png, w, h) {
  if (png.width === w && png.height === h) return png;
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0);
  return out;
}

function diff(aBuf, bBuf) {
  const a = PNG.sync.read(aBuf);
  const b = PNG.sync.read(bBuf);
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const ca = crop(a, w, h);
  const cb = crop(b, w, h);
  const out = new PNG({ width: w, height: h });
  const bad = pixelmatch(ca.data, cb.data, out.data, w, h, {
    threshold: 0.12,
    includeAA: false,
  });
  return {
    out,
    pct: +((bad / (w * h)) * 100).toFixed(2),
    widthMismatch: a.width !== b.width ? `${a.width}/${b.width}` : "",
    heightDelta: Math.abs(a.height - b.height),
    protoH: a.height,
    appH: b.height,
  };
}

async function capture(page, side, url, steps, masks) {
  await page.goto(url, { waitUntil: "load", timeout: 30_000 });
  await settle(page);
  if (steps) await steps(page);
  await page.waitForTimeout(200);
  return shoot(page, masks);
}

/** Read the gitignored token file: { worker?: {...}, employer?: {...} }. */
async function loadTokens() {
  try {
    return JSON.parse(await readFile(TOKENS, "utf8"));
  } catch {
    return null;
  }
}

/** Seed cookies for a role. Prefer the refresh token — the proxy mints fresh
 * short-lived access tokens from it, so the session survives a long sweep
 * (a bare access_token expires in ~15 min). Dev cookies: httpOnly, not secure. */
function cookiesForRole(t) {
  const base = {
    url: APP_ORIGIN,
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  };
  if (t.refresh_token)
    return [{ name: "refresh_token", value: t.refresh_token, ...base }];
  if (t.access_token)
    return [{ name: "access_token", value: t.access_token, ...base }];
  return [];
}

/** A browser context authenticated as `role`, or null if neither a persisted
 * session nor a seed token is available. Prefers the persisted session (it has
 * the latest rotated refresh token); falls back to the seed token, and re-seeds
 * from the token if the token file was edited more recently (user pasted a new
 * one) than the saved session. */
async function buildRoleContext(browser, role, tokens) {
  const sf = stateFile(role);
  const t = tokens?.[role];
  const hasToken = !!(t && (t.refresh_token || t.access_token));

  let opts = {};
  let seed = null;
  if (existsSync(sf)) {
    const tokenIsNewer =
      hasToken &&
      existsSync(TOKENS) &&
      statSync(TOKENS).mtimeMs > statSync(sf).mtimeMs;
    if (tokenIsNewer)
      seed = cookiesForRole(t); // user supplied a fresh token → restart chain
    else opts = { storageState: sf }; // continue the rotation chain
  } else if (hasToken) {
    seed = cookiesForRole(t);
  } else {
    return null;
  }

  const ctx = await browser.newContext({ deviceScaleFactor: 1, ...opts });
  if (seed) await ctx.addCookies(seed);
  // Drop a (possibly expired) access token ONLY when a refresh token exists to
  // mint a fresh one — a present-but-stale access cookie stops the proxy
  // refreshing (it mints only when ABSENT). With an access-only seed (no refresh,
  // i.e. the rotation-proof path), keep the access token as-is.
  const have = await ctx.cookies();
  if (have.some((c) => c.name === "refresh_token" && c.value)) {
    await ctx.clearCookies({ name: "access_token" }).catch(() => {});
  }
  // Employer screens sit behind the verification gate, which is now fully
  // backend-driven (EmployerProfile.verificationStatus). For employer screens to
  // render past the gate, the employer test account must be VERIFIED server-side
  // (approve it via the peoplor admin dashboard / DB). There is no localStorage
  // bypass anymore.
  return ctx;
}

/** Save a role context's session iff it ended the run authenticated (has a live
 * access token), so the next run continues the rotation chain. */
async function persistRoleSession(role, ctx) {
  if (!ctx) return false;
  const cookies = await ctx.cookies();
  const live = cookies.some((c) => c.name === "access_token" && c.value);
  if (live) {
    const state = await ctx.storageState();
    // Strip the access token ONLY when a refresh token can re-mint it (rotation
    // case). For an access-only (rotation-proof) session, KEEP it so the saved
    // session stays usable next run.
    if (state.cookies.some((c) => c.name === "refresh_token" && c.value)) {
      state.cookies = state.cookies.filter((c) => c.name !== "access_token");
    }
    await writeFile(stateFile(role), JSON.stringify(state));
  }
  return live;
}

async function main() {
  // Wipe everything only on a full run; a filtered run refreshes just its dirs.
  if (!only && existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const tokens = await loadTokens();

  // One context per role. Token file is primary; an interactive `.auth.json`
  // (from `pnpm vdiff:auth`) is used as a fallback for any role without a token.
  const legacy = existsSync(STORAGE)
    ? await browser.newContext({ storageState: STORAGE, deviceScaleFactor: 1 })
    : null;
  const contexts = {
    public: await browser.newContext({ deviceScaleFactor: 1 }),
    worker: (await buildRoleContext(browser, "worker", tokens)) ?? legacy,
    employer: (await buildRoleContext(browser, "employer", tokens)) ?? legacy,
  };

  const report = [];
  for (const t of targets) {
    if (only && !t.name.includes(only)) continue;
    const role = t.role ?? (t.auth ? "employer" : "public");
    const ctx = contexts[role];
    if (!ctx) {
      report.push({
        name: t.name,
        note: `skipped — no ${role} session (add to .auth.tokens.json or run pnpm vdiff:auth)`,
      });
      continue;
    }
    const dir = path.join(OUT, t.name);
    await mkdir(dir, { recursive: true });

    for (const width of WIDTHS) {
      const page = await ctx.newPage();
      await page.setViewportSize({ width, height: 900 });
      try {
        const protoUrl = pathToFileURL(
          path.join(ROOT, PROTO_DIR, t.proto.file),
        ).href;
        const protoBuf = await capture(
          page,
          "proto",
          protoUrl,
          t.proto.steps,
          t.protoMask,
        );
        const appBuf = await capture(
          page,
          "app",
          APP_ORIGIN + t.app.path,
          t.app.steps,
          t.appMask,
        );

        const d = diff(protoBuf, appBuf);
        await writeFile(path.join(dir, `${width}-proto.png`), protoBuf);
        await writeFile(path.join(dir, `${width}-app.png`), appBuf);
        await writeFile(
          path.join(dir, `${width}-diff.png`),
          PNG.sync.write(d.out),
        );
        report.push({
          name: t.name,
          width,
          "diff%": d.pct,
          widthMismatch: d.widthMismatch,
          heightDelta: d.heightDelta,
          protoH: d.protoH,
          appH: d.appH,
        });
      } catch (err) {
        report.push({ name: t.name, width, note: `ERROR: ${err.message}` });
      } finally {
        await page.close();
      }
    }
  }

  // Persist rotated sessions for the next run; report which roles stayed live.
  for (const role of ["worker", "employer"]) {
    const ctx = contexts[role];
    if (!ctx || ctx === contexts.public || ctx === legacy) continue;
    const live = await persistRoleSession(role, ctx);
    console.log(
      `session[${role}]: ${live ? "authenticated ✓ (saved)" : "NOT authenticated ✗ — seed token dead/missing"}`,
    );
  }

  report.sort((a, b) => (b["diff%"] ?? -1) - (a["diff%"] ?? -1));
  await writeFile(
    path.join(OUT, "report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    "\nVisual-diff report (worst first) — images in scripts/visual-diff/out/<name>/\n",
  );
  console.table(report);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
