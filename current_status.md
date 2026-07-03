# Peoplor — MVP Current Status

> **Purpose:** single source of truth for *what is built vs not* against the MVP
> launch test plan. Verified by reading actual code in both repos on **2026-07-02**
> (frontend `jobsterr-frontend`, backend `jobsterr-backend`). Honest, not aspirational —
> a flow is only "✅ Built" if it is wired end-to-end to a real endpoint.

**Legend**

| Mark | Meaning |
|---|---|
| ✅ **Built** | Real, wired end-to-end (frontend → real API → DB), ready to test |
| ◑ **Partial** | Works but with a gap: missing sub-parts, or one side wired and the other on a mock seam |
| ⚠ **Mock** | UI exists but runs on mock/local seam data (`peoplor_*`, `MOCK_*`); real endpoint may or may not exist yet |
| ❌ **Not built** | Does not exist |

Each row shows **FE** (frontend) and **BE** (backend) separately, because several
employer endpoints are *built on the backend but the frontend still reads a mock
seam* — those just need wiring, not new backend work.

---

## 1. Worker side (mobile-first — primary test target: Android Chrome + Telegram in-app browser)

| # | Flow | FE | BE | Verdict | Gap to close before it passes |
|---|---|---|---|---|---|
| **W1** | Sign up with Google | ✅ | ✅ | ✅ **Built** | Lands on `/chat` dispatcher → default worker tab (job feed). Google OAuth full loop. Test the redirect on the real domain. |
| **W2** | Sign up with Telegram | ✅ | ✅ | ◑ **Config-gated** | Code complete both sides (HMAC verify, widget popup). **Won't complete on localhost** — needs `NEXT_PUBLIC_TELEGRAM_BOT_ID`/`_USERNAME` + a BotFather-registered HTTPS domain. Verify on staging. |
| **W3** | Browse jobs before completing profile | ◑ | ✅ | ◑ **Partial** | Works for signed-in profile-incomplete users (feed is real DB search). **No anonymous browse** — `/jobs` is auth-protected; signed-out users bounce to sign-in. **Product decision needed:** is "jobs-first" required *before* signup, or is jobs-first-after-signup acceptable for MVP? **Supply now backed by the shared Job Acquisition inventory** (2026-07-03) — see §3 S8. |
| **W4** | Create profile via voice | ✅ | ✅ | ✅ **Built (2026-07-03)** | Full loop wired: a **"Speak to autofill"** mic panel on the worker profile setup form → STT → `POST /worker/ai/parse-profile` → prefills profession/experience/skills/target countries/salary/relocation → edit → save. Reuses the chat `useSpeechRecognition` hook. (Richer parsed data — languages/work-history/education — is added afterward in the section editors.) |
| **W5** | Create profile via text (fallback) | ✅ | ✅ | ✅ **Built** | `worker-profile-setup.tsx` → `PATCH /worker/profile/job-search` (upserts). Real API. |
| **W6** | AI CV / profile generation | ✅ | ✅ | ✅ **Built** | Resume Builder at `/tools` → `GET /worker/ai/cv` (feature-gated `CV_GENERATION`). Verify latency < 60s and coherence on real profiles. |
| **W7** | Apply to a job | ✅ | ✅ | ✅ **Built** | `POST /worker/vacancies/:id/apply` (cover letter + sendMethod), toast confirm + opens thread. |
| **W8** | Application status visible | ✅ | ✅ | ✅ **Built** | `GET /worker/applications` maps employer actions (VIEWED/ACCEPTED/REJECTED + unread) to labels. |
| **W9** | Edit profile after creation | ✅ | ✅ | ◑ **Built (minor stubs)** | Section CRUD (info/experience/education/languages) is real and persists. Toast-only stubs: résumé kebab (duplicate/download/share/delete) + "My Resumes" card (derived seam, no `/worker/profile/resumes` yet). Core edit passes. |

**Worker verdict:** the core activation loop (**W5 → W6 → W7 → W8**) is real and testable
today. Open items: W4 voice-to-profile (build or drop for MVP), W3 anonymous-browse
decision, W2 domain config.

