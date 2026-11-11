# CopilotKit + AWS Strands (TypeScript) Test Suite

A navigable, working test harness for the CopilotKit ↔ AWS Strands (TypeScript) integration — one route per doc page, each either implementing what the page teaches or stating precisely why it cannot.

**Doc sync:** see `/doc-sync` in the running app (the manifest's `syncedAt` is the single source of truth) · **Routes:** 36 · **Agents:** 27 · **Doc gaps recorded:** 55 (19 blocking)
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
| `ANTHROPIC_API_KEY` | no | Enables `strands_agent_anthropic`, the Quickstart's "Using Anthropic instead" agent (the Anthropic side of the toggle on `/quickstart/demo-chat`). Without it that one agent is left unmounted and everything else runs as normal. |
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
  agents: 28
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
| `/quickstart` | The bring-your-own-agent path end to end — the one page whose backend is published and runnable. The demo runs on the page's own `app/providers.tsx`, so the sidebar reaches the agent through the provider's `agent` prop alone. | "Can you tell me a joke?" | **Pass:** tokens stream a word at a time, markdown renders. **Fail:** error banner — check the server is up and `OPENAI_API_KEY` is set. An "agent not found" error means the provider's `agent` binding did not reach the sidebar. **Anthropic:** flip the OpenAI / Anthropic toggle at the top of the demo (agent `strands_agent_anthropic`). The chat resets; same prompt, same pass criteria, answered by `claude-sonnet-4-6`. Requires `ANTHROPIC_API_KEY` in the agent server's env at startup; without it the agent is not mounted and the request fails. |

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
| `/custom-look-and-feel/markdown` | The `markdownRenderer` slot in its three forms, one tab each: Streamdown `components` map, class string, replacement component. | "Reply with a level-2 markdown heading, then a paragraph containing a markdown link to https://copilotkit.ai" | **Pass:** *components map* — in DevTools the `<h2>` has `class="my-heading"` and the `<a>` has `class="my-link"` plus `target="_blank" rel="noopener noreferrer"`, with no `data-streamdown` or `node` attribute. Nothing changes visually, because the page defines no CSS for those classes. *class string* — the container has `text-sm leading-7`. *PlainText* — the raw `##` / `[…](…)` markup shows inside a `<pre>`. A `<reference-chip>` in a reply is removed and its text kept. **Fail:** the anchor still has `data-streamdown="link"`, or the PlainText tab shows formatted HTML. |

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
| `/generative-ui/json-render` | An agent-emitted `{ root, elements }` spec, checked against a Zod catalog and drawn by `@json-render/react`. The demo runs a fixed renderer: the doc's `<Renderer spec catalog>` call throws on 0.21, so it builds a `registry` and adds `<JSONUIProvider>`. The unpublished helpers, components, runtime route and agent prompt are written in. | "Show me a sales dashboard." | **Pass:** two suggestion pills, then metric cards and a bar or pie chart filling in as the JSON streams. **Fail:** raw JSON or nothing; check in the Inspector that the reply is a `{ root, elements }` object. See `JSON_RENDERER_FIX.md`. |
| `/generative-ui/hashbrown` | The same dashboard streamed through `@hashbrownai/react`'s progressive parser. The demo runs a fixed renderer: the doc's hook calls throw on 0.6.1, so it exposes the components with `exposeComponent`, parses against `kit.schema` and draws with `kit.render`. The unpublished components, runtime route and agent prompt are written in. | "Show me a sales dashboard." | **Pass:** two suggestion pills, then an empty stack that fills with metric cards and a chart as the JSON streams. **Fail:** nothing renders; check in the Inspector that the reply starts with `{"ui": [`. See `HASHBROWN_FIX.md`. |
| `/generative-ui/components/surfaces` | `GenerativeUISurface` page targets the chat fills, limits, scrolls to and replaces; every Components route talks to the `genui` agent through `/api/copilotkit-genui`. | "Show me cheap running shoes in the featured row." then "Show the featured products again." | **Pass:** the agent calls `search_products`, the page's own row is replaced by a ProductGrid, and the second prompt brings the row back. **Fail:** the grid lands in the chat, so the target's description never reached the agent. |
| `/generative-ui/components/catalogs` | `createGenerativeUI` catalogs: typed props, zod and Valibot, `extends`, `parameterOrder`, `exportA2UICatalog`. | "Show me three running shoes as product cards." | **Pass:** ProductCards whose values match the `search_products` result; the Export tab lists `component, title, children, color`. **Fail:** standard components such as Table appear on `shopUI`. |
| `/generative-ui/components/standard-catalog` | `standardUI` as is, extended, with `omit`, and with a `Card` override. | "Show the Eiffel Tower and the Louvre on a map." | **Pass:** a MapLibre map on `standardUI`, and no map on the omit variant. **Fail:** a plain list on `standardUI`, so `maplibre-gl` did not load. |
| `/generative-ui/components/state-and-actions` | `bind` from app state, functions on click, events sent to the agent, writable props. | Add p1 twice, then "Show product cards for p1 Trail Runner and p2 City Sneaker." | **Pass:** "In cart: 2" and "In cart: 0" from app state; Add to cart updates the Cart panel with no chat message. **Fail:** a chat message on click, so the event did not match `addToCart`. |
| `/generative-ui/components/theming` | `theme` variables, a typed theme file, dark overrides, map styles, `.a2ui-surface` CSS. | "Show a card with a primary button, a slider, and a bar chart of three months." | **Pass:** amber `#d97706` accent on the button and slider. **Fail:** the default accent on the Provider theme variant. The Map variant's basemap is blank by design (the page's URLs are placeholders). |
| `/generative-ui/components/transports` | The `render_ui` tool transport vs `a2ui` fences in markdown, with `generativeUI: true` and `agentIds`. | "Compare the Starter, Team, and Enterprise plans in a table." | **Pass:** a table component (tool), a table inside the reply (markdown), and plain text when chatting as `default` under `agentIds: ["shop"]`. **Fail:** UI as `default`, so `agentIds` was ignored. |
| `/generative-ui/components/markdown-mode` | The agent writes A2UI operations in `a2ui` code blocks in its reply. | "Give me a seat-count slider that shows the monthly price at $29 per seat." | **Pass:** prose with a live slider card in the middle. **Fail:** raw JSON in a code block. The `sendContext: false` variant shows no UI by design. |
| `/generative-ui/components/from-a2ui` | The A2UI 1.0 "After" catalog (`Airport`, `Arrow`) on the new engine. | "Show a flight card from SFO (San Francisco) to JFK (New York) with a Book button." | **Pass:** two Airport components with an Arrow and a Button. **Fail:** a rejection naming a v0.9 shape. |
| `/generative-ui/mcp-apps` | The runtime's `mcpApps.servers` (the Code tab's route, verbatim) rendering Excalidraw MCP tools inline. | "Draw a simple flowchart: Idea → Build → Ship." | **Pass:** an interactive Excalidraw canvas in an iframe in the chat. **Fail:** a text-only answer, so the MCP tools did not reach the model (check the Inspector). Needs internet access to `mcp.excalidraw.com`. |
| `/generative-ui/open-generative-ui` | `generateSandboxedUi` streaming HTML/CSS/JS into a sandboxed iframe; `/demo-chat/advanced` adds sandbox functions. | Minimal: "Build me a simple greeting card." Advanced: "Build a calculator whose = button calls evaluateExpression." | **Pass:** the preview fills in as it streams; on the advanced demo, = logs `evaluateExpression` in the console. **Fail:** plain text. That is possible on the minimal demo, which runs on the default design skill because the page's own skill is unpublished. |

