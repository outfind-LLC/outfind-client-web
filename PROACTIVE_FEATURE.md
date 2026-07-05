# Outfind AI Pulse — the proactive engine (plan)

_Status: PLAN (not built). Written 2026-07-04. Backend repo: `../jobsterr-backend`._

## 1. What it is

Today Outfind AI is **reactive**: a worker must open the app and search; an employer
must open Candidates to see who applied. **Pulse makes the platform come to the
user**:

1. **Job alerts (worker)** — "3 new jobs match your profile: Forklift Driver in
   Tashkent, 9M UZS…" delivered on the schedule the worker already picked in
   Settings (`jobAlertFrequency`: INSTANT / DAILY / WEEKLY / OFF).
2. **Application events (worker)** — "TransLogistics viewed your application",
   "You got a reply", "Interview invite" — the moments that actually bring
   people back.
3. **Candidate alerts (employer)** — "A new candidate matching *Warehouse
   Operative* just completed their profile", "5 new applicants this week on
   your Forklift Driver vacancy".
4. **Nudges** — profile 60% complete → "Add your experience to double your
   matches"; a DRAFT vacancy untouched for 3 days → "Your draft is ready to
   publish"; an applicant unanswered for 48h → "Reply to keep candidates warm".

Channels: **in-app notification bell** (always), **Telegram bot** (our core
audience lives there), **email** (fallback/digest). Every send respects the
notification toggles that are **already persisted** in `UserSettings`
(`notifMessages`, `notifStatus`, `notifJobs`, `notifEmail`) — those switches
currently control nothing, which is exactly the gap this feature closes
(`current_status.md` S2, and the scoring part closes S1).

Why this feature (and not something else): it's the highest-leverage retention
loop a job platform has, and ~70% of the plumbing already exists in this repo —
we are wiring, not inventing.

## 2. What already exists to build on (verified in the repo)

| Piece | Where | State |
| --- | --- | --- |
| Notification preferences + frequency | `UserSettings` (theme/notif/privacy) + `GET/PATCH /me/settings` | ✅ persisted, FE wired |
| Background jobs infra | BullMQ + Redis (used by the job-acquisition harvester) | ✅ running pattern to copy |
| Telegram identity | Telegram login provider (`AUTH_PROVIDER.TELEGRAM`, `user.telegramUsername`) | ✅ users exist; verify the numeric `telegramId` column is stored at login — it's required for bot sends |
| Match read-path | recommendations endpoint + match model (see `current_status.md` S1) | ◑ scorer not written — Pulse Phase 3 writes it |
| Event stream | `AppEvent` analytics (request + funnel layers) | ✅ triggers can piggyback |
| Application lifecycle | `Application.status` transitions (SENT→VIEWED→ACCEPTED/REJECTED) + messages read-flags | ✅ the exact hook points for worker events |
| Per-app chat unread counts | employer/worker inbox enrichment | ✅ reuse for "unanswered 48h" nudge |

Missing: a `Notification` model, a delivery module (Telegram/email adapters),
the scheduler jobs, the matcher, and the FE bell. That's the plan below.

## 3. Architecture

```
                      ┌──────────────────────────────┐
   domain events ────▶│  NotificationService.enqueue │◀──── cron jobs (BullMQ)
 (status change,      └──────────────┬───────────────┘   • daily/weekly job digest
  new message,                       │ writes             • candidate alerts
  vacancy published)                 ▼                    • nudges (draft, profile)
                            Notification row (DB)
                                     │
                     ┌───────────────┼────────────────┐
                     ▼               ▼                ▼
               in-app feed     Telegram adapter   Email adapter
              (GET /me/notifications)  (Bot API)      (Resend)
                     ▲
              FE bell + list (poll 60s; badge = unreadCount)
```

Design rules:

- **One row per notification, per user** — channels are delivery attempts, not
  separate rows. `channels: string[]` records where it was sent.
