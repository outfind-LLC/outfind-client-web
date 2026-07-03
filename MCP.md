# Peoplor MCP Server — plan

_Status: PLAN (not built). Written 2026-07-04. Backend: `../jobsterr-backend`
(NestJS REST at `/api/v1`, httpOnly-cookie auth)._

## 1. What MCP is

**MCP (Model Context Protocol)** is an open, vendor-neutral protocol
(introduced by Anthropic, late 2024; since adopted across the industry —
Claude, ChatGPT, Cursor, VS Code Copilot, and many agent frameworks) that lets
AI assistants talk to external systems in a standard way. Think "USB-C for AI
integrations": we build **one** MCP server for Peoplor, and every MCP-capable
chatbot/agent can use it without custom integration work.

Core concepts:

- **Server** (what we build): exposes capabilities over JSON-RPC 2.0.
- **Client/Host** (Claude Desktop, claude.ai, ChatGPT, Cursor, …): discovers
  and calls those capabilities during a conversation.
- **Primitives we can expose:**
  - **Tools** — functions the model can call (`search_jobs`,
    `create_vacancy_draft`, …). This is 90% of our value.
  - **Resources** — readable documents by URI (e.g. `peoplor://job/{id}`).
  - **Prompts** — reusable prompt templates ("write a cover letter for job X").
- **Transports:**
  - **stdio** — the client launches the server as a local process (good for a
    developer-installed npm package).
  - **Streamable HTTP** — the server runs at a URL; remote clients (claude.ai
    connectors, ChatGPT connectors) require this. Auth via OAuth 2.1 or
    bearer tokens.

Why Peoplor wants one: workers could ask *any* assistant "find me warehouse
jobs in Tashkent on Peoplor and apply to the top one"; employers could say
"post a forklift-driver draft on Peoplor from this text". It turns every AI
chat surface into a Peoplor client — distribution we don't have to build UI
for.

## 2. Architecture decision

**Build a thin, standalone TypeScript package (`@peoplor/mcp`) that calls the
existing REST API.** Do NOT embed MCP inside the NestJS app in v1.

Why thin-client:
- Zero risk to the production API (the MCP server is just another API consumer).
- The REST API already enforces auth, roles, plan entitlements, rate limits,
  validation and error sanitization — we inherit all of it.
- Ship as npm package (stdio) first; the same tool code is reused later behind
  a Streamable HTTP endpoint for remote connectors.

```
AI host (Claude/ChatGPT/Cursor)
   │  MCP (stdio or Streamable HTTP)
   ▼
@peoplor/mcp  (Node, @modelcontextprotocol/sdk)
   │  HTTPS + Authorization: Bearer pplr_…
   ▼
api.peoplor.com/api/v1  (existing NestJS backend, unchanged routes)
```

### Backend prerequisite: API keys (the only real backend work)

The API authenticates with httpOnly cookies — headless MCP clients can't do
browser cookie flows. Add **personal access tokens**:

```prisma
model ApiKey {
  id         String    @id @default(cuid())
  userId     String
  name       String            // "Claude Desktop", "n8n", …
  keyHash    String    @unique // sha256 of "pplr_<40 random chars>" — plaintext shown ONCE
  scopes     String[]          // ["worker:read","worker:apply","employer:read","employer:write"]
  lastUsedAt DateTime?
  expiresAt  DateTime?
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("api_keys")
}
```

- `POST /me/api-keys` (create, returns plaintext once), `GET /me/api-keys`,
  `DELETE /me/api-keys/:id` — cookie-authed, so keys are minted from the
  logged-in Settings UI (Settings → Account → "API keys" section on the FE).
- Extend the existing auth guard: if `Authorization: Bearer pplr_…` is
  present, sha256-lookup the key, check `revokedAt/expiresAt`, attach
  `req.user = { ui: key.userId, scopes }`, bump `lastUsedAt`. Cookie flow
  untouched.
- A `@RequireScope('employer:write')` decorator + guard for the mutating
  routes when called via API key (cookie sessions implicitly have all scopes).
- Throttle API-key traffic with the existing throttler (per-key bucket).

Estimated backend effort: ~1 day incl. migration + Settings UI.

## 3. What the MCP server exposes (v1)

Keep v1 tight: 10 tools, clear names, small schemas (models behave better with
fewer, well-described tools). Every description states *when to use it*.