### App Control

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/frontend-tools` | A tool whose handler runs in the browser and mutates the page. The "Registering a list of tools" `useFrontendTools` snippet is shown verbatim and not run. | "Make the background a warm sunset gradient" | **Pass:** the background transitions within a second. **Fail:** the agent describes a gradient and nothing moves. The `useFrontendTools` panel is expected to show Broken: the hook is not exported by `@copilotkit/react-core` 1.73.0. |
| `/webmcp` | `useFrontendTool` with `webmcp` mirrors `searchOrders` onto `document.modelContext`; `/demo-chat/core-only` registers it on a bare `CopilotKitCore`. | "Which of my orders have shipped?" | **Pass:** the agent lists A-1002 and A-1004. In Chrome 149+ with the WebMCP flag, the banner is green and the Model Context Tool Inspector shows the tool. **Fail:** an amber banner in a browser that should support WebMCP. |
| `/human-in-the-loop` | `useHumanInTheLoop` suspending the run behind a time picker. | "Book an intro call with the sales team." | **Pass:** a picker appears, the reply stops, choosing a slot resumes with that specific time. **Fail:** the agent invents a time with no card. |
| `/human-in-the-loop/governed-actions` | The same hook used as a policy gate: the agent proposes a side effect, the card prints its arguments, the run waits. | "Email carol@northwind.test to confirm her refund of $420 on order NW-8812." | **Pass:** an approval card appears with the proposed arguments, the reply stops, approving resumes the run. **Fail:** the agent claims it sent the email with no card, or the buttons do nothing. A card reading "Allowed by policy" is the model inventing a verdict — expected, see §9. |
| `/human-in-the-loop/useInterrupt` | A native Strands interrupt (`context.interrupt`) in the published `interrupt-agent.ts`; `useInterrupt` renders the picker inline and `resolve` resumes the run. | "Book an intro call with the sales team to discuss pricing." | **Pass:** a picker card appears and the run stops; picking a slot makes the agent confirm that exact time, and Cancel makes it say the meeting was not scheduled. **Fail:** no card (no interrupt outcome in the Inspector), or "did not pick a time" after picking (resume payload mismatch). |
| `/human-in-the-loop/headless` | The same interrupt, rendered in an app panel outside the chat (`renderInChat: false`). | "Book a call with the design team to review the new onboarding flow." | **Pass:** the slot popup appears beside the chat, not in it, and picking resumes the run. **Fail:** the picker shows in the transcript. |
| `/programmatic-control` | `addMessage` + `runAgent` + `stopAgent` with no chat component anywhere. | Click a canned prompt, then Stop mid-stream | **Pass:** messages stream into hand-rolled bubbles; Stop halts mid-sentence. **Fail:** Send does nothing and the console is quiet. |

### Shared State

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/shared-state` | The overview's two-way state: `useAgent` reads notes into a card, `agent.setState` writes preferences. Fragments verbatim inside glue, on the existing `shared-state-read-write` agent. | "Remember that I prefer short answers and I'm learning Spanish." | **Pass (as shipped, Broken):** the chat answers and the Agent Scratch pad stays empty, since `set_notes` is unpublished and nothing calls `handlePreferencesChange`. **Fail:** an agent-not-found error. |
| `/shared-state/rendering-in-app` | `useAgent` read outside the chat — a canvas and the chat sharing one state object. | Seed the canvas, then "what is on my checklist?" | **Pass:** the agent answers from the canvas and its answer changes when you tick an item. **Fail:** it says it cannot see a checklist. |
| `/shared-state/agent-readonly` | `useAgentContext` as a one-way UI → agent channel. | "What do you know about me?" | **Pass:** names the current display name, timezone and checked activities; changes when you edit them. **Fail:** it claims no information. |
| `/shared-state/in-app-agent-read` | Reading `agent.state` in your own components. | "What language are you speaking?" | **Pass:** heading reads `spanish` and the agent replies in Spanish. **Fail:** it replies in English. |
| `/shared-state/in-app-agent-write` | `agent.setState` writing back, folded into the prompt by `stateContextBuilder`. | Toggle, then send | **Pass:** the reply language flips. **Fail:** the heading changes but replies do not. |

