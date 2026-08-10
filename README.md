# CopilotKit + AWS Strands (TypeScript) Test Suite

A navigable, working test harness for the CopilotKit ↔ AWS Strands (TypeScript) integration — one route per doc page, each either implementing what the page teaches or stating precisely why it cannot.

**Doc-sync date:** 2026-08-10 · **Routes:** 28 · **Agents:** 24 · **Doc gaps recorded:** 34 (11 blocking)
**Packages:** `@copilotkit/react-core` 1.66.4 · `@copilotkit/runtime` 1.66.4 · `@copilotkit/a2ui-renderer` 1.66.4 · `@copilotkit/voice` 1.66.4 · `@ag-ui/client` 0.0.57 · `@ag-ui/aws-strands` 0.2.3 · `@strands-agents/sdk` 1.12.0 · Next 16.3.0

---

## 1. Overview

AWS Strands is Amazon's agent SDK. Its TypeScript flavour talks to CopilotKit through `@ag-ui/aws-strands`, which wraps a Strands `Agent` in an AG-UI-speaking Express app. This repo covers every page under [`docs.copilotkit.ai/strands-typescript`](https://docs.copilotkit.ai/strands-typescript) named in its scope: 28 routes, each showing a live surface, the code behind it, and — where the doc page omits something — exactly what is missing.

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
       ├─ /api/copilotkit                       ─ 23 agents  → HttpAgent per id
       ├─ /api/copilotkit-declarative-gen-ui    ─ A2UI dynamic schema, injectA2UITool: true
       └─ /api/copilotkit-voice/[[...slug]]     ─ v2 runtime handler + TranscriptionService
              │  AG-UI over SSE
              ▼
Node agent server (backend/, :8000)  ─ Express
  └─ one createStrandsApp(aguiAgent, { path: "/" }) per agent, mounted at /{agent-id}
       └─ @ag-ui/aws-strands  →  @strands-agents/sdk Agent  →  OpenAI
```

- **Backend language:** TypeScript on Node, per the Quickstart's TypeScript tab (Express, not FastAPI — the Python tab is a different stack).
- **Three runtimes, not one.** Voice needs the v2 handler because the v1 App Router wrapper drops `transcriptionService`. A2UI dynamic-schema needs its own because it sets `injectA2UITool: true`, which must not apply to the other 23 agents.
- **Trailing slashes matter.** Each agent is a mounted sub-app, so its AG-UI root is `http://localhost:8000/<agent-id>/`. `frontend/src/lib/agents.ts` builds every URL that way.

---

## 3. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20+ | Both halves are Node; there is no Python in this repo. |
| npm | 10+ | Any package manager works; commands below use npm. |
| OpenAI API key | — | Required. Used for agent runs and for Whisper transcription on `/voice`. |

No Python, no `uv`, and no CopilotKit CLI. The Quickstart's CLI branch scaffolds **AWS Strands (Python)** — see §9.

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
| `quickstart?agent=bring-your-own` | `/quickstart` | ✅ Working | The only fully published, runnable backend. Model id is wrong — see §9. |
| `prebuilt-components/chat` | `/prebuilt-components/chat` | ✅ Working | Off the doc sidebar. Its snippet calls an undefined `useAgenticChatSuggestions`. |
| `prebuilt-components/sidebar` | `/prebuilt-components/sidebar` | ✅ Working | Off-nav. `MainContent`/`Suggestions` unpublished. |
| `prebuilt-components/popup` | `/prebuilt-components/popup` | ✅ Working | Off-nav. |
| `prebuilt-components/chat-controls` | `/prebuilt-components/chat-controls` | ✅ Working | Off-nav. `analytics` in the snippet is undefined. |
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
| `generative-ui/a2ui/fixed-schema` | `/generative-ui/a2ui/fixed-schema` | ❌ Broken | Tool published; `flight_schema.json` is not. No demo. |
| `frontend-tools` | `/frontend-tools` | ✅ Working | Works via proxy-tool sync; setup section is a placeholder. |
| `human-in-the-loop` | `/human-in-the-loop` | ✅ Working | Pattern 1 only. `useInterrupt` is LangGraph-only. |
| `programmatic-control` | `/programmatic-control` | ⚠️ Partial | Google ADK's version, as requested. Three helpers undefined — reconstructed. |
| `shared-state/rendering-in-app` | `/shared-state/rendering-in-app` | ⚠️ Partial | Byte-identical to ADK's page. Nothing agent-side can write state. |
| `shared-state/agent-readonly` | `/shared-state/agent-readonly` | ✅ Working | Page credits middleware the adapter does not have. |
| `shared-state/in-app-agent-read` | `/shared-state/in-app-agent-read` | ✅ Working | Page's `agentId` contradicts its own backend. |
| `shared-state/in-app-agent-write` | `/shared-state/in-app-agent-write` | ✅ Working | `initialState` in the snippet does not exist on the hook. |
| `multi-agent/subagents` | `/multi-agent/subagents` | ❌ Broken | Three placeholders; only the log component survives. |
| `agent-config` | `/agent-config` | ⚠️ Partial | UI half works. Backend sample is LangGraph Python. |
| `copilot-runtime` | `/copilot-runtime` | ✅ Working | Page never mentions Strands. |
| `ag-ui` | `/ag-ui` | ✅ Working | Page never mentions Strands. |