**Worker tools** (scopes `worker:read` / `worker:apply`):

| Tool | Maps to | Notes |
| --- | --- | --- |
| `search_jobs` | `POST /chat` job-finder path or `GET /vacancies` + recommendations | v1: wrap `GET /worker/recommendations` + public vacancy search; input `{ profession, city?, limit? }` |
| `get_job` | `GET /vacancies/{id}` | full detail incl. description, salary, contacts |
| `get_my_profile` | `GET /worker/profile` | résumé summary (omit contact fields unless `include_contacts: true`) |
| `update_my_profile` | `PATCH /worker/profile` | partial; same bounded fields as the app |
| `list_my_applications` | `GET /worker/applications` | status filter |
| `apply_to_job` | `POST /worker/applications` (vacancy apply) | input `{ vacancy_id, cover_letter? }`; **requires `worker:apply` scope** |

**Employer tools** (scopes `employer:read` / `employer:write`):

| Tool | Maps to | Notes |
| --- | --- | --- |
| `list_my_vacancies` | `GET /employer/vacancies` | incl. DRAFTs + applicant counts |
| `create_vacancy_draft` | `POST /employer/vacancies` with `saveAsDraft: true` | **always a draft** — publishing stays a human action in the app (safety) |
| `generate_vacancy_description` | `POST /employer/vacancies/generate-description` | already built |
| `list_applicants` | `GET /employer/applications` | flat inbox rows |

**Resources** (nice-to-have, v1.1): `peoplor://vacancy/{id}`,
`peoplor://me/profile` as markdown documents.
**Prompts** (v1.1): `tailor_cv_for_job`, `screen_applicants`.

Safety rails baked into the server (defense in depth on top of API scopes):
- Read tools are default; mutating tools are registered **only if** the key
  has the scope (probe `GET /me` at startup → key scopes in the response, or
  a new lightweight `GET /me/api-keys/self`).
- `apply_to_job` and `create_vacancy_draft` return a human-readable summary of
  exactly what was submitted, so the host UI shows it for confirmation.
- Never expose admin routes. Never accept a model-supplied user id — the key
  IS the identity.

## 4. Implementation plan (concrete)

### Repo layout — new folder `peoplor-mcp/` (own package, own repo or sibling dir)

```
peoplor-mcp/
  package.json          // name: "@peoplor/mcp", bin: { "peoplor-mcp": "dist/stdio.js" }
  src/
    api.ts              // tiny fetch client: baseUrl + bearer key + ok-envelope unwrap
    tools/worker.ts     // registerWorkerTools(server, api)
    tools/employer.ts
    server.ts           // buildServer(): new McpServer + register all
    stdio.ts            // entry: StdioServerTransport
    http.ts             // entry (Phase 3): Streamable HTTP transport behind Express
  tsconfig.json
  README.md             // install + connect instructions (section 6 below)
```

### Core code sketch (TypeScript SDK)

```ts
// server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function buildServer(api: PeoplorApi) {
  const server = new McpServer({ name: "peoplor", version: "1.0.0" });

  server.registerTool(
    "search_jobs",
    {
      title: "Search Peoplor jobs",
      description:
        "Search live vacancies on Peoplor. Use when the user asks to find " +
        "jobs. Returns id, title, company, city, salary, match score.",
      inputSchema: {
        profession: z.string().describe("Role to search, e.g. 'forklift driver'"),
        city: z.string().optional(),
        limit: z.number().int().min(1).max(20).default(10),
      },
    },
    async ({ profession, city, limit }) => {
      const jobs = await api.searchJobs({ profession, city, limit });
      return { content: [{ type: "text", text: JSON.stringify(jobs, null, 2) }] };
    },
  );
  // …register remaining tools; wrap ALL api errors into
  // { content:[{type:"text", text:`Error: ${sanitizedMessage}`}], isError:true }
  return server;
}

// stdio.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
const api = new PeoplorApi(process.env.PEOPLOR_API_URL ?? "https://api.peoplor.com/api/v1",
                           process.env.PEOPLOR_API_KEY!);
await buildServer(api).connect(new StdioServerTransport());
```

Config via env only: `PEOPLOR_API_KEY` (required), `PEOPLOR_API_URL`
(defaults to prod). No key → exit with a clear message pointing to
Settings → API keys.

### Phases