### Multi-Agent, Agent Config, Runtime

| Route | What it demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/multi-agent/subagents` | A supervisor delegating, with a live delegation log. | "Research, write, then critique a brief." | **Pass:** nothing — Broken by design, the delegation tools are unpublished. **Fail:** an entry appears; update the status. |
| `/agent-config` | A typed config object the UI owns, published as context; the Strands adapter shows it to the model per call. | Ask a question, change expertise to beginner and length to detailed, ask again | **Pass:** the second answer is longer and less jargon-heavy, and the config text never appears inside your own messages. **Fail:** identical answers, or the config shows up as part of a user message. |
| `/copilot-runtime` | This repo's live runtime config and its agent roster, cross-checked. | Read the roster panel | **Pass:** 24 agents, "lists agree". **Fail:** a red panel naming agents present on one side only. |
| `/ag-ui` | `agent.subscribe` walking the raw AG-UI event stream. | "Tell me a two-sentence story." | **Pass:** `RUN_STARTED` → `STATE_SNAPSHOT` → `TEXT_MESSAGE_CONTENT` bursts → `MESSAGES_SNAPSHOT` → `RUN_FINISHED`. **Fail:** only `onStateChanged` rows. |

---

## 7. Testing checklist / current status

| Doc page | Route | Status | Notes |
|---|---|---|---|
| `/strands-typescript` | `/` | 📄 Reference | Landing page, agent roster, gap ledger. |
| — | `/doc-sync` | 📄 Reference | Doc drift against the captured snapshot; the manifest's `syncedAt` is the repo's one sync date. |
| `quickstart?agent=bring-your-own` | `/quickstart` | ✅ Working | The only fully published, runnable backend. Re-synced 2026-09-16: provider split into a client `providers.tsx`, reproduced verbatim. Model id is wrong — see §9. OpenAI / Anthropic toggle on the demo for the page's "Using Anthropic instead" callout (TypeScript snippet, verbatim). |
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
| `custom-look-and-feel/markdown` | `/custom-look-and-feel/markdown` | ✅ Working | All three snippets verbatim, and they type-check. `my-link` / `my-heading` have no CSS on the page, so example 1 is verifiable only in DevTools. |
| `multimodal-attachments` | `/multimodal-attachments` | ✅ Working | Audio is advertised and silently discarded by the adapter. |
| `voice` | `/voice` | ✅ Working | `VoiceChat` unpublished; needs `OPENAI_API_KEY` for the mic. |
| `generative-ui/tool-based` | `/generative-ui/tool-based` | ✅ Working | Works via undocumented proxy-tool sync. Component + schema unpublished. |
| `generative-ui/tool-rendering` | `/generative-ui/tool-rendering` | ⚠️ Partial | `get_weather` supplied separately and working; `search_flights` still unpublished. Page prints a placeholder for both. |
| `your-components/display-only` | `/generative-ui/your-components/display-only` | ✅ Working | Off-nav. Fully published — rare. |
| `your-components/interactive` | `/generative-ui/your-components/interactive` | ✅ Working | Off-nav. Approve/deny gate via `useHumanInTheLoop`; example supplied separately. Page is still 156 bytes of placeholder. |
| `generative-ui/a2ui/dynamic-schema` | `/generative-ui/a2ui/dynamic-schema` | ⚠️ Partial | Backend is the one runnable factory. `renderers.tsx` has no imports and stops mid-file. |
| `generative-ui/a2ui/fixed-schema` | `/generative-ui/a2ui/fixed-schema` | ⚠️ Partial | Runs end to end. `display_flight` is the published `agent.ts` verbatim; the component tree it reads is published on no Strands page and was carried over from the Google ADK harness. |
| `generative-ui/json-render` | `/generative-ui/json-render` | ✅ Working | Runs the fixed renderer (`registry` + `<JSONUIProvider>`); the doc's `<Renderer catalog>` call throws on 0.21. Missing helpers, components, runtime route and prompt are written in. |
| `generative-ui/hashbrown` | `/generative-ui/hashbrown` | ✅ Working | Runs the fixed renderer; the doc's `useJsonParser` / `useUiKit` calls have the wrong signatures and its example output is the wrong shape for Hashbrown. Missing components, runtime route and prompt are written in. |
| `generative-ui/components/surfaces` | `/generative-ui/components/surfaces` | ⚠️ Partial | Every snippet runs. `Product`, `ProductRow`, the product list and the `search_products` tool are repo-authored. Built, not yet checked in a browser. |
| `generative-ui/components/catalogs` | `/generative-ui/components/catalogs` | ⚠️ Partial | Every snippet runs; `Hero`, `Panel` and `cartUI` are scaffolding. Built, not yet checked in a browser. |
| `generative-ui/components/standard-catalog` | `/generative-ui/components/standard-catalog` | ⚠️ Partial | Framework-neutral URL (no `strands-typescript` variant). `ProductCard` and `productSchema` are scaffolding. Built, not yet checked in a browser. |
| `generative-ui/components/state-and-actions` | `/generative-ui/components/state-and-actions` | ⚠️ Partial | `Cart` and the catalogs around the fragments are scaffolding; the agent cannot call renderer functions in this version. Built, not yet checked in a browser. |
| `generative-ui/components/theming` | `/generative-ui/components/theming` | ⚠️ Partial | The `mapStyle` URLs are placeholders, so there is no basemap. Built, not yet checked in a browser. |
| `generative-ui/components/transports` | `/generative-ui/components/transports` | ⚠️ Partial | The runtime's `agent` is undefined on the page; the `genui` agent stands in. Built, not yet checked in a browser. |
| `generative-ui/components/markdown-mode` | `/generative-ui/components/markdown-mode` | ⚠️ Partial | `sendContext: false` needs a backend that reads `forwardedProps`; only Python is shown. Built, not yet checked in a browser. |
| `generative-ui/components/from-a2ui` | `/generative-ui/components/from-a2ui` | ⚠️ Partial | After catalog runs; `@ag-ui/a2ui-toolkit` 0.0.5 tools (this repo's fixed-schema agent) are out of scope for the new engine. Built, not yet checked in a browser. |
| `generative-ui/mcp-apps` | `/generative-ui/mcp-apps` | ⚠️ Partial | Runtime route verbatim; `./chat` and the showcase agent at `/` are stand-ins. Built, not yet checked in a browser. |
| `generative-ui/open-generative-ui` | `/generative-ui/open-generative-ui` | ⚠️ Partial | Runtime verbatim; design skill and suggestions are unpublished and commented out. Built, not yet checked in a browser. |
| `frontend-tools` | `/frontend-tools` | ⚠️ Partial | `useFrontendTool` works via proxy-tool sync; setup section is a placeholder. "Registering a list of tools" is ❌ Broken: `useFrontendTools` is not exported by `@copilotkit/react-core` 1.73.0, and `reports` / `navigate` are undefined. |
| `webmcp` | `/webmcp` | ⚠️ Partial | Both snippets run; `searchOrders` is a stub. WebMCP needs Chrome 149+ with the flag. Built, not yet checked in a browser. |
| `human-in-the-loop` | `/human-in-the-loop` | ✅ Working | Pattern 1 only. `useInterrupt` is LangGraph-only. |
| `human-in-the-loop/governed-actions` | `/human-in-the-loop/governed-actions` | ⚠️ Partial | `useHumanInTheLoop` half only, verbatim. The approval mechanism works; nothing publishes the policy engine, the tool that emits a `GovernedAction`, or `executeSideEffect`, so `verdict` is model-invented. `useInterrupt` half not implemented — no Strands backend raises an interrupt. |
| `human-in-the-loop/useInterrupt` | `/human-in-the-loop/useInterrupt` | ⚠️ Partial | Agent and page published; primitives and `generateFallbackSlots` are repo-authored, suggestions commented out, `createModel` swapped. Built, not yet checked in a browser. |
| `human-in-the-loop/headless` | `/human-in-the-loop/headless` | ⚠️ Partial | Page unchanged; only `generateFallbackSlots` and `createModel` are repo-supplied. Built, not yet checked in a browser. |
| `programmatic-control` | `/programmatic-control` | ✅ Working | Google ADK's version, as requested. Three helpers undefined — reconstructed. |
| `shared-state` | `/shared-state` | ❌ Broken | Backend skipped for Strands TS; `set_notes` and the preferences form never printed. Fragments + `NotesCard` verbatim in glue; card/button are repo stand-ins. |
| `shared-state/rendering-in-app` | `/shared-state/rendering-in-app` | ✅ Working | Byte-identical to ADK's page. Nothing agent-side can write state. |
| `shared-state/agent-readonly` | `/shared-state/agent-readonly` | ✅ Working | Page credits middleware the adapter does not have. |
| `shared-state/in-app-agent-read` | `/shared-state/in-app-agent-read` | ✅ Working | Page's `agentId` contradicts its own backend. |
| `shared-state/in-app-agent-write` | `/shared-state/in-app-agent-write` | ✅ Working | `initialState` in the snippet does not exist on the hook. |
| `multi-agent/subagents` | `/multi-agent/subagents` | ❌ Broken | Three placeholders; only the log component survives. |
| `agent-config` | `/agent-config` | ✅ Working | Runs the page's demo Code tab unchanged on its own runtime (`/api/copilotkit-agent-config`, agent `agent-config-demo`), plus the page's `withStateContext` and `ShowcaseStrandsAgent`. The adapter (0.3.0) shows context to the model per call. `formatPreferencesBlock` is unpublished, so its lines are commented out; this route doesn't use them. |
| `copilot-runtime` | `/copilot-runtime` | ✅ Working | Page never mentions Strands. |
| `ag-ui` | `/ag-ui` | ✅ Working | Page never mentions Strands. |

**Totals:** 28 ✅ Working · 18 ⚠️ Partial · 3 ❌ Broken · 3 📄 Reference.

Live version at `/status`, with the full gap ledger.

---

## 8. Not covered

These appear in the doc sidebar and are outside this repo's scope: CLI, Build with agents, all five Concepts pages, Rich Threads (5 pages), Reasoning, State Rendering, six Runtime pages, Inspector, VS Code Extension, the four Intelligence Platform pages, Deploy/AgentCore, three migration guides, and Telemetry.

---

## 9. Known issues / doc-vs-implementation discrepancies

Sixty-nine findings are recorded in `frontend/src/lib/doc-gaps.ts`, twenty of them blocking, and the full ledger renders on `/status`; the backend half is at `GET /gaps`. (The per-route red panels are switched off almost everywhere — most entries in `ROUTE_GAPS` are commented out — so findings generally show on `/status` and in each route's own prose rather than as a banner. The exceptions that render their panels are `/human-in-the-loop/governed-actions` and `/frontend-tools`.) The ones that change what you can build:

**The backend is published and unrunnable** — [agent.ts, on 18 pages](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat). Complete file, four unpublished local imports, one unpublished JSON file, no `server.ts`. Full analysis in [`backend/docs_verbatim/README.md`](backend/docs_verbatim/README.md).

**Only the first tab of each demo viewer is published** — [tool-rendering](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-rendering). The tab strip advertises `tools.ts`, `page.tsx` and `route.ts`; only `agent.ts` is in the payload. `SHOWCASE_TOOLS` appears three times across the whole doc tree, all three the same import line.

**The Interactive route's example was supplied outside the docs too.** `generative-ui/your-components/interactive` publishes nothing — 156 bytes, one unrendered `<Interactive components={props.components} framework="aws-strands" />` tag, and note the Python framework slug on a page served under `/strands-typescript`. The `useHumanInTheLoop` approve/deny gate the route now runs was handed over separately and is reproduced verbatim. The route works; the page is still empty. Those are two different facts and the finding records both.

**One backend tool was supplied outside the docs.** The Tool Call Rendering route runs a `get_weather` that came from outside the documentation, reproduced verbatim in `backend/src/agents/tools.ts`. Its `getWeatherImpl` had to be written: that function lives in the unpublished `tools` module, and only its return shape is recoverable — from the `WeatherResult` interface the published frontend `page.tsx` declares. `search_flights` has no equivalent, so the page's second named renderer is still idle. The `snippet skipped: region 'weather-tool-backend'` finding stands: what the docs publish has not changed.

**The Governed Actions page publishes a UI with nothing behind it.** [governed-actions](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop/governed-actions), fetched 2026-09-14. Every other HITL page at least emits the `setup skipped` placeholder where its backend belongs; this one emits nothing at all. No published tool produces a `GovernedAction`, nothing computes its `verdict`, and `executeSideEffect(action.tool, action.arguments)` — called by the page's own `handleApproval` sample — is defined on no page in the tree. So the route can demonstrate that the approval gate suspends and resumes a run, and cannot demonstrate governance: the `verdict` the card reports is whatever the model put in the tool call. An `allow` verdict auto-approves via the card's `useEffect` without the user seeing a decision point, which is exactly the case you would want a real policy engine behind.

**The page's second pattern renders a component only its first pattern defines.** Same page. `GovernedActionCard` is declared at the foot of the `useInterrupt` block; the `useHumanInTheLoop` block below renders it without redefining or importing it. Following the second block alone leaves you with an undefined component. This repo lifts the card into its own file, verbatim, which is what makes the second block runnable. Its `useEffect` deps array — `[action.id, action.verdict]`, omitting `onApprove` and `onBlock` — is the doc's and trips `react-hooks/exhaustive-deps`; kept as published.

**`ToolCallStatus` looks unexported from `/v2` and is not.** Recorded because it costs time to chase. The enum appears nowhere in the export list `@copilotkit/react-core/v2` spells out, so grepping `dist/v2/index.mjs` for it returns nothing — but line 7 of that file is `export * from "@copilotkit/core"` and the enum arrives on that star, in the types and at runtime both (`inProgress` / `executing` / `complete`). The doc's import is correct as published. This is the reason `generative-ui/your-components/interactive` can compare the bare string `"executing"` and behave identically.

**The approval card is styled with tokens the Quickstart never installs.** Same page. `GovernedActionCard` uses `text-muted-foreground` and `bg-muted`, shadcn/ui theme tokens. Nothing in the Strands TypeScript tree installs shadcn or defines those variables, so in a Quickstart-shaped app — including this one, on Tailwind v4 — both resolve to nothing and those lines render unstyled.

**`useFrontendTools` is documented and not shipped.** [frontend-tools#registering-a-list-of-tools](https://docs.copilotkit.ai/strands-typescript/frontend-tools#registering-a-list-of-tools), fetched 2026-09-21. The section presents `useFrontendTools(tools, deps)` as the way to register a variable-length list of tools. `@copilotkit/react-core@1.73.0` is both the installed version and npm `latest`, and it exports no symbol by that name from any entry point. The snippet also uses `reports` and `navigate` without defining them. The route shows the snippet verbatim and does not run it.

**JSON Render publishes the outline of a renderer, not the renderer.** [json-render](https://docs.copilotkit.ai/strands-typescript/generative-ui/json-render), fetched 2026-09-21. `parseSpec` calls `stripCodeFencesAndPrelude`, `tolerantJsonParse` and `validateAgainstCatalog`, and none of them is defined anywhere. Yet those helpers are the "tolerant parser" the page's prose relies on. `registry.tsx` imports `MetricCard`, `BarChart` and `PieChart` from three files that are never shown. The example output's root element is a `Stack`, which the catalog does not register. `AssistantMessage` is never imported. With all of that supplied, `<Renderer spec catalog>` still would not type-check: `@json-render/react@0.21.0` takes `registry`, not `catalog`. The backend half is just sample output. `buildByocJsonRenderAgent` in the published `agent.ts` depends on the unpublished `BYOC_JSON_RENDER_SYSTEM_PROMPT`, and `/api/copilotkit-byoc-json-render` is never shown.

The route now runs, using a fixed renderer. The missing pieces are written in and labelled as not from the docs: the three helpers (`spec-helpers.ts`), the three components (`components/byoc-dashboard.tsx`, re-exported at the doc's import paths), the runtime route, and the prompt. The agent is the published `buildByocJsonRenderAgent`, with `createModel` substituted as for the A2UI agent. The doc's `<Renderer catalog>` call would throw at runtime (without `<JSONUIProvider>`, most likely `useVisibility must be used within a VisibilityProvider`), and its `messageView={{ assistantMessage: … }}` line fails CopilotKit 1.74's slot type. The page also calls `useConfigureSuggestions` outside its own `<CopilotKit>`, so its suggestions never reach its chat. `json-render-fixed.tsx` builds a `registry` from the page's catalog, adds `<JSONUIProvider>`, plugs in through `assistantMessage.markdownRenderer`, and calls the suggestions hook inside the provider. The full write-up is in `JSON_RENDERER_FIX.md`.

**Hashbrown's hook calls don't match Hashbrown, and its example output doesn't either.** [hashbrown](https://docs.copilotkit.ai/strands-typescript/generative-ui/hashbrown), re-fetched 2026-09-29, unchanged. In `@hashbrownai/react@0.6.1` (0.5.0 when first checked), `useJsonParser(json, schema)` requires a schema and returns `{ parserState, value, error }`. `useUiKit` takes `{ components }` built with `exposeComponent`, and returns a kit object rather than nodes. The page calls `useJsonParser(content)` and `useUiKit({ catalog, value })`, then renders the result directly. The catalog components come from `./metric-card` and `./charts`, which are never published. The backend section says only that it "depends on your framework". `BYOC_HASHBROWN_SYSTEM_PROMPT` and `/api/copilotkit-byoc-hashbrown` are published nowhere.

The page's example agent output, `{ "type": "MetricCard", "title": … }`, is also the wrong shape. Hashbrown's UI kit parses a `{ "ui": [ { "MetricCard": { "props": { … } } } ] }` envelope. Given the page's shape, a correctly built kit draws nothing (checked by server-rendering both shapes). So even with the hooks fixed, an agent that follows the page produces an empty chat. The example's `Stack` isn't in the catalog either, and Hashbrown throws `Unknown element type` for unexposed names.

The route now runs, using a fixed renderer. The missing components, runtime route and prompt are written in. The agent is the published `buildByocHashbrownAgent`, with a harness-authored prompt asking for the envelope. `hashbrown-fixed.tsx` exposes the components, including `Stack` and a `MetricCard` adapter for the nullable `delta`, with `s.*` prop schemas. It calls `useJsonParser(content, kit.schema)` and `kit.render(value)`, strips prose and code fences first, replaces the whole `assistantMessage` as the page does (cast to satisfy CopilotKit's slot type), and calls the suggestions hook inside the provider. The full write-up is in `HASHBROWN_FIX.md`.

**Markdown Rendering is complete.** [markdown](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/markdown), fetched 2026-09-21. All three snippets compile and run as published. Two small notes: the page defines no CSS for its example classes `my-link` and `my-heading`, so the first example has no visible effect. And destructuring `node` in order to drop it, as the page advises, triggers `@typescript-eslint/no-unused-vars` warnings. Both are kept as published.

**Six pages replace their backend section with `setup skipped`** — frontend-tools, tool-based, human-in-the-loop, agent-readonly, programmatic-control, subagents. (Agent Config gained a real Strands backend section on 2026-10-08.)

**The Quickstart's runtime route exports two verbs; Rich Threads needs four.** The published block ends with `export const GET = handler;` and `export const POST = handler;`. Next.js answers any unexported verb with a 405, and the threads client issues four — GET and POST to list and connect, **PATCH** to rename and archive, **DELETE** to delete (verified against `@copilotkit/core` 1.69.0; it never issues PUT). So a runtime built to the Quickstart serves chat perfectly and 405s every thread mutation — `DELETE /api/copilotkit/threads/<id> 405` followed by `unhandledRejection: Error: Request failed: 405`. Because chat is unaffected the runtime looks healthy. Neither the Quickstart, the Threads Drawer page nor Headless Threads mentions the extra exports. This repo exports PATCH and DELETE on all three runtimes; the Voice page's published route is closer (POST/GET/PUT/DELETE) but still omits PATCH.

**The fixed-schema page says Strands generates the schema; the published code loads it from a file.** Re-fetched 2026-08-31 — the page has been restructured since this repo's first sync, and its five `snippet skipped` markers are now one. The surviving one is the step that matters, `region 'backend-render-operations'`, sitting where the tool that emits the surface should be. Its prose says that for Mastra and Strands "the agent tool runs a *secondary* LLM call… the schema is built on the fly" — but the published `buildA2uiFixedSchemaAgent` does no such thing: it `readFileSync`s a static `flight_schema.json` at module load and passes it to `updateComponents` unchanged, with no secondary LLM call anywhere. Two descriptions of the same demo that cannot both be right. This repo implements the published code.

**Agent Config now documents how `useAgentContext` reaches a Strands agent — and its helper is missing.** Since `@ag-ui/aws-strands` 0.3.0, the adapter adds `RunAgentInput.context[]` to the latest user turn for each model call, then removes it. The page's `withStateContext` (from `src/agent/state.ts`) extends that context with UI-owned state, and its `ShowcaseStrandsAgent` subclass applies it in `run()`. `withStateContext` calls `formatPreferencesBlock`, which is published nowhere, including the demo Code tab. Those lines are commented out in `backend/src/agents/agent-config-agent.ts`. The page also advises against `stateContextBuilder` for context, because its output is stored in message history. The prose relay's description ("Agent response preferences") is shorter than the one the demo runs. The demo's version also tells the model to apply the values, and nothing else in the agent does.

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
- [a2ui/dynamic-schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/dynamic-schema) shows `from ag_ui_langgraph import get_a2ui_tools` and says tool calls "stream through LangGraph".
- [a2ui/fixed-schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/fixed-schema) refers to "the Python SDK's `a2ui.render`" and `src/agents/a2ui_fixed.py`.
- [headless-ui](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/headless-ui) logs `[langgraph-python:headless-simple]`.
- [human-in-the-loop](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop) devotes half its length to `useInterrupt`, whose own table names LangGraph as the backend surface.

**Wrong language / tree in the TypeScript pages:**
- [quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own) links its next-steps cards to `/aws-strands/...`, a prefix that does not exist. *(Two neighbouring defects here were fixed upstream at the 2026-08-26 re-sync: the CLI step now passes `--framework aws-strands-ts` instead of telling you to pick Python, and Prerequisites now qualifies Python 3.12+ with "Python agents only".)*
- Both Shared State pages link to `/langgraph/quickstart` and embed the `/aws-strands/` Python feature viewer.
- [your-components/interactive](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/interactive) passes `framework="aws-strands"`.

**Behaviour the docs get wrong:**
- **The Shared State overview has nothing to run on Strands.** [shared-state](https://docs.copilotkit.ai/strands-typescript/shared-state), fetched 2026-11-11. The backend setup and the streaming snippet are skipped for Strands TypeScript. The frontend snippets are fragments of an unprinted page, the `set_notes` tool that fills the notes card is never shown, and no form calls the printed `handlePreferencesChange`. `/shared-state` runs the fragments inside labelled glue on this repo's existing state-mirror agent, and the card stays empty.
- **Audio attachments are discarded.** [multimodal-attachments](https://docs.copilotkit.ai/strands-typescript/multimodal-attachments) lists Audio with a player preview and "Model-dependent" support; `convertAguiContentToStrands` documents `AudioInputContent` as "skipped (Strands has no audio support)". It uploads, previews, sends, and vanishes with no error.
- **The read-only context middleware does not exist.** [agent-readonly](https://docs.copilotkit.ai/strands-typescript/shared-state/agent-readonly) credits a `CopilotKitMiddleware`. The adapter flattens `RunAgentInput.context[]` itself and passes it to `stateContextBuilder` as a third `extras` argument — undocumented anywhere.
- **The model does not exist.** [quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own) sets `modelId: "gpt-5.4"`; its own callout says GPT-4o.
- **Frontend tools work and nothing says why.** `createProxyTool` / `syncProxyTools`, per run. Google ADK's docs show `AGUIToolset()`; these show a placeholder.

---

**Components and surfaces (8 pages): the CopilotKit side is complete, the app around it is not.** [surfaces](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/surfaces), [catalogs](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/catalogs), [standard catalog](https://docs.copilotkit.ai/generative-ui/components/standard-catalog), [state and actions](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/state-and-actions), [theming](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/theming), [transports](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/transports), [markdown mode](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/markdown-mode), [from A2UI](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/from-a2ui), fetched 2026-11-02. Every catalog, hook and provider snippet runs as printed. What the pages use and never define is written in under `frontend/src/app/generative-ui/components/_shared/scaffolding.tsx`: `Product`, `ProductRow`, `Cart`/`addItem`, `Hero`, `Panel`, `cartUI`, `Airport`, `Arrow`, `productSchema`. Some snippets also lack imports; those lines are added and marked. ProductCard is told to copy values "from a product of a tool result", but no page publishes such a tool, so the `genui` agent carries a repo-authored `search_products`. No page shows a Strands backend for these pages: the agent is Quickstart-shaped, and the adapter hands the run's `render_ui` tool and context entries to the model. The standard catalog page has no `strands-typescript` URL. The from-A2UI support matrix excludes agent tools built with `@ag-ui/a2ui-toolkit` 0.0.5, the toolkit this repo's published fixed-schema A2UI agent uses. Markdown mode's `sendContext: false` path shows only a Python reader of `forwarded_props`.

**MCP Apps and Open Generative UI run their published routes against an unpublished agent.** [mcp-apps](https://docs.copilotkit.ai/strands-typescript/generative-ui/mcp-apps), [open-generative-ui](https://docs.copilotkit.ai/strands-typescript/generative-ui/open-generative-ui). Both runtime routes are the demo Code tab's, verbatim, and both point `HttpAgent` at `${AGENT_URL}/`, where the showcase serves `buildShowcaseAgent` (unpublished `SYSTEM_PROMPT`, `SHOWCASE_TOOLS`). The backend mounts a Quickstart-shaped stand-in at `/` (`showcase-standin`). `./chat` is unpublished on both pages and is replaced by a plain `CopilotChat`. On Open Generative UI, `./design-skill` and `./suggestions` are unpublished and are commented out, so the minimal demo runs on the default design skill. The MCP demo's URL `https://mcp.excalidraw.com` answers with a 308 redirect; the page's Intelligence snippet uses `/mcp`.

