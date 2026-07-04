# CV Builder — Implementation Plan

> Status: **planned, not built**. The "CV builder" mode chip on the `/jobs`
> landing is commented out (`features/jobs/components/job-search-landing.tsx`)
> until this flow ships — re-enable it then and point it at the builder screen
> instead of a plain chat thread.
>
> Non-negotiables (apply to every step below):
> - **Backend sends and stores DATA only** (structured JSON). No HTML, no PDF,
>   no rendered CV ever crosses the API. The frontend owns all rendering.
> - **Same design system.** Existing tokens from `app/globals.css` (green
>   `#58b685` accent, DM Sans, radius/shadow vars) — no new colors, fonts, or
>   component styles. Templates are "nice" through layout/typography, not new
>   UI systems.
> - **Mobile-first.** Primary target is mobile devices; every screen and every
>   template must be designed at 360px first and scale up.
> - No `any`, sanitized errors, i18n (en/ru/uz) for all UI strings.

## 1. What already exists (build on it, don't duplicate)

| Piece | Where | Notes |
|---|---|---|
| `Cv` model | `jobsterr-backend/prisma/models/cv.prisma` | `contentJson Json`, `type`, `status`, versions (`parentCvId`), `primaryLanguage CV_LANGUAGE`, `completenessScore`, `title` |
| `CvTranslation` | same file | per-language `contentJson` (+ legacy `pdfUrl` fields — unused by this plan) |
| AI CV generation | `GET /worker/ai/cv`, `POST /worker/ai/cv/for-job` (`workerAiService.buildCv…`) | builds CV content from the stored worker profile; quota-gated |
| Worker profile CRUD | worker-profile module + frontend profile feature | single source of truth for the underlying data |
| Preferred language | `User.language` (`APP_LANGUAGE` EN/RU/UZ) | synced from Settings; already used for chat replies |
| Model selection | `AiModelSelector` (use case × plan tier) | use `AI_USE_CASE.cvBuilder` |
| CV page | `/profile/cv` → `ProfileCvLoader` | current CV surface to grow into the builder |

## 2. Product flow (the requirement)

1. **Entry** — "CV builder" chip on `/jobs` (currently disabled) and `/profile/cv`.
2. **Completeness gate** — load the worker profile and check the REQUIRED set:
   name, profession, city/country, at least one experience entry (or an
   explicit "no experience" flag), skills (≥3), languages, education.
   - All present → skip straight to step 3.
   - Anything missing → a **guided wizard** (in-shell screen, sidebar visible,
     same field styles as the profile editors) showing ONLY the missing
     groups, one step per group, prefilled where possible. Saves through the
     **existing worker-profile endpoints** — the profile stays the single
     source of truth; the CV never forks the data.
3. **AI optimize** — `POST /cv/generate` (new, backend):
   - Reads the stored profile server-side (client sends nothing to trust).
   - `AiSdkClient.generateObject` against a strict CV JSON schema (summary,
     experience bullets, skills grouping, education, languages…).
   - **Output language = `User.language`** (the worker's preferred app
     language), with an optional `language` override in the body for extra
     versions later (reuses `CvTranslation`).
   - Plan-gated (CV feature entitlement), `@Throttle`, sanitized errors,
     `maxOutputTokens` bounded.
4. **Save** — the generated content is stored as a `Cv` row
   (`contentJson`, `primaryLanguage`, `completenessScore`). The user can edit
   any field afterwards (PATCH persists to the same row). **All data lives in
   the DB** — no localStorage.
5. **Templates (frontend only)** — 2–3 templates as React components +
   CSS-module styles built from the existing tokens:
   - `classic` — single column, serif-feel headings, print-safe.
   - `modern` — accent sidebar (brand green), two columns ≥640px, one below.
   - `compact` — dense single page for daily/blue-collar roles.
   Template picker = small preview cards (same card styles as the app).
   Selection saved via `PATCH /cv/:id { template }` (data only — the backend
   just remembers the string).
6. **Download (frontend)** —
   - **Phase 1 (zero deps):** a print-optimized render (A4 `@page` rules,
     `print:` styles) + `window.print()` → "Save as PDF". Works on mobile
     browsers' share/print sheet.
   - **Phase 2 (optional):** `@react-pdf/renderer` for a true one-tap `.pdf`
     file download; still rendered entirely client-side from the same JSON.