---

## 2. Employer side (desktop-primary: Desktop Chrome)

| # | Flow | FE | BE | Verdict | Gap to close before it passes |
|---|---|---|---|---|---|
| **E1** | Create company account | ✅ | ✅ | ✅ **Built (2026-07-03)** | Create form → `POST /employer/profile` (full field set: taxId, tagline, foundedYear, registeredAddress, contactName). **localStorage seams removed:** verification is now derived purely from `EmployerProfile.verificationStatus` (no `peoplor_employer_verify_v1`, no demo "approve" — approval is admin-side); tagline / founded / **locations** now persist via `PATCH /employer/profile` + `POST/PATCH/DELETE /employer/profile/locations` (company-extras seam `peoplor_company_extras_v1` deleted). Company **voice-parse** wired: "Speak to autofill" → `POST /employer/profile/parse`. |
| **E2** | Post a job — AI-assisted | ✅ | ✅ | ✅ **Built (2026-07-03)** | Vacancy wizard header has a **"🎙 Speak"** control → `POST /employer/vacancies/parse` → prefills the free-form wizard fields (title, description, salary, currency, skills, city, team). Employer completes the option/enum steps. **DRAFT**: the header "Save draft" now persists a real backend DRAFT (`saveAsDraft:true`, invisible to workers); publish it from the Vacancies list kebab ("Publish"). |
| **E3** | Post a job — manual | ✅ | ✅ | ✅ **Built (2026-07-03)** | Wizard (regular 5-step + daily 3-step) → `POST /employer/vacancies` now sends the **full field set**: `kind` (REGULAR/DAILY), profession, category, address, workFormat, workArrangement, workSchedule, teamSize, paymentType/Frequency/Note, workDate+shiftHours (daily, with a pre-publish date guard), educationRequired, probationMonths, languageRequirements `[{language,level}]`, visibility, acceptResponses, employer `description`. "Company website" intentionally not sent (lives on the employer profile — no vacancy column). |
| **E4** | Job detail page | ✅ | ✅ | ✅ **Built** | `GET /employer/vacancies/:id` renders all fields + lifecycle/edit/delete. |
| **E5** | Applicants list | ✅ | ✅ | ✅ **Built (2026-07-03)** | Per-vacancy list real (`GET /employer/vacancies/:id/applications`) AND the main Candidates inbox is now real (`GET /employer/applications`). **Mock seam deleted entirely** (`employer-mocks.ts` removed, incl. its localStorage message log). |
| **E6** | Candidate profile + "Best match" badge | ✅ | ✅ | ◑ **Built (match % empty)** | Profile opens via `GET /employer/applications/:id/candidate` (degrades gracefully). "Best match" badge is correctly **worker-only**; employer shows a numeric **% match gauge** — but the underlying `matchScore` is **always null** (see S1), so the % is not populated yet. |
| **E7** | Candidate action (shortlist / contact / reject) | ◑ | ✅ | ◑ **Mostly built (2026-07-03)** | **Reject/status:** real (`PATCH /employer/applications/:id/status`). **Contact:** real (mock seam gone). **Shortlist:** now wired to `GET /employer/shortlist` (list + remove via `DELETE /employer/shortlist/:id`; hooks in `use-shortlist.ts`, incl. `useAddToShortlist`). Remaining: no "add to shortlist" button surface yet (comes with candidate search, S-row `findCandidates`). |
| **E8** | Dashboard metrics | ❌ | ✅ | ◑ **BE-only** | No employer dashboard/metrics page on FE (only client-derived vacancy tab counts). `GET /employer/stats` → `{ openRoles, applicants, hiresThisYear }` **is built** — needs a metrics strip/page to consume it. |

**Employer verdict:** the *hardest* backend pieces are done. The employer gaps are
mostly **frontend wiring of already-built endpoints** (E5 inbox, E7 shortlist, E8
stats) plus two real builds: **E2 AI job drafting** and **E3 full-field submit**.

---

## 3. System & quality

