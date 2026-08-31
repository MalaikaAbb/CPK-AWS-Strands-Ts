# CopilotKit + AWS Strands (TypeScript) Test Suite

A navigable, working test harness for the CopilotKit ↔ AWS Strands (TypeScript) integration — one route per doc page, each either implementing what the page teaches or stating precisely why it cannot.

**Doc sync:** see `/doc-sync` in the running app (the manifest's `syncedAt` is the single source of truth) · **Routes:** 33 · **Agents:** 26 · **Doc gaps recorded:** 42 (11 blocking)
**Packages:** `@copilotkit/react-core` 1.69.0 · `@copilotkit/runtime` 1.69.0 · `@copilotkit/a2ui-renderer` 1.69.0 · `@copilotkit/voice` 1.69.0 · `@ag-ui/client` 0.0.57 (pinned) · `@ag-ui/aws-strands` 0.2.3 · `@strands-agents/sdk` 1.12.0 · Next 16.3.0

---

## 1. Overview

AWS Strands is Amazon's agent SDK. Its TypeScript flavour talks to CopilotKit through `@ag-ui/aws-strands`, which wraps a Strands `Agent` in an AG-UI-speaking Express app. This repo covers every page under [`docs.copilotkit.ai/strands-typescript`](https://docs.copilotkit.ai/strands-typescript) named in its scope: 33 routes, each showing a live surface, the code behind it, and — where the doc page omits something — exactly what is missing.

It is a QA instrument, not a starter template. Where the docs stop, so does the implementation, and the route says so in a red panel above the fold.

**The finding that shapes everything else:** unlike the Python tree, these docs publish their backend file, `src/agent/agent.ts`, in full — 359 lines, complete, byte-identical across the 18 pages that carry it. It still cannot run, because four modules it imports (`./model-factory`, `./tools`, `./state`, `./prompts`), one JSON file it reads, and the `server.ts` its own docstring credits with mounting the agents are published nowhere. Seven further pages replace their backend section with a `setup skipped` placeholder.

So the backend here is built only from what *is* published end to end — the Quickstart's `main.ts` and the Shared State pages' `agent/main.ts` — plus the single factory in `agent.ts` whose dependencies are all inline. The published file itself sits in [`backend/docs_verbatim/`](backend/docs_verbatim/), never imported, with a written analysis beside it.

**And the surprise:** frontend tools work anyway. `@ag-ui/aws-strands` exports `createProxyTool` / `syncProxyTools` and registers the runtime's forwarded tool declarations onto the Strands tool registry per run. No doc page mentions it — every page that would is a placeholder — but it is what makes Frontend Tools, Components as Tools, Display-only and Human-in-the-Loop function here.

---

## 2. Architecture

```
Browser
  └─ Next 16 App Router (frontend/, :3000)
       ├─ one <CopilotKitProvider> at the root  ─ every route names its agent with agentId
       ├─ /api/copilotkit/[[...slug]]                    ─ 23 agents → HttpAgent per id
       ├─ /api/copilotkit-declarative-gen-ui/[[...slug]]  ─ A2UI dynamic schema, injectA2UITool: true
       └─ /api/copilotkit-voice/[[...slug]]               ─ + TranscriptionService
            all three: createCopilotRuntimeHandler (runtime/v2) + CopilotKit Intelligence
              │  AG-UI over SSE
              ▼
Node agent server (backend/, :8000)  ─ Express
  └─ one createStrandsApp(aguiAgent, { path: "/" }) per agent, mounted at /{agent-id}
       └─ @ag-ui/aws-strands  →  @strands-agents/sdk Agent  →  OpenAI
```

- **Backend language:** TypeScript on Node, per the Quickstart's TypeScript tab (Express, not FastAPI — the Python tab is a different stack).
- **Three runtimes, not one.** Voice needs its own for `transcriptionService`; A2UI dynamic-schema needs its own because it sets `injectA2UITool: true`, which must not apply to the other 23 agents. Since the 2026-08-26 re-sync all three are `[[...slug]]` catch-alls built with `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2`, and all three carry CopilotKit Intelligence — the provider's `useSingleEndpoint={false}` is the client half of that.
- **Trailing slashes matter.** Each agent is a mounted sub-app, so its AG-UI root is `http://localhost:8000/<agent-id>/`. `frontend/src/lib/agents.ts` builds every URL that way.

---

## 3. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20+ | Both halves are Node; there is no Python in this repo. |
| npm | 10+ | Any package manager works; commands below use npm. |
| OpenAI API key | — | Required. Used for agent runs and for Whisper transcription on `/voice`. |

No Python, no `uv`, and no CopilotKit CLI — this repo was scaffolded by hand. If you do use the CLI, `npx copilotkit@latest create --framework aws-strands-ts` is the TypeScript template; it also offers to pre-wire CopilotKit Intelligence.

---

## 4. Setup

```bash
# 1. Clone
git clone <this-repo> aws-strands-ts && cd aws-strands-ts

# 2. Frontend deps
cd frontend && npm install && cd ..

# 3. Backend deps
cd backend && npm install && cd ..

# 4. Environment — the two processes read their own
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Then fill in `backend/.env`:

| Variable | Required | What it does |
|---|---|---|
| `OPENAI_API_KEY` | yes | Model provider key. Without it the server starts and every run fails at the model call. |
| `MODEL_ID` | no | The model every agent is built with. Defaults to `gpt-4o`. Set to `gpt-5.4` to reproduce the Quickstart's published value failing. |
| `PORT` | no | Agent server port. Defaults to `8000`. |

and `frontend/.env.local`:

| Variable | Required | What it does |
|---|---|---|
| `OPENAI_API_KEY` | for `/voice` only | Whisper transcription. Every other route works without it. |
| `AGENT_URL` | no | Where the runtime reaches the agent server. Defaults to `http://localhost:8000`. |
| `INTELLIGENCE_API_KEY` | no | CopilotKit Intelligence licence key. With it, Threads and the Inspector work and threads are scoped per user. Without it the runtime drops `intelligence` + `identifyUser` and falls back to SSE with an in-memory runner — the Quickstart's own documented fallback. |
| `NEXT_PUBLIC_COPILOTKIT_INSPECTOR` | no | Set to `off` to disable the inspector everywhere. |

**Ports:** frontend `3000`, backend `8000`.

---

## 5. Running

Two terminals.

```bash
# Terminal 1 — agent server
cd backend && npm run dev
```

Successful startup prints the roster:

```
Agent server listening on http://localhost:8000
  model: gpt-4o
  agents: 24
    /strands_agent/
    /agentic_chat/
    …
```

```bash
# Terminal 2 — frontend
cd frontend && npm run dev
```

Open **http://localhost:3000**.

Two endpoints are worth knowing:

```bash
curl localhost:8000/health   # liveness + the agent roster
curl localhost:8000/gaps     # the backend half of the doc-gap ledger
curl localhost:8000/strands_agent/capabilities   # what the adapter actually emits
```

The `/copilot-runtime` route fetches `/health` and cross-checks it against `frontend/src/lib/agents.ts`, so drift between the two hand-maintained lists shows up as a red panel rather than a mystery 404.

---

## 6. What to expect — walkthrough per route

Every route carries a **Try it** box with the same pass/fail split shown here, plus a red **Doc gaps** panel where the page under test omits something.

### Getting Started

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/` | Landing page: orientation, status counts, the gap ledger. | — | — |
| `/quickstart` | The bring-your-own-agent path end to end — the one page whose backend is published and runnable. | "Can you tell me a joke?" | **Pass:** tokens stream a word at a time, markdown renders. **Fail:** error banner — check the server is up and `OPENAI_API_KEY` is set. |

### Prebuilt Components

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/prebuilt-components/chat` | The base inline chat, sized by its container. | "What can you help me with?" | **Pass:** suggestion pills before the first message; clicking one sends it. **Fail:** an empty box with no input — the container has no height. |
| `/prebuilt-components/sidebar` | The docked collapsible chat that sits beside content. | "Close yourself" | **Pass:** opens by default, toggles, main column does not move. **Fail:** content jumps on toggle. |
| `/prebuilt-components/popup` | The floating launcher with an overlay chat. | "Say hello in one sentence." | **Pass:** placeholder reads "Ask the popup anything...". **Fail:** default placeholder — `labels` did not reach the input slot. |
| `/prebuilt-components/chat-controls` | Driving modal state from your own buttons; thumbs up/down capture. | "Say something I can rate." | **Pass:** both buttons drive the sidebar; thumbs append a line with the message id. **Fail:** buttons render nothing — they are outside a provider owning modal state. |

### Rich Threads

Persistent conversations, served by CopilotKit Intelligence. All four need `INTELLIGENCE_API_KEY`; without it the drawer shows its locked view and `useThreads` has nothing to list — which is the docs' own documented fallback, not a fault here.

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/prebuilt-components/copilot-threads-drawer` | The drop-in conversation sidebar, with no active-thread state of your own. | Send a message, press New Conversation, send another, click back | **Pass:** two auto-named rows; clicking one replays that conversation. **Fail:** a locked panel where the list should be — set the licence key. |
| `/headless-threads` | `useThreads` as a data layer behind your own UI: list, rename, archive, delete, paginate. | Press Rename on a row; open the route in a second tab | **Pass:** the row relabels, and the second tab's list updates live with no reload. **Fail:** empty list with an amber error. |
| `/threads-lifecycle` | Where a `threadId` comes from, and switching vs. starting a conversation. | Copy `config.threadId`, press New chat, then Open conversation | **Pass:** the readout's id changes and `hasExplicitThreadId` flips to true; history replays if a store is configured. **Fail:** the buttons no-op — that happens when a `threadId` prop is also set. |
| `/threads-import` | The CLI import flow. Reference only — no application code on the page. | — | — |

### Custom Look and Feel

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/custom-look-and-feel/css` | Re-skinning via class hooks + v2 shadcn tokens, scoped to one wrapper. | Send anything | **Pass:** your message renders in JetBrains Mono on parchment with a copper rule and a `→` prefix. **Fail:** a default-looking chat. |
| `/custom-look-and-feel/slots` | Replacing three sub-components: welcome screen, assistant message, disclaimer. | "Say hello" | **Pass:** gradient card before sending; violet-carded replies after; tagged disclaimer throughout. **Fail:** a default chat. |
| `/custom-look-and-feel/headless-ui` | A chat from `useAgent` + `useCopilotKit` + `useRenderToolCall`, no CopilotKit chrome. | "Write me a two-line poem" | **Pass:** hand-rolled bubbles, streaming, self-scrolling. **Fail:** nothing on send — check the console. |

### Input Modalities

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/multimodal-attachments` | Drag-and-drop files sent as AG-UI content parts. | Drop a PNG, then "what is in this image?" | **Pass:** chips with previews; the reply describes the actual file. **Fail:** a 15MB file uploads instead of being rejected. |
| `/voice` | A second runtime carrying a `TranscriptionService`, which is what grows the mic button. | Click the mic and speak | **Pass:** transcript lands in the composer and auto-sends. **Fail:** no mic button — the runtime is not advertising transcription. |

### Generative UI

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/generative-ui/tool-based` | `useComponent` registering a React component as a callable tool. | "Chart this quarterly revenue: Q1 120, Q2 145, Q3 132, Q4 189." | **Pass:** a bar chart renders inline. **Fail:** a markdown table instead. |
| `/generative-ui/tool-rendering` | Named renderers plus a wildcard catch-all. | "What's the weather in Berlin?" | **Pass:** a branded WeatherCard with a "calling weather api…" pill, then the reading. Asking for flights gets a plain refusal — that renderer has no tool. **Fail:** the weather answer arrives as plain text; renderer and tool names must match exactly. |
| `/generative-ui/your-components/display-only` | The one page that publishes schema, component and hook together. | "What's the weather in Denver?" | **Pass:** a bordered card with city, temperature, condition. **Fail:** a plain sentence. |
| `/generative-ui/your-components/interactive` | An approve/deny gate that suspends the run until the user answers. | "Run `rm -rf /tmp/cache` for me" | **Pass:** the reply stops, a gate shows the command, and either button resumes the run with the agent narrating which you chose. **Fail:** the agent claims it ran the command with no gate. |
| `/generative-ui/a2ui/dynamic-schema` | BYO-catalog A2UI: a secondary LLM composes the layout per request. | "Show me the sales dashboard" | **Pass:** KPI tiles, a pie and a bar chart, with a one-sentence reply. **Fail:** empty boxes — the planner emitted a name the catalog lacks. |
| `/generative-ui/a2ui/fixed-schema` | The pre-authored-tree approach. No demo: the tool is published, the tree is not. | — | Reference only; see §9. |

### App Control

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/frontend-tools` | A tool whose handler runs in the browser and mutates the page. | "Make the background a warm sunset gradient" | **Pass:** the background transitions within a second. **Fail:** the agent describes a gradient and nothing moves. |
| `/human-in-the-loop` | `useHumanInTheLoop` suspending the run behind a time picker. | "Book an intro call with the sales team." | **Pass:** a picker appears, the reply stops, choosing a slot resumes with that specific time. **Fail:** the agent invents a time with no card. |
| `/programmatic-control` | `addMessage` + `runAgent` + `stopAgent` with no chat component anywhere. | Click a canned prompt, then Stop mid-stream | **Pass:** messages stream into hand-rolled bubbles; Stop halts mid-sentence. **Fail:** Send does nothing and the console is quiet. |

### Shared State

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/shared-state/rendering-in-app` | `useAgent` read outside the chat — a canvas and the chat sharing one state object. | Seed the canvas, then "what is on my checklist?" | **Pass:** the agent answers from the canvas and its answer changes when you tick an item. **Fail:** it says it cannot see a checklist. |
| `/shared-state/agent-readonly` | `useAgentContext` as a one-way UI → agent channel. | "What do you know about me?" | **Pass:** names the current display name, timezone and checked activities; changes when you edit them. **Fail:** it claims no information. |
| `/shared-state/in-app-agent-read` | Reading `agent.state` in your own components. | "What language are you speaking?" | **Pass:** heading reads `spanish` and the agent replies in Spanish. **Fail:** it replies in English. |
| `/shared-state/in-app-agent-write` | `agent.setState` writing back, folded into the prompt by `stateContextBuilder`. | Toggle, then send | **Pass:** the reply language flips. **Fail:** the heading changes but replies do not. |

### Multi-Agent, Agent Config, Runtime

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/multi-agent/subagents` | A supervisor delegating, with a live delegation log. | "Research, write, then critique a brief." | **Pass:** nothing — Broken by design, the delegation tools are unpublished. **Fail:** an entry appears; update the status. |
| `/agent-config` | A typed config object the UI owns, published as context. | Ask a question, change expertise to beginner, ask again | **Pass:** the second answer is longer and less jargon-heavy. **Fail:** identical answers. |
| `/copilot-runtime` | This repo's live runtime config and its agent roster, cross-checked. | Read the roster panel | **Pass:** 24 agents, "lists agree". **Fail:** a red panel naming agents present on one side only. |
| `/ag-ui` | `agent.subscribe` walking the raw AG-UI event stream. | "Tell me a two-sentence story." | **Pass:** `RUN_STARTED` → `STATE_SNAPSHOT` → `TEXT_MESSAGE_CONTENT` bursts → `MESSAGES_SNAPSHOT` → `RUN_FINISHED`. **Fail:** only `onStateChanged` rows. |

---

## 7. Testing checklist / current status

| Doc page | Route | Status | Notes |
|---|---|---|---|
| `/strands-typescript` | `/` | 📄 Reference | Landing page, agent roster, gap ledger. |
| — | `/doc-sync` | 📄 Reference | Doc drift against the captured snapshot; the manifest's `syncedAt` is the repo's one sync date. |
| `quickstart?agent=bring-your-own` | `/quickstart` | ✅ Working | The only fully published, runnable backend. Model id is wrong — see §9. |
| `prebuilt-components/chat` | `/prebuilt-components/chat` | ✅ Working | Off the doc sidebar. Its snippet calls an undefined `useAgenticChatSuggestions`. |
| `prebuilt-components/sidebar` | `/prebuilt-components/sidebar` | ✅ Working | Off-nav. `MainContent`/`Suggestions` unpublished. |
| `prebuilt-components/popup` | `/prebuilt-components/popup` | ✅ Working | Off-nav. |
| `prebuilt-components/chat-controls` | `/prebuilt-components/chat-controls` | ✅ Working | Off-nav. `analytics` in the snippet is undefined. |
| `prebuilt-components/copilot-threads-drawer` | `/prebuilt-components/copilot-threads-drawer` | ✅ Working | Wired as published. Needs a licence key to list anything; the page's `slot="header"` example does not typecheck. |
| `headless-threads` | `/headless-threads` | ✅ Working | Every hook member wired, pagination included. Same licence gate. Page shows one file as two incompatible hook calls. |
| `threads-lifecycle` | `/threads-lifecycle` | ✅ Working | Both lifecycle setters work without a licence; replay is what needs the store. Two snippets call an undefined `myApi`. |
| `threads-import` | `/threads-import` | 📄 Reference | CLI workflow, no application code. Neither supported source is Strands. |
| `custom-look-and-feel/css` | `/custom-look-and-feel/css` | ✅ Working | Off-nav. Published theme is a fragment; v1 import mixed in. |
| `custom-look-and-feel/slots` | `/custom-look-and-feel/slots` | ✅ Working | Off-nav. All three overrides take effect; the components behind them are `declare const` in the docs. |
| `custom-look-and-feel/headless-ui` | `/custom-look-and-feel/headless-ui` | ✅ Working | Off-nav. Chat streams. Every snippet stripped of imports; `generateMessageId` exported by no package. |
| `multimodal-attachments` | `/multimodal-attachments` | ✅ Working | Audio is advertised and silently discarded by the adapter. |
| `voice` | `/voice` | ✅ Working | `VoiceChat` unpublished; needs `OPENAI_API_KEY` for the mic. |
| `generative-ui/tool-based` | `/generative-ui/tool-based` | ✅ Working | Works via undocumented proxy-tool sync. Component + schema unpublished. |
| `generative-ui/tool-rendering` | `/generative-ui/tool-rendering` | ⚠️ Partial | `get_weather` supplied separately and working; `search_flights` still unpublished. Page prints a placeholder for both. |
| `your-components/display-only` | `/generative-ui/your-components/display-only` | ✅ Working | Off-nav. Fully published — rare. |
| `your-components/interactive` | `/generative-ui/your-components/interactive` | ✅ Working | Off-nav. Approve/deny gate via `useHumanInTheLoop`; example supplied separately. Page is still 156 bytes of placeholder. |
| `generative-ui/a2ui/dynamic-schema` | `/generative-ui/a2ui/dynamic-schema` | ⚠️ Partial | Backend is the one runnable factory. `renderers.tsx` has no imports and stops mid-file. |
| `generative-ui/a2ui/fixed-schema` | `/generative-ui/a2ui/fixed-schema` | ⚠️ Partial | Runs end to end. `display_flight` is the published `agent.ts` verbatim; the component tree it reads is published on no Strands page and was carried over from the Google ADK harness. |
| `frontend-tools` | `/frontend-tools` | ✅ Working | Works via proxy-tool sync; setup section is a placeholder. |
| `human-in-the-loop` | `/human-in-the-loop` | ✅ Working | Pattern 1 only. `useInterrupt` is LangGraph-only. |
| `programmatic-control` | `/programmatic-control` | ✅ Working | Google ADK's version, as requested. Three helpers undefined — reconstructed. |
| `shared-state/rendering-in-app` | `/shared-state/rendering-in-app` | ✅ Working | Byte-identical to ADK's page. Nothing agent-side can write state. |
| `shared-state/agent-readonly` | `/shared-state/agent-readonly` | ✅ Working | Page credits middleware the adapter does not have. |
| `shared-state/in-app-agent-read` | `/shared-state/in-app-agent-read` | ✅ Working | Page's `agentId` contradicts its own backend. |
| `shared-state/in-app-agent-write` | `/shared-state/in-app-agent-write` | ✅ Working | `initialState` in the snippet does not exist on the hook. |
| `multi-agent/subagents` | `/multi-agent/subagents` | ❌ Broken | Three placeholders; only the log component survives. |
| `agent-config` | `/agent-config` | ⚠️ Partial | UI half works. Backend sample is LangGraph Python. |
| `copilot-runtime` | `/copilot-runtime` | ✅ Working | Page never mentions Strands. |
| `ag-ui` | `/ag-ui` | ✅ Working | Page never mentions Strands. |

**Totals:** 25 ✅ Working · 4 ⚠️ Partial · 1 ❌ Broken · 3 📄 Reference.

Live version at `/status`, with the full gap ledger.

---

## 8. Not covered

These appear in the doc sidebar and are outside this repo's scope: CLI, Build with agents, all five Concepts pages, Rich Threads (5 pages), Reasoning, State Rendering, MCP Apps, six Runtime pages, Inspector, VS Code Extension, the four Intelligence Platform pages, Deploy/AgentCore, three migration guides, and Telemetry.

---

## 9. Known issues / doc-vs-implementation discrepancies

Forty-two findings are recorded in `frontend/src/lib/doc-gaps.ts`, and the full ledger renders on `/status`; the backend half is at `GET /gaps`. (The per-route red panels are currently switched off — every entry in `ROUTE_GAPS` is commented out — so findings show on `/status` and in each route's own prose rather than as a banner.) The ones that change what you can build:

**The backend is published and unrunnable** — [agent.ts, on 18 pages](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat). Complete file, four unpublished local imports, one unpublished JSON file, no `server.ts`. Full analysis in [`backend/docs_verbatim/README.md`](backend/docs_verbatim/README.md).

**Only the first tab of each demo viewer is published** — [tool-rendering](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-rendering). The tab strip advertises `tools.ts`, `page.tsx` and `route.ts`; only `agent.ts` is in the payload. `SHOWCASE_TOOLS` appears three times across the whole doc tree, all three the same import line.

**The Interactive route's example was supplied outside the docs too.** `generative-ui/your-components/interactive` publishes nothing — 156 bytes, one unrendered `<Interactive components={props.components} framework="aws-strands" />` tag, and note the Python framework slug on a page served under `/strands-typescript`. The `useHumanInTheLoop` approve/deny gate the route now runs was handed over separately and is reproduced verbatim. The route works; the page is still empty. Those are two different facts and the finding records both.

**One backend tool was supplied outside the docs.** The Tool Call Rendering route runs a `get_weather` that came from outside the documentation, reproduced verbatim in `backend/src/agents/tools.ts`. Its `getWeatherImpl` had to be written: that function lives in the unpublished `tools` module, and only its return shape is recoverable — from the `WeatherResult` interface the published frontend `page.tsx` declares. `search_flights` has no equivalent, so the page's second named renderer is still idle. The `snippet skipped: region 'weather-tool-backend'` finding stands: what the docs publish has not changed.

**Seven pages replace their backend section with `setup skipped`** — frontend-tools, tool-based, human-in-the-loop, agent-readonly, agent-config, programmatic-control, subagents.

**The Quickstart's runtime route exports two verbs; Rich Threads needs four.** The published block ends with `export const GET = handler;` and `export const POST = handler;`. Next.js answers any unexported verb with a 405, and the threads client issues four — GET and POST to list and connect, **PATCH** to rename and archive, **DELETE** to delete (verified against `@copilotkit/core` 1.69.0; it never issues PUT). So a runtime built to the Quickstart serves chat perfectly and 405s every thread mutation — `DELETE /api/copilotkit/threads/<id> 405` followed by `unhandledRejection: Error: Request failed: 405`. Because chat is unaffected the runtime looks healthy. Neither the Quickstart, the Threads Drawer page nor Headless Threads mentions the extra exports. This repo exports PATCH and DELETE on all three runtimes; the Voice page's published route is closer (POST/GET/PUT/DELETE) but still omits PATCH.

**The Threads Drawer's slot example does not typecheck.** The Customization section lists five slots and shows `<CopilotThreadsDrawer><span slot="header">…</span></CopilotThreadsDrawer>`. `CopilotThreadsDrawerProps` declares eleven members and `children` is not one of them, so that is a type error against `@copilotkit/react-core@1.69.0`. The underlying web component does accept slotted children — it is the React wrapper's typing that withholds them. The same prop table also omits `collapsible` and `onCollapseChange`, which exist on the type.

**Two licence paths on adjacent thread pages.** The Drawer page puts the key on the client (`publicLicenseKey="ck_pub_…"`); Headless Threads and the Quickstart put it on the server (`INTELLIGENCE_API_KEY`, "keep that key server-side"). Both props exist. Nothing says whether they are alternatives, complements, or two tiers.

**`verifyAppSession` is awaited and defined nowhere.** The `identifyUser` snippet on both Headless Threads and Thread & History Lifecycle calls it; the comment "Your server-side auth" is the whole specification. This harness uses the Quickstart's simpler published `identifyUser` instead.

**The thread importer supports no Strands source.** Served under `/strands-typescript`, its Supported sources table has exactly two rows — Google ADK and LangGraph — whose guides live under `/google-adk/` and `/langgraph-python/`. `--source` accepts neither `strands` nor any equivalent, and the page says "more sources coming soon" without saying Strands is absent.

**The Quickstart's own install line breaks its own runtime block.** `npm install … @ag-ui/client` is unpinned, and every CopilotKit package depends on **exactly** `0.0.57`. npm resolves the bare install to `0.0.58`, giving two copies in the tree, and `HttpAgent` from one is nominally a different class from the `AbstractAgent` the runtime expects — so the published `agents: { strands_agent: new HttpAgent({ url: … }) }` fails to typecheck with *"separate declarations of a private property `_debug`"*. This repo pins `@ag-ui/client` and `@ag-ui/core` to `0.0.57` exactly so the trees dedupe.

**The runtime block asserts a licence key the same page says you can omit.** It writes `apiKey: process.env.INTELLIGENCE_API_KEY!` — a non-null assertion — while the callout directly beneath says you can *"drop the `intelligence` and `identifyUser` options"* and fall back to SSE with an in-memory runner. Following the code literally with no key does not produce that fallback; it constructs `CopilotKitIntelligence` with `undefined`. Getting the documented behaviour requires a code change the block never shows. `frontend/src/lib/intelligence.ts` does the drop, so the harness runs with or without a licence.

**Published snippets that do not compile:**
- `initialState` on `useAgent` — [read](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-read) and [write](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-write). `UseAgentProps` accepts `agentId`, `threadId`, `runtimeAgentId`, `updates`, `throttleMs` — nothing else. The `render:` variant on the read page is invalid for the same reason. Both pages also declare a `type AgentState` they never apply; the hook is not generic.
- `generateMessageId()` — [headless-ui](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/headless-ui). Exported by no CopilotKit package.
- `onError={(event) => event.code}` — [multimodal-attachments](https://docs.copilotkit.ai/strands-typescript/multimodal-attachments). `onError` overlaps React's DOM handler, so `event` is a union and neither `code` nor `error` is on both arms.
- `renderers.tsx`, both A2UI pages — no import line at all, and the dynamic-schema copy stops mid-JSX with ten of eleven renderers unpublished.
- `delegation-log.tsx` — [subagents](https://docs.copilotkit.ai/strands-typescript/multi-agent/subagents). Four symbols used, none imported or defined.

**Wrong framework in Strands pages:**
- [agent-config](https://docs.copilotkit.ai/strands-typescript/agent-config) shows `async def my_agent_node(state: AgentState, config: RunnableConfig)` — LangGraph Python — under `backend/agent.py`.
- [a2ui/dynamic-schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/dynamic-schema) shows `from ag_ui_langgraph import get_a2ui_tools` and says tool calls "stream through LangGraph".
- [a2ui/fixed-schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/fixed-schema) refers to "the Python SDK's `a2ui.render`" and `src/agents/a2ui_fixed.py`.
- [headless-ui](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/headless-ui) logs `[langgraph-python:headless-simple]`.
- [human-in-the-loop](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop) devotes half its length to `useInterrupt`, whose own table names LangGraph as the backend surface.

**Wrong language / tree in the TypeScript pages:**
- [quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own) links its next-steps cards to `/aws-strands/...`, a prefix that does not exist. *(Two neighbouring defects here were fixed upstream at the 2026-08-26 re-sync: the CLI step now passes `--framework aws-strands-ts` instead of telling you to pick Python, and Prerequisites now qualifies Python 3.12+ with "Python agents only".)*
- Both Shared State pages link to `/langgraph/quickstart` and embed the `/aws-strands/` Python feature viewer.
- [your-components/interactive](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/interactive) passes `framework="aws-strands"`.

**Behaviour the docs get wrong:**
- **Audio attachments are discarded.** [multimodal-attachments](https://docs.copilotkit.ai/strands-typescript/multimodal-attachments) lists Audio with a player preview and "Model-dependent" support; `convertAguiContentToStrands` documents `AudioInputContent` as "skipped (Strands has no audio support)". It uploads, previews, sends, and vanishes with no error.
- **The read-only context middleware does not exist.** [agent-readonly](https://docs.copilotkit.ai/strands-typescript/shared-state/agent-readonly) credits a `CopilotKitMiddleware`. The adapter flattens `RunAgentInput.context[]` itself and passes it to `stateContextBuilder` as a third `extras` argument — undocumented anywhere.
- **The model does not exist.** [quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own) sets `modelId: "gpt-5.4"`; its own callout says GPT-4o.
- **Frontend tools work and nothing says why.** `createProxyTool` / `syncProxyTools`, per run. Google ADK's docs show `AGUIToolset()`; these show a placeholder.

---

## 10. Troubleshooting

The Strands TypeScript tree has no Common Issues page. Its Quickstart carries a four-line accordion, reproduced here with what actually goes wrong in this repo.

**"Connection issues" → try `0.0.0.0` or `127.0.0.1` instead of `localhost`.** Relevant on Node 18+, where DNS may resolve `localhost` to IPv6 `::1` while Express listens on IPv4. Set `AGENT_URL=http://127.0.0.1:8000` in `frontend/.env.local`.

**"Make sure your agent is running on port 8000."** `curl localhost:8000/health` should list 24 agents. If it returns something with `model_id` in snake_case, you have a *different* Strands harness on that port — change `PORT` and `AGENT_URL` together.

**"Check that your OpenAI API key is correctly set."** The backend warns at startup if `OPENAI_API_KEY` is missing but still starts, so the failure surfaces as a `RUN_ERROR` on the first message, not at boot.

**"Verify `@ag-ui/client` is installed in your frontend."** It is, and it is the package `HttpAgent` comes from — which the Copilot Runtime doc page uses in two snippets without ever importing.

Beyond the doc's list:

**`npm install` fails in `backend/` with an `ERESOLVE` peer conflict.** `@strands-agents/sdk@1.12.0` requires `openai@^6.45.0`. Pin the same major; do not reach for `--legacy-peer-deps`.

**404 from an agent endpoint.** Each agent is a mounted sub-app: the AG-UI root is `/{agent-id}/`, with the trailing slash. `agentUrl()` in `frontend/src/lib/agents.ts` adds it.

**A route chats but its feature does nothing.** Expected on the Broken routes — read the red panel at the top of the page. That state is the finding, not a bug in this repo.

**The inspector button overlaps a launcher.** The root provider anchors it bottom-left, because the Popup and Sidebar launchers are bottom-right. Never mount two inspectors on one page — `frontend/src/lib/inspector.ts` coordinates which provider owns it, and two lit inspectors spin into an unbounded assert loop that takes out the dev server.

---

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 28 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

Doc pages are fetched by appending `.md` to their URL, which returns the authored MDX rather than 250 KB of rendered HTML. Every response is checked for `text/markdown` before it is allowed near the snapshot: a URL that misses the markdown handler still answers `200` with the HTML app shell, and writing that in would destroy the baseline and report the whole corpus as rewritten on the next run. A run commits all pages or none.

**Severity is decided by where the edit landed**, not how big it was:

| Level | Trigger |
|---|---|
| **High** | a changed line inside a fenced code block, a changed fence count, or a page that now 404s and is gone from the sitemap |
| **Medium** | a changed heading, changed frontmatter `title`/`description`, or prose in the same section as changed code |
| **Low** | other prose |

**Sections checked** lists every tracked page in nav order with a mark — `✓` unchanged, `!` changed, `+` stored, `✗` 404, `~` unstable, `·` not checked. Expanding a row shows the comparison: for a changed page the diff (`−` existing snapshot, `+` newly fetched), and for an unchanged one the two matching hashes, which is the evidence the check ran.

**`doc-snapshot/CHANGELOG.md`** is the record that survives a re-sync. Because syncing replaces the copy it just compared against, the run *after* a change reports nothing — so the changelog is written at the moment of discovery and never rewritten later. Only changed pages are recorded; a clean run does not touch the file. It keeps the three most recent dated entries, counted rather than aged, so a change from six weeks ago still shows if nothing has happened since.

**One sync date.** `syncedAt` in `doc-snapshot/manifest.json`, rewritten on every run and shown on `/`, `/status` and `/doc-sync`. There is no hand-maintained date to keep in step with it.

**To test it**, edit any `doc-snapshot/pages/*.md` file and press the button — a line inside a code fence for High, a `##` heading for Medium, a sentence for Low. The comparison reads the stored file itself, so nothing else needs changing. Both `/doc-sync` and the changelog label the result as a local snapshot edit rather than upstream drift.

Commit `doc-snapshot/` — `pages/`, `manifest.json` and `CHANGELOG.md` are the baseline every diff is taken against. `reports/` is gitignored derived data.

---

## 11. Project structure

```
aws-strands-ts/
├── .env.example
├── README.md
├── backend/                              Node + Express agent server (:8000)
│   ├── docs_verbatim/
│   │   ├── agent_ts_published.ts         the published agent.ts — never imported
│   │   └── README.md                     what it depends on and why it cannot run
│   └── src/
│       ├── server.ts                     one createStrandsApp per agent, mounted at /{id}
│       └── agents/
│           ├── model.ts                  the Quickstart's model construction
│           ├── chat-agents.ts            21 Quickstart-shaped, tool-free agents
│           ├── state-agents.ts           the Shared State pages' StrandsAgentConfig
│           ├── a2ui-dynamic-agent.ts     the one runnable factory from agent.ts
│           └── registry.ts               id → mount path → builder → gaps
└── frontend/                             Next 16 App Router (:3000)
    └── src/
        ├── lib/
        │   ├── nav-config.ts             routes, statuses, doc links — one source of truth
        │   ├── doc-gaps.ts               the 30 findings and which routes show them
        │   ├── agents.ts                 agent ids + URL builder (mirrors registry.ts)
        │   ├── source.ts                 reads this repo's own files for the code panels
        │   ├── highlight.ts              server-side Shiki
        │   └── inspector.ts              which provider owns the inspector
        ├── components/                   route header, doc-gap panel, code figure, nav
        └── app/
            ├── api/copilotkit/                        main runtime, 23 agents
            ├── api/copilotkit-declarative-gen-ui/     A2UI dynamic schema
            ├── api/copilotkit-voice/[[...slug]]/      v2 handler + TranscriptionService
            ├── <route>/page.tsx                       notes, source, Try it, doc gaps
            └── <route>/demo-chat/page.tsx             the live surface, chrome-free
```

Each route is two files: a notes page that renders its own implementation from disk via `lib/source.ts`, and a `demo-chat` surface that renders full-bleed for screen recording. The code you read on a route is the code that runs, read at render time — never a re-typed copy.

---

## 12. References

Grouped as the doc sidebar groups them. Off-sidebar pages (reachable by URL only) are marked.

**Get Started** · [Introduction](https://docs.copilotkit.ai/strands-typescript) · [Quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own)

**Build Chat UIs — Rich Threads** · [Threads Drawer](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/copilot-threads-drawer) · [Headless Threads](https://docs.copilotkit.ai/strands-typescript/headless-threads) · [Thread & History Lifecycle](https://docs.copilotkit.ai/strands-typescript/threads-lifecycle) · [Synchronize Thread History](https://docs.copilotkit.ai/strands-typescript/threads-import)

**Build Chat UIs — Custom Look and Feel** · [Multimodal Attachments](https://docs.copilotkit.ai/strands-typescript/multimodal-attachments) · [Voice](https://docs.copilotkit.ai/strands-typescript/voice)

**Build Generative UI — Controlled** · [Components as Tools](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-based) · [Tool Call Rendering](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-rendering)

**Build Generative UI — Declarative** · [A2UI Dynamic Schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/dynamic-schema) · [A2UI Fixed Schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/fixed-schema)

**Add Agent Powers** · [Frontend Tools](https://docs.copilotkit.ai/strands-typescript/frontend-tools) · [Human-in-the-Loop](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop) · [Sub-Agents](https://docs.copilotkit.ai/strands-typescript/multi-agent/subagents) · [Agent Config](https://docs.copilotkit.ai/strands-typescript/agent-config) · [Programmatic Control](https://docs.copilotkit.ai/strands-typescript/programmatic-control)

**Runtime** · [Copilot Runtime](https://docs.copilotkit.ai/strands-typescript/copilot-runtime) · [AG-UI](https://docs.copilotkit.ai/strands-typescript/ag-ui)

**Not in the sidebar** · [CopilotChat](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat) · [CopilotSidebar](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/sidebar) · [CopilotPopup](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/popup) · [Chat controls](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat-controls) · [CSS](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/css) · [Slots](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/slots) · [Headless UI](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/headless-ui) · [Display-only](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/display-only) · [Interactive](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/interactive)

**Shared State** · [Render state in your app](https://docs.copilotkit.ai/strands-typescript/shared-state/rendering-in-app) · [Agent read-only context](https://docs.copilotkit.ai/strands-typescript/shared-state/agent-readonly) · [Reading agent state](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-read) · [Writing agent state](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-write)

**Carried over from Google ADK, on request** · [Programmatic Control](https://docs.copilotkit.ai/google-adk/programmatic-control) · [Render state in your app](https://docs.copilotkit.ai/google-adk/shared-state/rendering-in-app)