- **Preference gate at enqueue time**: the service reads `UserSettings` and the
  event category → drops or downgrades (e.g. `notifEmail=false` → no email,
  in-app still created; `jobAlertFrequency=OFF` → no job-alert rows at all).
- **Idempotency**: every notification has a `dedupeKey`
  (e.g. `job-digest:{userId}:{2026-07-04}` or `app-viewed:{applicationId}`);
  unique index makes retries/double-crons harmless.
- **Digests, not spam**: INSTANT is only for application events. Job matches
  and candidate matches are always batched into one daily/weekly message.

## 4. Data model (Prisma — additive migration)

```prisma
enum NOTIFICATION_TYPE {
  JOB_MATCHES          // worker: digest of new matching vacancies
  APPLICATION_UPDATE   // worker: viewed / accepted / rejected / new reply
  CANDIDATE_MATCHES    // employer: digest of new matching candidates
  NEW_APPLICANT        // employer: someone applied
  NUDGE                // profile completeness, stale draft, unanswered chat
}

model Notification {
  id         String            @id @default(cuid())
  userId     String
  type       NOTIFICATION_TYPE
  title      String            // already localized at enqueue time (User.language)
  body       String            @db.Text
  linkPath   String?           // FE route, e.g. /applications?open=<id>
  dedupeKey  String            @unique
  channels   String[]          @default([]) // ["inapp","telegram","email"]
  readAt     DateTime?
  createdAt  DateTime          @default(now())
  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readAt, createdAt])
  @@map("notifications")
}

// Watermark so digests only pick up NEW items since the last send.
model NotificationCursor {
  id        String   @id @default(cuid())
  userId    String
  kind      String   // "job-digest" | "candidate-digest"
  lastRunAt DateTime
  @@unique([userId, kind])
  @@map("notification_cursors")
}
```

Also verify/add on `User`: `telegramId BigInt?` (the numeric chat id from the
Telegram login payload — the username alone cannot receive bot messages).

## 5. Backend module (`src/modules/notifications/`)

Follow the repo conventions (Controller→Service→DAL, Zod, `ok()`, global JWT):

```
notifications/
  notifications.module.ts        // imports BullModule queue "notifications"
  notifications.controller.ts    // GET /me/notifications, PATCH /me/notifications/read
  notifications.service.ts       // enqueue(): preference gate + dedupe + fan-out
  dal/notifications.dal.ts
  channels/telegram.channel.ts   // fetch https://api.telegram.org/bot<TOKEN>/sendMessage
  channels/email.channel.ts      // Resend SDK; plain, localized templates
  jobs/digest.processor.ts       // BullMQ repeatable jobs (below)
  jobs/nudges.processor.ts
```

**Endpoints** (2 only):
- `GET /me/notifications?cursor&limit` → rows + `unreadCount` (one query).
- `PATCH /me/notifications/read` `{ ids?: string[] }` (omit ids = mark all).

**Channel adapters** are dumb and safe: try/catch, log failure, never throw
into the request path (all sends happen inside queue processors). Telegram
needs `TELEGRAM_BOT_TOKEN` env (same bot as login); email needs
`RESEND_API_KEY` + a verified domain. If an env var is missing, the adapter
disables itself and logs once (the feature degrades to in-app only —
important for local dev).

**Trigger points (event-driven, INSTANT):** call
`notifications.enqueue(...)` from the existing services — no new
infrastructure:
- `application.service` status transition → `APPLICATION_UPDATE` to the worker
  (gate: `notifStatus`).
- message send → `APPLICATION_UPDATE` "new reply" to the counterparty **only
  if** the last N minutes had no other unread ping (gate: `notifMessages`,
  dedupeKey per application per hour).
- `vacancy.service.createOwn` (published) → `NEW_APPLICANT` wiring lives on
  application create → notify the employer (gate: `notifMessages`).

**Scheduled jobs (BullMQ repeatable, copy the harvester's registration
pattern):**