| # | Check | Status | Detail |
|---|---|---|---|
| **S1** | Matching pipeline | ❌ **Not built (compute)** | `VacancyMatchScore` model + read/fallback path exist, but **nothing ever computes scores** — no scoring service, no queue, no cron. `matchScore` is always `null`; the recommendation list falls back to "recent active vacancies." New job → no matches; new worker → no scores. **This is what makes E6's % and worker Best-match meaningful — it must be built.** |
| **S2** | Notifications (Telegram / email) | ❌ **Not built** | No notifications module, no queue, no email provider (nodemailer/resend/etc.), no Telegram bot-send. Telegram is **login-only**. Notification preference toggles are stored (`UserSettings`) but **nothing reads them to send**. Zero channels deliver. |
| **S3** | Analytics / event logging | ✅ **Built (BE + FE)** | Backend shipped 2026-07-03 (`AppEvent` stream, Layer-A/ERROR/Layer-B, `POST /events/track`). **FE client shipped 2026-07-03**: `lib/analytics` (batched, `keepalive` fetch, DNT-aware, anon `sessionId`) + `AnalyticsProvider` (flush on tab-hide/unload) + `useTrack()`; emits `profile_started`, `voice_recording_completed`, `job_post_started` (more names are one-line `track()` calls — the allow-list mirrors the backend). See [`docs/features/event-logging-and-ai-parse.md`](docs/features/event-logging-and-ai-parse.md). |
| **S4** | Performance (< 3s on mid-range Android) | ◑ **Needs measurement** | Good foundations: cursor pagination, `select`-only queries, no-N+1 list reads, memoized lists, design-token transitions. **Not yet measured** on a real mid-range Android / mobile data. Needs a field pass once S1–S3 land. |
| **S5** | Empty states | ◑ **Partial** | Many screens have proper empty states (e.g. per-vacancy applicants). But the employer inbox/shortlist currently show **mock rows instead of an empty state** (mock seam) — a new employer would see fake data, not an empty screen. Fix falls out of E5/E7 wiring. |
| **S6** | Bad input (voice noise/silence → graceful) | ◑ **Partial / N/A** | Voice exists only in the chat composer (STT), not profile (W4). Web Speech API error/`no-speech` handling should be verified there; the profile voice flow doesn't exist to test. |
| **S7** | Session persistence | ✅ **Built** | httpOnly `access_token`/`refresh_token`, DB-backed refresh with **rotation + reuse-revocation**, single-flight refresh on the client. Survives app/browser restart. |
| **S8** | Job supply / shared inventory | ◑ **Backend built; disabled by default** | **Root cause of "1–2 jobs, same for everyone" fixed** (2026-07-03): a background **Job Acquisition engine** (`src/modules/job-acquisition/`) harvests real openings into a shared, deduped `Vacancy` inventory, gated to **direct employer contacts only** (email/phone/WhatsApp/Telegram/Google-Form; never a board link). The Job Finder search is now multi-field and inventory-first; the live LLM search is a **write-through fallback**; each worker search **registers a demand target**. Off until `JOB_ACQUISITION_ENABLED=true` (+ Redis + AI gateway key). See [`jobsterr-backend/docs/features/job-acquisition.md`](../jobsterr-backend/docs/features/job-acquisition.md). |
| **S9** | AI model governance | ✅ **Backend built** | **Model is now chosen server-side per use-case × plan tier** (2026-07-03), never by the frontend. Registry `src/modules/ai-sdk/constants/model-registry.ts` + `AiModelSelector` (reads `PlanService.getUserModelTier`). **Free-plan users get cheaper models** (Gemini Flash / Perplexity Sonar / GPT-nano); paid users get Claude Sonnet / Sonar-Pro. Task-fit, multilingual-aware (UZ/RU/EN), not "Claude for everything." FE-supplied `model` is dropped from the chat DTO. Full rationale + pricing in [`jobsterr-backend/docs/CHOOSE_MODEL.md`](../jobsterr-backend/docs/CHOOSE_MODEL.md). **FE follow-up:** remove the model picker (backend already ignores it). |