**Totals:** 20 ✅ Working · 5 ⚠️ Partial · 2 ❌ Broken · 1 📄 Reference · 1 landing page.

Live version at `/status`, with the full gap ledger.

---

## 8. Not covered

These appear in the doc sidebar and are outside this repo's scope: CLI, Build with agents, all five Concepts pages, Rich Threads (5 pages), Reasoning, State Rendering, MCP Apps, six Runtime pages, Inspector, VS Code Extension, the four Intelligence Platform pages, Deploy/AgentCore, three migration guides, and Telemetry.

---

## 9. Known issues / doc-vs-implementation discrepancies

Thirty-four findings are recorded in `frontend/src/lib/doc-gaps.ts` and rendered on the routes they affect; the backend half is at `GET /gaps`. The ones that change what you can build:

**The backend is published and unrunnable** — [agent.ts, on 18 pages](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat). Complete file, four unpublished local imports, one unpublished JSON file, no `server.ts`. Full analysis in [`backend/docs_verbatim/README.md`](backend/docs_verbatim/README.md).

**Only the first tab of each demo viewer is published** — [tool-rendering](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-rendering). The tab strip advertises `tools.ts`, `page.tsx` and `route.ts`; only `agent.ts` is in the payload. `SHOWCASE_TOOLS` appears three times across the whole doc tree, all three the same import line.

**The Interactive route's example was supplied outside the docs too.** `generative-ui/your-components/interactive` publishes nothing — 156 bytes, one unrendered `<Interactive components={props.components} framework="aws-strands" />` tag, and note the Python framework slug on a page served under `/strands-typescript`. The `useHumanInTheLoop` approve/deny gate the route now runs was handed over separately and is reproduced verbatim. The route works; the page is still empty. Those are two different facts and the finding records both.

**One backend tool was supplied outside the docs.** The Tool Call Rendering route runs a `get_weather` that came from outside the documentation, reproduced verbatim in `backend/src/agents/tools.ts`. Its `getWeatherImpl` had to be written: that function lives in the unpublished `tools` module, and only its return shape is recoverable — from the `WeatherResult` interface the published frontend `page.tsx` declares. `search_flights` has no equivalent, so the page's second named renderer is still idle. The `snippet skipped: region 'weather-tool-backend'` finding stands: what the docs publish has not changed.

**Seven pages replace their backend section with `setup skipped`** — frontend-tools, tool-based, human-in-the-loop, agent-readonly, agent-config, programmatic-control, subagents.

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
- [quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own) tells you to pick **AWS Strands (Python)** in the CLI, requires Python 3.12+ in prerequisites, and links its next-steps cards to `/aws-strands/...`, a prefix that does not exist.
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

**Build Chat UIs — Custom Look and Feel** · [Multimodal Attachments](https://docs.copilotkit.ai/strands-typescript/multimodal-attachments) · [Voice](https://docs.copilotkit.ai/strands-typescript/voice)

**Build Generative UI — Controlled** · [Components as Tools](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-based) · [Tool Call Rendering](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-rendering)

**Build Generative UI — Declarative** · [A2UI Dynamic Schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/dynamic-schema) · [A2UI Fixed Schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/fixed-schema)

**Add Agent Powers** · [Frontend Tools](https://docs.copilotkit.ai/strands-typescript/frontend-tools) · [Human-in-the-Loop](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop) · [Sub-Agents](https://docs.copilotkit.ai/strands-typescript/multi-agent/subagents) · [Agent Config](https://docs.copilotkit.ai/strands-typescript/agent-config) · [Programmatic Control](https://docs.copilotkit.ai/strands-typescript/programmatic-control)

**Runtime** · [Copilot Runtime](https://docs.copilotkit.ai/strands-typescript/copilot-runtime) · [AG-UI](https://docs.copilotkit.ai/strands-typescript/ag-ui)

**Not in the sidebar** · [CopilotChat](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat) · [CopilotSidebar](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/sidebar) · [CopilotPopup](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/popup) · [Chat controls](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat-controls) · [CSS](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/css) · [Slots](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/slots) · [Headless UI](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/headless-ui) · [Display-only](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/display-only) · [Interactive](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/interactive)

**Shared State** · [Render state in your app](https://docs.copilotkit.ai/strands-typescript/shared-state/rendering-in-app) · [Agent read-only context](https://docs.copilotkit.ai/strands-typescript/shared-state/agent-readonly) · [Reading agent state](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-read) · [Writing agent state](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-write)

**Carried over from Google ADK, on request** · [Programmatic Control](https://docs.copilotkit.ai/google-adk/programmatic-control) · [Render state in your app](https://docs.copilotkit.ai/google-adk/shared-state/rendering-in-app)