7. **Public CV** — a "Make public" toggle on the CV screen:
   - `PATCH /cv/:id { isPublic: true }` → backend generates a **unique slug**
     from the transliterated latin name (`getachew-m`, `-2`… on collision),
     stores it on the row, returns it. Slug is stable; flipping private keeps
     it reserved.
   - Public page **`peoplor.uz/cv/<slug>`** → `app/cv/[slug]/page.tsx`
     OUTSIDE the auth shell (no sidebar, branded header + "Powered by
     Peoplor" footer). Server component fetches `GET /cv/public/:slug`
     (public, no auth) and renders with the CV's saved template. Branded 404
     when the slug doesn't exist or the CV is private.
   - The public endpoint returns a **whitelisted projection only**: CV content
     + template + display name. No `userId`, no internal ids, and **no phone/
     email unless the worker enables "show contacts"** (a second toggle,
     default off). `@Throttle` + short cache headers.

## 3. Backend changes

Prisma (one migration, non-interactive flow per project convention):

```prisma
model Cv {
  // …existing fields…
  template String  @default("classic")
  isPublic Boolean @default(false)
  slug     String? @unique
  /// Public page shows phone/email only when the worker opts in.
  showContacts Boolean @default(false)
}
```

Endpoints (new `cv` module or extension of the existing worker AI module):

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/cv` | worker | list my CVs (id, title, template, isPublic, slug, updatedAt) |
| GET | `/cv/:id` | worker (owner) | full contentJson for editing/rendering |
| POST | `/cv/generate` | worker | AI-optimize from stored profile in `User.language`; creates/updates the row |
| PATCH | `/cv/:id` | worker (owner) | edit contentJson / title / `template` / `isPublic` / `showContacts` (slug minted on first publish) |
| DELETE | `/cv/:id` | worker (owner) | remove |
| GET | `/cv/public/:slug` | **public** | whitelisted data projection; 404 unless `isPublic` |

Zod DTOs, `ok()` envelope, `assert` ownership on every id, slug charset
`[a-z0-9-]{3,60}`.

## 4. Frontend layout

```
features/cv/
  components/cv-builder-screen.tsx    // gate → wizard → preview (in-shell)
  components/cv-wizard-steps.tsx      // missing-data steps (profile editors reused)
  components/cv-preview.tsx           // renders active template from JSON
  components/template-picker.tsx
  templates/classic.tsx / modern.tsx / compact.tsx (+ .module.css each)
  components/public-cv-view.tsx       // shared by /cv/[slug] and the preview
  hooks/use-cv.ts                     // TanStack Query: list/get/generate/patch
  services/cv.service.ts
app/cv/[slug]/page.tsx                // public page (no auth shell) + metadata
```

i18n keys under a new `cv.*` namespace in `lib/i18n/messages/{en,ru,uz}.ts`.

## 5. Phases

1. **P1 — core:** completeness gate + wizard, `POST /cv/generate` (preferred
   language), save/edit, `classic` template, print-to-PDF download.
2. **P2 — share:** template gallery (3 templates), public slug + `/cv/<slug>`
   page, show-contacts toggle, SEO/OG meta.
3. **P3 — polish:** `@react-pdf/renderer` file download, extra language
   versions via `CvTranslation`, share buttons (Telegram/WhatsApp), analytics
   events (`cv_generated`, `cv_published`, `cv_downloaded`).

## 6. Acceptance checklist

- [ ] Clicking CV builder with an incomplete profile opens the wizard showing only missing fields; with a complete profile it goes straight to generation.
- [ ] Generated CV arrives in the worker's preferred language; the worker can edit every field; everything persists in Postgres.
- [ ] API responses contain JSON data only — no markup, no files.
- [ ] Templates render correctly at 360px, 768px, and in print preview (A4).
- [ ] `peoplor.uz/cv/<slug>` renders publicly with the chosen template; private CVs 404; contacts hidden unless opted in.
- [ ] All UI uses existing tokens and passes the visual-diff sanity check; typecheck green; no new UI colors.