| Phase | Scope | Est. |
| --- | --- | --- |
| **0. Backend keys** | ApiKey model + migration, bearer branch in the auth guard, scope guard, 3 endpoints, Settings UI section | 1 day |
| **1. stdio server** | package scaffold, 6 worker tools + 4 employer tools, error mapping, README | 1–1.5 days |
| **2. Publish** | npm publish + MCP Registry entry (below), test in Claude Desktop/Code + Cursor | 0.5 day |
| **3. Remote HTTP** | `http.ts` with Streamable HTTP transport hosted at `mcp.peoplor.com` (same Node app, Express route `/mcp`), bearer auth per request; later OAuth 2.1 for claude.ai/ChatGPT connector store listing | 1–2 days |
| **4. v1.1** | resources + prompts, `search_candidates` for employers once candidate search ships | later |

### Testing

- `npx @modelcontextprotocol/inspector node dist/stdio.js` — interactive tool
  tester (run before every release).
- One vitest per tool against a mocked `PeoplorApi`; one live smoke script
  against staging with a scoped key.

## 5. How to publish

1. **npm** (primary for stdio): `npm publish --access public` as
   `@peoplor/mcp`. Users then run it with `npx -y @peoplor/mcp` — no install
   step. Keep `bin` + `files: ["dist"]` + Node ≥18 engines.
2. **MCP Registry** (discoverability): add a `server.json` per the official
   registry schema (name `com.peoplor/mcp`, package pointer to the npm
   package, env-var declaration for `PEOPLOR_API_KEY`) and publish with the
   `mcp-publisher` CLI to `registry.modelcontextprotocol.io`. Registry entries
   surface in client directories (Claude, Cursor, etc. pull from it).
3. **Remote endpoint** (Phase 3): host Streamable HTTP at
   `https://mcp.peoplor.com/mcp`, document it, and (optional, later) submit to
   the Claude and ChatGPT connector directories — both require OAuth 2.1
   (authorization-code + PKCE, dynamic client registration) rather than raw
   API keys, so plan an OAuth layer in front of the key system when we want
   store listings.
4. **Docs page**: `peoplor.com/developers` — how to mint a key, connect
   snippets (below), scopes table, rate limits.

## 6. How users connect it (put this in the README verbatim)

**Claude Desktop** — `claude_desktop_config.json`
(Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "peoplor": {
      "command": "npx",
      "args": ["-y", "@peoplor/mcp"],
      "env": { "PEOPLOR_API_KEY": "pplr_xxxxxxxx" }
    }
  }
}
```

**Claude Code** (CLI):

```bash
claude mcp add peoplor --env PEOPLOR_API_KEY=pplr_xxxxxxxx -- npx -y @peoplor/mcp
# or, once the remote endpoint exists:
claude mcp add --transport http peoplor https://mcp.peoplor.com/mcp \
  --header "Authorization: Bearer pplr_xxxxxxxx"
```

**claude.ai (web/mobile)** — remote only: Settings → Connectors → *Add custom
connector* → `https://mcp.peoplor.com/mcp` (needs Phase 3; OAuth for the
public listing).

**Cursor** — `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):
same JSON shape as Claude Desktop.

**VS Code (Copilot agent mode)** — `.vscode/mcp.json`, same shape (VS Code
supports `"type": "http"` for the remote variant).

**ChatGPT** — Settings → Connectors (developer mode) → add the remote MCP URL;
remote-only, so this also lands with Phase 3.

**Any agent framework** (LangChain/LlamaIndex/OpenAI Agents SDK/n8n): all ship
MCP client adapters — point them at the npx command or the HTTP URL.

## 7. Security checklist (enforce before launch)

- Keys hashed at rest (sha256), shown once, revocable, optional expiry,
  `lastUsedAt` visible in Settings; scope-gated mutating routes.
- MCP server sends the key ONLY to `PEOPLOR_API_URL` origin; never logs it;
  redacts it from error output.
- All writes are drafts/low-blast-radius by design (publish stays in-app).
- Inherit backend rate limits; add per-key throttle bucket.
- Treat all tool INPUT as untrusted (the model may be prompt-injected):
  server-side Zod validation on every tool, and the REST API re-validates —
  never widen an API bound inside the MCP layer.
- Remote endpoint: HTTPS only, `Origin` allow-list, no session state in v1
  (stateless Streamable HTTP), audit log = existing AppEvent request layer
  (API-key requests are tagged with the key id).