**useInterrupt and Headless Interrupts now publish a native Strands interrupt.** [useInterrupt](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop/useInterrupt), [headless](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop/headless). This contradicts the older Human-in-the-Loop page, which calls `useInterrupt` LangGraph-only. `interrupt-agent.ts` runs verbatim apart from its `./model-factory` import. The time picker imports unpublished shadcn `./card`, `./button` and `./badge`; minimal labelled versions are supplied, as is `generateFallbackSlots`. `useGenUiInterruptSuggestions` is commented out. The page names `@ag-ui/aws-strands` 0.2.3; this repo runs 1.0.1. The published route maps both demo names to `/interrupt/`, and those two entries are added to `/api/copilotkit`.

**WebMCP calls a function it never defines.** [webmcp](https://docs.copilotkit.ai/strands-typescript/webmcp). Both snippets call `searchOrders(status)`; a four-order stub stands in. The core-only snippet imports `@copilotkit/core`, which is now a direct dependency.

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
│           ├── chat-agents.ts            22 Quickstart-shaped agents (one has backend tools)
│           ├── state-agents.ts           the Shared State pages' StrandsAgentConfig
│           ├── agent-config-agent.ts     Agent Config's withStateContext + ShowcaseStrandsAgent
│           ├── a2ui-dynamic-agent.ts     agent.ts's one self-contained factory
│           ├── byoc-hashbrown-agent.ts   agent.ts's Hashbrown factory + a harness-authored prompt
│           ├── interrupt-agent.ts        the useInterrupt pages' native-interrupt agent (verbatim)
│           ├── genui-tools.ts            repo-authored search_products for the Components pages
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
            ├── api/copilotkit-agent-config/           Agent Config demo's single-route runtime
            ├── api/copilotkit-voice/[[...slug]]/      v2 handler + TranscriptionService
            ├── api/copilotkit-genui/                  Components and surfaces (genui agent)
            ├── api/copilotkit-genui-transports/       the Transports page's generativeUI: true runtime
            ├── api/copilotkit-mcp-apps/route.ts       MCP Apps route, verbatim
            ├── api/copilotkit-ogui/route.ts           Open Generative UI route, verbatim
            ├── <route>/page.tsx                       notes, source, Try it, doc gaps
            └── <route>/demo-chat/page.tsx             the live surface, chrome-free
```

Each route is two files: a notes page that renders its own implementation from disk via `lib/source.ts`, and a `demo-chat` surface that renders full-bleed for screen recording. The code you read on a route is the code that runs, read at render time — never a re-typed copy.

---

## 12. References

Grouped as the doc sidebar groups them. Off-sidebar pages (reachable by URL only) are marked.

**Get Started** · [Introduction](https://docs.copilotkit.ai/strands-typescript) · [Quickstart](https://docs.copilotkit.ai/strands-typescript/quickstart?agent=bring-your-own)

**Build Chat UIs — Rich Threads** · [Threads Drawer](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/copilot-threads-drawer) · [Headless Threads](https://docs.copilotkit.ai/strands-typescript/headless-threads) · [Thread & History Lifecycle](https://docs.copilotkit.ai/strands-typescript/threads-lifecycle) · [Synchronize Thread History](https://docs.copilotkit.ai/strands-typescript/threads-import)

**Build Chat UIs — Custom Look and Feel** · [Markdown Rendering](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/markdown) · [Multimodal Attachments](https://docs.copilotkit.ai/strands-typescript/multimodal-attachments) · [Voice](https://docs.copilotkit.ai/strands-typescript/voice)

**Build Generative UI — Controlled** · [Components as Tools](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-based) · [Tool Call Rendering](https://docs.copilotkit.ai/strands-typescript/generative-ui/tool-rendering)

**Build Generative UI — Declarative** · [A2UI Dynamic Schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/dynamic-schema) · [A2UI Fixed Schema](https://docs.copilotkit.ai/strands-typescript/generative-ui/a2ui/fixed-schema) · [JSON Render](https://docs.copilotkit.ai/strands-typescript/generative-ui/json-render) · [Hashbrown](https://docs.copilotkit.ai/strands-typescript/generative-ui/hashbrown)

**Build Generative UI — Components and surfaces** · [Surfaces](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/surfaces) · [Catalogs](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/catalogs) · [Standard catalog](https://docs.copilotkit.ai/generative-ui/components/standard-catalog) · [State and actions](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/state-and-actions) · [Theming](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/theming) · [Transports](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/transports) · [Markdown mode](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/markdown-mode) · [Adopt from A2UI](https://docs.copilotkit.ai/strands-typescript/generative-ui/components/from-a2ui)

**Build Generative UI — Open-ended** · [MCP Apps](https://docs.copilotkit.ai/strands-typescript/generative-ui/mcp-apps) · [Open Generative UI](https://docs.copilotkit.ai/strands-typescript/generative-ui/open-generative-ui)

**Add Agent Powers** · [Frontend Tools](https://docs.copilotkit.ai/strands-typescript/frontend-tools) · [Human-in-the-Loop](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop) · [Governed Actions](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop/governed-actions) · [Pausing the Agent (useInterrupt)](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop/useInterrupt) · [Headless Interrupts](https://docs.copilotkit.ai/strands-typescript/human-in-the-loop/headless) · [WebMCP](https://docs.copilotkit.ai/strands-typescript/webmcp) · [Sub-Agents](https://docs.copilotkit.ai/strands-typescript/multi-agent/subagents) · [Agent Config](https://docs.copilotkit.ai/strands-typescript/agent-config) · [Programmatic Control](https://docs.copilotkit.ai/strands-typescript/programmatic-control)

**Runtime** · [Copilot Runtime](https://docs.copilotkit.ai/strands-typescript/copilot-runtime) · [AG-UI](https://docs.copilotkit.ai/strands-typescript/ag-ui)

**Not in the sidebar** · [CopilotChat](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat) · [CopilotSidebar](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/sidebar) · [CopilotPopup](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/popup) · [Chat controls](https://docs.copilotkit.ai/strands-typescript/prebuilt-components/chat-controls) · [CSS](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/css) · [Slots](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/slots) · [Headless UI](https://docs.copilotkit.ai/strands-typescript/custom-look-and-feel/headless-ui) · [Display-only](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/display-only) · [Interactive](https://docs.copilotkit.ai/strands-typescript/generative-ui/your-components/interactive)

**Shared State** · [Shared State](https://docs.copilotkit.ai/strands-typescript/shared-state) · [Render state in your app](https://docs.copilotkit.ai/strands-typescript/shared-state/rendering-in-app) · [Agent read-only context](https://docs.copilotkit.ai/strands-typescript/shared-state/agent-readonly) · [Reading agent state](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-read) · [Writing agent state](https://docs.copilotkit.ai/strands-typescript/shared-state/in-app-agent-write)

**Carried over from Google ADK, on request** · [Programmatic Control](https://docs.copilotkit.ai/google-adk/programmatic-control) · [Render state in your app](https://docs.copilotkit.ai/google-adk/shared-state/rendering-in-app)