---

## 4. Event & Analytics Logging — **NEW requirement (to implement)**

> Requested: log **every meaningful event to the DB with full context** — *who
> triggered it, IP, user-agent (Chrome/Android/iPhone…), action name, endpoint,
> payload, error code, response* — **and** a set of **named product-funnel events**.
> The **Loop funnel** (`application_submitted → candidate_profile_viewed → candidate_action → application_status_viewed`) **is the product** — it must be measurable.

### 4.1 Current state (backend + frontend)

- **Backend:** no general event/analytics model. What exists to *reuse*: `getClientContext(req)`
  (already extracts `ip` + `user-agent`), the `AuditLog` JSON before/after pattern,
  global pino logger, `ApiExceptionFilter` (single choke point for every error),
  and `HeadersInterceptor` (already reads an `x-source`/platform hint onto the request).
  pino `autoLogging` is **off** — there is not even a per-request access log today.
- **Frontend:** **no analytics client at all** — no PostHog/Segment/GTAG/Mixpanel/Amplitude,
  no `track()` helper. Platform is not currently detected.

**Status: ◑ BACKEND BUILT (2026-07-03) · FRONTEND PENDING.** Full engineering
detail in [`docs/features/event-logging-and-ai-parse.md`](docs/features/event-logging-and-ai-parse.md).

### 4.2 Target design — two layers, one table

**Layer A — universal action log (automatic).** A global Nest **interceptor** records
*every* authenticated API call (allow-list of routes, or all mutating routes) with:
`actorId`, `actorRole`, `method`, `endpoint`, `statusCode`, `errorCode`, `latencyMs`,
sanitized `payload`, response summary, `ip`, `userAgent`, normalized `platform`
(`android|ios|web`) + `browser`, `requestId`. Errors are *also* captured at the
`ApiExceptionFilter` choke point so nothing slips through. **Payloads are sanitized**
(strip passwords/tokens/PII, size-cap the JSON) — same redaction rules as pino.

**Layer B — named product-funnel events (semantic).** The 20 `object_action`
(snake_case) events below, emitted at business moments with typed `properties`.
Some fire server-side (authoritative: `signup_completed`, `application_submitted`,
`ai_profile_generated`, `match_generated`), some client-side (UX moments the server
never sees: `job_feed_viewed`, `job_viewed`, `profile_started`, `error_shown`).

Both layers write to **one `AppEvent` table**, discriminated by `category`
(`REQUEST | FUNNEL | ERROR | SYSTEM`). Common envelope on every row:
`user_id, role (worker|employer), timestamp, platform (android|ios|web)`.

```prisma
// prisma/models/event.prisma  (PROPOSED — not yet created)
model AppEvent {
  id         String        @id @default(cuid())
  name       String        // e.g. "application_submitted" | "http_request"
  category   EVENT_CATEGORY // REQUEST | FUNNEL | ERROR | SYSTEM
  actorId    String?       // who triggered (null for anonymous)
  actorRole  String?       // worker | employer | admin | guest
  sessionId  String?       // client session / anon id for funnel stitching
  platform   String?       // android | ios | web
  browser    String?       // chrome | safari | telegram-webview | ...
  ip         String?
  userAgent  String?
  method     String?       // GET/POST/... (REQUEST rows)
  endpoint   String?       // route path (REQUEST rows)
  statusCode Int?
  errorCode  String?       // sanitized app error code (ERROR rows)
  latencyMs  Int?
  properties Json?         // typed per-event props (job_id, method, latency_ms, ...)
  createdAt  DateTime      @default(now())

  @@index([name, createdAt])
  @@index([actorId, createdAt])
  @@index([category, createdAt])
}
```

*Scale note:* for MVP a single Postgres table with these indexes is sufficient. If
volume grows, Layer A can move to an async queue/batch insert (BullMQ) or a
dedicated analytics sink; the emit API stays the same.

### 4.3 Backend — ✅ BUILT (2026-07-03)

