# Visual-diff harness

Turns "pixel-perfect" into a **measured number**: screenshots each prototype
(`_Peoplor_Design/*.html`) and the app route that re-implements it, at every
breakpoint, and pixel-diffs them. The output is a ranked punch-list of exactly
where the app deviates from the design — per screen, per width — so we can drive
each delta to ~0.

## Prereqs

- Dev server running: `pnpm dev` (serves the app on `:8000`).
- Playwright browser installed once: `pnpm exec playwright install chromium`.

## Run

```bash
pnpm vdiff                 # all targets
pnpm vdiff landing         # only targets whose name contains "landing"
```

Output → `scripts/visual-diff/out/<target>/<width>-{proto,app,diff}.png` and a
ranked `out/report.json` (also printed as a table, worst mismatch first).

- **`<width>-proto.png`** — the design.
- **`<width>-app.png`** — our implementation.
- **`<width>-diff.png`** — pink = pixels that differ. Empty/black = match.
- **`diff%`** — share of pixels that differ. **`widthMismatch`** ≠ "" means the
  app overflows horizontally at that width (a real responsive bug).
  **`heightDelta`** flags a missing/extra section.

## Authenticated screens

App-shell routes (`/vacancies`, `/candidates`, …) are behind the auth proxy, so
they need a session. A target's `role` (`"worker"` | `"employer"`) picks which.
Two ways to provide one:

### Option A — paste session tokens (fastest, covers both roles)

```bash
cp scripts/visual-diff/.auth.tokens.example.json scripts/visual-diff/.auth.tokens.json
```

Then fill in the **`refresh_token`** for a **test worker** and a **test
employer**. Get each from your browser while signed in as that role: DevTools →
Application → Cookies → `http://127.0.0.1:8000` → copy the `refresh_token` value
(it's httpOnly but DevTools shows it). Prefer `refresh_token` over `access_token`
— the proxy mints fresh access tokens from it, so a long sweep won't expire.

`.auth.tokens.json` is git-ignored — **never commit it**; these are real session
credentials, so use throwaway test accounts.

### Option B — interactive login (single role)

```bash
pnpm vdiff:auth            # opens a browser — sign in, then press ENTER
```

Sign in as an **employer**; to diff the real screens (not the verify gate),
finish company setup and click **"Demo: approve as admin"**. The session is saved
to `.auth.json` (git-ignored) and used as the fallback for any role without a
token in `.auth.tokens.json`.

## Adding / refining a target

Edit `targets.mjs`. Each target pairs a prototype file with an app path and may
include `steps(page)` to drive both sides to the same state (open a modal, switch
a tab) and `protoMask`/`appMask` selectors to paint out dynamic data (avatars,
timestamps, randomised mock lists) so the diff only flags *layout/style* deltas.
The app's class names are hashed by CSS Modules — target each side's own DOM.
