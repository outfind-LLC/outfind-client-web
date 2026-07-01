/**
 * Visual-diff target map — each entry pairs a prototype HTML file (the design
 * source of truth in `_Peoplor_Design/`) with the app route that re-implements
 * it, so the harness can screenshot both at every breakpoint and diff them.
 *
 * Fields per target:
 *   name      unique slug → output folder `out/<name>/`
 *   role      "public" (default) | "worker" | "employer" — which session to use.
 *             Non-public roles need a token in `.auth.tokens.json` (or a captured
 *             `pnpm vdiff:auth` session); targets without one are skipped.
 *   proto     { file, steps?(page) }   the prototype side (file:// in `_Peoplor_Design`)
 *   app       { path,  steps?(page) }   the app side (http://127.0.0.1:8000<path>)
 *   protoMask / appMask  CSS selectors painted out before diffing (dynamic data:
 *             avatars, timestamps, randomised mock lists — neutralised on BOTH sides)
 *
 * `steps` is an async fn that drives the page to the same visual STATE on each
 * side (open a modal, switch a tab). Selectors differ per side because the app's
 * CSS-module class names are hashed — that's expected; target each side's DOM.
 */

export const PROTO_DIR = "_Peoplor_Design";
export const APP_ORIGIN = "http://127.0.0.1:8000";

/** The prototype's own breakpoints (880/820/720/560) plus desktop + phone. */
export const WIDTHS = [360, 560, 768, 1024, 1440];

export const targets = [
  // ---- Public (no session needed) -------------------------------------------
  {
    name: "landing-hero",
    auth: false,
    proto: { file: "Peoplor Landing.html" },
    app: { path: "/" },
    // KNOWN/ACCEPTED delta: app uses the colored brand mark, prototype uses a
    // black placeholder. Not masked — the mark regions don't align between sides
    // (footer is a wordmark image vs a mark+text lockup), so masking adds noise
    // rather than cancelling. The ~0.3% it contributes is expected, not a bug.
    protoMask: [],
    appMask: [],
  },

  // ---- Authenticated app shell (run `pnpm vdiff:auth` first) -----------------
  // Scaffolds: kept skipped until a session exists, then refined against the
  // first real diff. State `steps` + masks get filled in per screen.
  {
    // The Vacancy Wizard is a full-screen overlay opened from /vacancies. The
    // employer context is seeded "approved", so "Post a job" opens the wizard
    // (not the pending modal). Proto is the standalone wizard file.
    // NB: there's no employer-mode *chat* target — Peoplor Chat.html ships only
    // worker ("find") mode (the hire toggle isn't in the file), and the employer
    // shell reuses the worker shell component (validated via worker-newjob).
    name: "vacancy-wizard",
    role: "employer",
    proto: { file: "Vacancy Wizard.html" },
    app: {
      path: "/vacancies",
      steps: async (page) => {
        // Two "Post a job" buttons share the text (topbar + empty-state CTA); the
        // topbar one goes icon-only on mobile, so target the last (empty-state).
        const cta = page.getByRole("button", { name: /post a job/i }).last();
        await cta.scrollIntoViewIfNeeded().catch(() => {});
        await cta.click({ timeout: 15000 });
        await page.waitForTimeout(700);
      },
    },
    protoMask: [],
    appMask: [],
  },
  {
    // Smoke target: proves the worker session authenticates (app shell renders
    // instead of bouncing to the landing). Proto pairing refined later.
    name: "worker-newjob",
    role: "worker",
    proto: { file: "Peoplor Chat.html" },
    app: { path: "/jobs" },
    // Raw (unmasked): the Recent list / avatar / chips hold mock-vs-real DATA
    // whose heights don't align, so masking adds noise. Read the diff image and
    // separate design deltas (shifted/wrong-size elements) from data noise.
    protoMask: [],
    appMask: [],
  },
  {
    // Worker profile detail — the prototype renders it into #profile-root when
    // the Profile nav button is clicked (chat.js → profile.js showProfile()).
    name: "worker-profile",
    role: "worker",
    proto: {
      file: "Peoplor Chat.html",
      steps: async (page) => {
        await page
          .locator("#profile-nav-btn")
          .click({ timeout: 5000 })
          .catch(() => {});
        await page.waitForTimeout(600);
      },
    },
    app: { path: "/profile" },
    protoMask: [],
    appMask: [],
  },
  {
    // Employer company page. The prototype's company view lives in profile.js's
    // "hire" mode, which Peoplor Chat.html can't reach — so this is an APP
    // screenshot for visual review against profile.scoped.css (diff% ignorable).
    name: "employer-company",
    role: "employer",
    proto: { file: "Peoplor Chat.html" },
    app: { path: "/company" },
    protoMask: [],
    appMask: [],
  },
];