Implemented exactly as planned: `AppEvent` model + `EVENT_CATEGORY` enum +
migration; `AnalyticsModule` (`AnalyticsService` buffered/batched + `AnalyticsDal`
+ `user-agent`/`sanitize-payload` helpers); global `EventLoggingInterceptor`
(Layer A) + `ApiExceptionFilter` ERROR hook; server-side funnel emits
(`signup_completed`, `company_created`, `application_submitted`,
`ai_profile_generated`, `job_post_published`, `candidate_action`);
`POST /events/track` client ingest. `match_generated`/`notification_sent` are
reserved until their features (S1/S2) ship.

<details><summary>Original backend plan (now done)</summary>

1. `AppEvent` model + `EVENT_CATEGORY` enum + migration.
2. `AnalyticsModule`: `EventService.record(evt)` + `EventDal` (batched insert), reusing
   `getClientContext` for ip/ua and a small `parsePlatform(userAgent)` helper
   (`android|ios|web` + browser incl. Telegram webview).
3. **Global `EventLoggingInterceptor`** (Layer A) — wraps requests, times them, records
   REQUEST rows with sanitized payload/response + status; hook `ApiExceptionFilter`
   to emit ERROR rows with the sanitized `errorCode`.
4. **Server-side funnel emits** (Layer B) in the owning services:
   `signup_completed` (auth), `ai_profile_generated` (ai-tools, success+latency),
   `application_submitted` (application), `company_created` (employer-profile),
   `job_post_published` (vacancy), `candidate_action` (shortlist/status),
   `match_generated` (matching pipeline once S1 exists), `notification_sent` (once S2 exists).
5. `POST /events/track` — authenticated batch ingest for **client-side** events
   (validated Zod: `name` allow-list, bounded `properties`), rate-limited.
6. (Later) read side: funnel/query endpoints or a direct SQL/BI view.

</details>

### 4.4 Frontend plan (status: ❌ to build — this is the remaining S3 work)

1. `lib/analytics`: a typed `track(name, props)` helper that **buffers + batches** to
   `POST /events/track`, flushes on interval + on `visibilitychange`/unload via
   `sendBeacon`, respects Do-Not-Track, and attaches `platform`/`browser`/`sessionId`.
2. Platform detection (android/ios/web + Telegram in-app webview).
3. **Client-side emits** at the UX moments the server can't see:
   `signup_started`, `job_feed_viewed`, `job_viewed`, `profile_started`,
   `voice_recording_completed`, `profile_completed`, `application_status_viewed`,
   `job_post_started`, `applicants_list_viewed`, `candidate_profile_viewed`,
   `error_shown` (from the global error boundary/toast), `feature_engaged_deep`.

### 4.5 Event catalog — where each fires + can it fire today

`✔ = data available now` · `⧗ = needs the underlying feature first`

| # | Event | Source | Key props | Ready? |
|---|---|---|---|---|
| 1 | `signup_started` | client | `method: google\|telegram` | ✔ |
| 2 | `signup_completed` | server | `method` | ✔ |
| 3 | `job_feed_viewed` | client | `jobs_count` | ✔ |
| 4 | `job_viewed` | client | `job_id, source: feed\|search\|match` | ✔ |
| 5 | `profile_started` | client | `input_mode: voice\|text` | ✔ (text; voice ⧗ W4) |
| 6 | `voice_recording_completed` | client | `duration_sec` | ⧗ W4 |
| 7 | `ai_profile_generated` | server | `success: bool, latency_ms` | ✔ (via `/worker/ai/cv`) |
| 8 | `profile_completed` | client | `input_mode, edited: bool` | ✔ |
| 9 | `application_submitted` | server | `job_id, profile_complete: bool` | ✔ |
| 10 | `application_status_viewed` | client | `status` | ✔ |
| 11 | `company_created` | server | — | ✔ |
| 12 | `job_post_started` | client | `mode: ai\|manual` | ✔ |
| 13 | `job_post_published` | server | `mode, time_to_publish_sec` | ✔ (mode=manual; ai ⧗ E2) |
| 14 | `applicants_list_viewed` | client | `job_id, applicants_count` | ✔ |
| 15 | `candidate_profile_viewed` | client | `best_match: bool` | ✔ |
| 16 | `candidate_action` | server | `action, best_match: bool` | ✔ |
| 17 | `match_generated` | server | `score_bucket: high\|med\|low` | ⧗ S1 |
| 18 | `error_shown` | client + server | `screen, error_code` | ✔ |
| 19 | `notification_sent` / `_opened` | server / client | `type, channel` | ⧗ S2 |
| 20 | `feature_engaged_deep` | client | (CV regen, 5+ candidates, day-2 return) | ✔ |