| Job | Schedule | Logic |
| --- | --- | --- |
| `job-digest` | hourly tick | pick workers whose `jobAlertFrequency` bucket is due (DAILY at 09:00 local-ish, WEEKLY Mondays), find vacancies created since their `NotificationCursor`, score with the matcher (Phase 3; Phase 1 falls back to profession/city/country filter match), top 5 → one notification |
| `candidate-digest` | daily | employers with ACTIVE vacancies + `notifJobs` on → new candidate profiles matching vacancy profession/city since cursor |
| `nudges` | daily | DRAFT vacancy older than 72h (once, dedupeKey per vacancy); worker `completenessScore < 60` and 7 days since last nudge; employer chats with unread worker message > 48h |

## 6. The matcher (Phase 3 — closes S1)

Keep v1 deterministic and cheap — **no AI call per pair**:

```
score = 40 * professionSimilarity   // exact/normalized match on profession/category
      + 20 * locationScore          // same city 1.0, same country 0.6, remote 1.0
      + 20 * skillOverlap           // |vacancy.skills ∩ worker.skills| / |vacancy.skills|
      + 10 * salaryFit              // vacancy range overlaps expectedSalaryRange
      + 10 * experienceFit          // worker years vs experienceRequired
```

Write it as a pure function in `src/modules/matching/score.ts` with unit
tests, then: (a) digests use it to rank; (b) backfill
`Application.matchScore` on apply; (c) `GET /worker/recommendations` orders by
it — which also lights up the employer % gauge and worker "Best match" badge
(E6/W-rows). An AI re-ranker can come later for the top-20 only.

## 7. Frontend

- `features/notifications/`: `useNotifications()` (poll 60s while tab
  visible), `useMarkNotificationsRead()`, bell button with unread badge in the
  app header/sidebar, dropdown list (title, body, relative time, click →
  `linkPath`), localized empty state. Reuse the anchored-popup util.
- Play the existing synthesized sound on new unread (respects the
  server-persisted `soundEnabled` — already wired via `SettingsSync`).
- Telegram opt-in surface: Settings → Notifications gets one row — "Telegram
  notifications: **Connect**" → deep link `https://t.me/<bot>?start=<one-time
  token>`; the bot's `/start` handler posts the token back to
  `POST /me/telegram-link` which stores `telegramId`. (Required because a bot
  can only message users who started it.)

## 8. Implementation order (each phase shippable on its own)

| Phase | Scope | Est. |
| --- | --- | --- |
| **1. In-app core** | Notification model + migration, module + 2 endpoints, enqueue calls from application status/message services, FE bell + list | 1–2 days |
| **2. Job digest** | BullMQ queue + cursors, filter-based matching, DAILY/WEEKLY buckets honoring `jobAlertFrequency` | 1 day |
| **3. Matcher** | `score.ts` + tests, wire into digest ranking, recommendations ordering, `Application.matchScore` | 1 day |
| **4. Telegram** | `telegramId` capture (login + link flow), channel adapter, Settings connect row | 1 day |
| **5. Email + nudges** | Resend adapter + 3 localized templates, nudge processors | 1 day |

Definition of done per phase: build + lint green, migration applied via the
non-interactive flow (`prisma generate` → hand-written SQL → `migrate
deploy`), yaml + `current_status.md` updated, FE typecheck green.

## 9. Guardrails

- **Consent**: every channel behind its existing toggle; every Telegram/email
  message ends with "Manage notifications in Settings". `OFF` means zero rows.
- **Caps**: max 1 job digest/day, 3 nudges/week per user, hard cap 10
  notifications/day/user (enforced in `enqueue`).
- **Localization**: title/body rendered at enqueue time from `User.language`
  (UZ/RU/EN) — reuse the wizard-dict triple pattern server-side.
- **No PII in Telegram/email bodies** beyond what the user already sees in-app.
- **Metrics**: emit `notification_sent` / `notification_opened` AppEvents so
  the Loop funnel measures whether Pulse actually drives returns.
- **Failure isolation**: channel errors never block the request path or other
  channels; queue retries with backoff, dedupeKey makes retries safe.