### 4.6 Funnels to build in the analytics view (Day 1)

- **Worker activation:** `signup_completed → profile_completed → application_submitted`
- **Employer activation:** `company_created → job_post_published → candidate_profile_viewed → candidate_action`
- **The Loop (the product):** `application_submitted → candidate_profile_viewed (same application) → candidate_action → application_status_viewed`

---

## 5. Launch-blocker summary (what stands between here and MVP pass)

**New builds required**

1. **S3 — Event & analytics logging** — ✅ **backend done** (2026-07-03); **frontend `track()` client + client events remain** (§4.4). The Loop funnel is now measurable end-to-end once the FE emits its events.
2. **S1 — Matching compute.** Model + read path exist; the scorer must be written (also unblocks E6 % and worker Best-match).
3. **S2 — Notifications delivery** (email + Telegram send). Nothing sends today.
4. **E2 / W4 / E1 voice** — ✅ **done end-to-end (2026-07-03)**: backend parse endpoints (`/employer/vacancies/parse`, `/worker/ai/parse-profile`, `/employer/profile/parse`) **+ frontend** speak→parse→prefill→edit→save on all three forms. Vacancy **DRAFT** save/publish shipped (BE + FE). Chat model picker removed (server chooses the model). Analytics `track()` client shipped.

**Frontend wiring of already-built backends (no new backend work)**

6. ~~**E5** inbox → `GET /employer/applications`~~ ✅ done 2026-07-03 (mock seam deleted).
7. ~~**E7** shortlist → `GET/POST/DELETE /employer/shortlist`~~ ✅ done 2026-07-03 (list + remove wired; "add" button ships with candidate search).
8. **E8** metrics strip → `GET /employer/stats`.
9. ~~**E1** verification → drop `peoplor_employer_verify_v1` + demo-approve; read real `verificationStatus`~~ ✅ done 2026-07-03.
10. ~~**E3** vacancy wizard → send the **full** field set~~ ✅ done 2026-07-03.
11. ~~**Settings** → `GET/PATCH /me/settings`~~ ✅ done 2026-07-03: language/theme/sound/notifications/privacy persist server-side (SettingsSync pulls per sign-in); worker Job-search rows → `PATCH /worker/profile` (incl. new `readyToRelocate`); employer Hiring rows → `PATCH /employer/profile`. localStorage seams deleted (`peoplor_settings_v1`, `peoplor-sounds`); `peoplor_lang` + `theme` remain only as first-paint caches, overwritten by the account's DB values on load.

**Decisions needed**

- **W3:** does MVP need *anonymous* job browsing, or is jobs-first-after-signup enough?
- **W4:** build voice-to-profile for launch, or defer?

**Verify on real devices/domain**

- **W2** Telegram (needs bot env + HTTPS domain), **S4** performance on mid-range Android, **S7** already solid.

---

## 6. Device matrix (minimum viable — everything else skipped for launch)

| Device / browser | Audience | Status |
|---|---|---|
| Android mid-range — Chrome + Telegram in-app browser | primary worker audience (UZ) | ⏳ needs field test (S4) |
| iPhone — Safari | worker | ⏳ needs field test |
| Desktop Chrome | employer | ⏳ needs field test |

---

*Cross-refs: employer backend detail → [`docs/features/employer-backend-reference.md`](docs/features/employer-backend-reference.md); backend-gap tracker → [`docs/api-need.md`](docs/api-need.md); build process → [`workflow.md`](workflow.md).*
