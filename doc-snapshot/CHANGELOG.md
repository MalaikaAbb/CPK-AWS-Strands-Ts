# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-11-03

### 16:06 UTC — 13 pages, highest severity none

**Info — Components · Standard catalog**

`/generative-ui/components/standard-catalog` · route `/generative-ui/components/standard-catalog`

Now tracked for the first time.

**Info — Components · Catalogs**

`/strands-typescript/generative-ui/components/catalogs` · route `/generative-ui/components/catalogs`

Now tracked for the first time.

**Info — Components · Adopt from A2UI**

`/strands-typescript/generative-ui/components/from-a2ui` · route `/generative-ui/components/from-a2ui`

Now tracked for the first time.

**Info — Components · Markdown mode**

`/strands-typescript/generative-ui/components/markdown-mode` · route `/generative-ui/components/markdown-mode`

Now tracked for the first time.

**Info — Components · State and actions**

`/strands-typescript/generative-ui/components/state-and-actions` · route `/generative-ui/components/state-and-actions`

Now tracked for the first time.

**Info — Components · Surfaces**

`/strands-typescript/generative-ui/components/surfaces` · route `/generative-ui/components/surfaces`

Now tracked for the first time.

**Info — Components · Theming**

`/strands-typescript/generative-ui/components/theming` · route `/generative-ui/components/theming`

Now tracked for the first time.

**Info — Components · Transports**

`/strands-typescript/generative-ui/components/transports` · route `/generative-ui/components/transports`

Now tracked for the first time.

**Info — MCP Apps**

`/strands-typescript/generative-ui/mcp-apps` · route `/generative-ui/mcp-apps`

Now tracked for the first time.

**Info — Open Generative UI**

`/strands-typescript/generative-ui/open-generative-ui` · route `/generative-ui/open-generative-ui`

Now tracked for the first time.

**Info — Headless Interrupts**

`/strands-typescript/human-in-the-loop/headless` · route `/human-in-the-loop/headless`

Now tracked for the first time.

**Info — Pausing the Agent (useInterrupt)**

`/strands-typescript/human-in-the-loop/useInterrupt` · route `/human-in-the-loop/useInterrupt`

Now tracked for the first time.

**Info — WebMCP**

`/strands-typescript/webmcp` · route `/webmcp`

Now tracked for the first time.

---

## 2026-10-29

### 20:26 UTC — 11 pages, highest severity high

**High — Agent Config**

`/strands-typescript/agent-config` · route `/agent-config` · under “Apply current state before running the adapter” · in a `typescript` block

2 code lines changed.

````diff
- export class ShowcaseStrandsAgent extends StrandsAgent {
+ export class ShowcaseStrandsAgent extends BoardStateStrandsAgent {
````

**High — Slots**

`/strands-typescript/custom-look-and-feel/slots` · route `/custom-look-and-feel/slots` · under “Tool calls”

23 code lines, 1 heading, 15 prose lines changed. The number of fenced code blocks changed.

````diff
+ ### Tool calls
+ 
+ The `assistantMessage` slot holds `toolCallsView`, which renders the tool calls
+ of one assistant message. Wrap the default `CopilotChatToolCallsView` to change
+ the container while keeping your registered tool renderers:
+ 
+ ```tsx title="page.tsx"
+ import {
````

**High — Hashbrown**

`/strands-typescript/generative-ui/hashbrown` · route `/generative-ui/hashbrown` · under “Hashbrown”

40 code lines, 2 headings, 7 prose lines changed. The number of fenced code blocks changed.

````diff
- > Bring your own component library. Have the agent stream structured output and let Hashbrown's progressive JSON parser render it as React components in real time.
+ > Stream a structured sales dashboard through Hashbrown's UI kit and progressive JSON parser.
+ ```typescript
+ // src/app/demos/declarative-hashbrown/page.tsx
+ "use client";
- You have a chat surface and you want the agent to draw a dashboard, not just describe one in prose. By the end of this guide, the agent will stream a structured output object, [`@hashbrownai/react`](https://www.npmjs.com/package/@hashbrownai/react)'s progressive JSON parser will hand each finished slice to your renderer as it arrives, and the user sees the dashboard fill in live.
+ import { CopilotKit } from "@copilotkit/react-core/v2";
+ import { HashBrownDashboard } from "./hashbrown-renderer";
````

**High — JSON Render**

`/strands-typescript/generative-ui/json-render` · route `/generative-ui/json-render` · under “JSON Render”

55 code lines, 2 headings, 10 prose lines changed. The number of fenced code blocks changed.

````diff
- > Bring your own component library. Have the agent emit a JSON spec and let json-render render it against a Zod-validated catalog of React components.
+ > Bring your own component library. Have the agent emit a JSON spec and render allowed component types through a typed React registry.
+ ```typescript
+ // src/app/demos/declarative-json-render/chat.tsx
+ "use client";
- You have a chat surface and you want the agent to draw a dashboard from a typed JSON spec. By the end of this guide, the agent will emit a `{ root, elements }` object, [`@json-render/react`](https://www.npmjs.com/package/@json-render/react) will validate it against a Zod-described catalog, and the user sees the dashboard render as a single React tree.
+ import type { CopilotChatAssistantMessage } from "@copilotkit/react-core/v2";
+ import { CopilotChat } from "@copilotkit/react-core/v2";
````

**High — Tool Call Rendering**

`/strands-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “Default tool rendering (zero-config)”

15 code lines, 1 heading, 35 prose lines changed. The number of fenced code blocks changed.

````diff
- any UI.
+ any UI. Calls the agent makes in a row are grouped into one card; see
+ [Grouping tool calls](#grouping-tool-calls).
+ 
+ ## Grouping tool calls
+ 
+ Agents often call several tools in a row. By default, CopilotKit collapses
+ each run of calls drawn by the built-in card from `useDefaultRenderTool()` into
````

**High — Sub-Agents**

`/strands-typescript/multi-agent/subagents` · route `/multi-agent/subagents` · under “Sub-Agents” · in a `typescript` block

30 code lines changed.

````diff
+ /** Republish authoritative reads so a reconnect can rebuild an empty board. */
+ export function salesStateFromResult(
+ ctx: Pick<ToolResultContext, "resultData">,
+ ): StatePayload {
+ const result = ctx.resultData;
+ // Parsed native records may carry arbitrary metadata, including "text".
+ // Only transport text blocks should pass through flattenResult.
+ const nativeList =
````

**High — Threads Drawer**

`/strands-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “Add your own "New conversation" button”

41 code lines, 1 heading, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Add your own "New conversation" button
+ 
+ The Drawer has its own "New Conversation" row. Your app can also keep its own
+ button, for example in a toolbar or a page header. To start a new conversation
+ from that button, call `startNewThread()` from
+ [`useCopilotChatConfiguration`](/reference/hooks/useCopilotChatConfiguration).
+ This is the same function the Drawer calls for its own row.
+ 
````

**High — Synchronize Thread History**

`/strands-typescript/threads-import` · route `/threads-import` · under “Add AG-UI Streams to Existing Threads”

1 code line, 7 headings, 32 prose lines changed. The number of fenced code blocks changed.

````diff
- # Add AG-UI Streams to Existing Threads
+ # Add AG-UI Streams to Strands Conversations
- 
- Add reconnection, catch-up, and delivery across devices to the conversations your agent already manages. Follow the [Intelligence quickstart](/strands-typescript/intelligence/quickstart) to connect your existing CopilotKit app and Runtime, then verify that a new conversation is saved. That setup enables AG-UI streams for runs through CopilotKit; importing old conversations is not required.
- 
- Your framework continues managing agent context and execution state. Keep your durable LangGraph checkpointer or durable ADK session service configured and keep the mapping between CopilotKit `threadId` values and native framework conversation identifiers stable. See [AG-UI Streams & Framework Threads](/strands-typescript/intelligence/threads-explained#how-threads-work-with-framework-storage) for the responsibilities of each layer.
+ Give users reconnection, catch-up, and delivery across devices around your Strands agent. Follow the [Intelligence quickstart](/strands-typescript/intelligence/quickstart) to connect your existing CopilotKit app and Runtime, then verify that a new conversation is saved. This enables AG-UI streams for runs through CopilotKit; no historical import is required.
- For a concrete example without historical import, see [keep an existing LangGraph conversation](/strands-typescript/intelligence/bring-your-own-thread-system#example-keep-an-existing-langgraph-conversation).
````

**Low — Copilot Runtime**

`/strands-typescript/copilot-runtime` · route `/copilot-runtime` · under “CopilotKit Intelligence”

4 prose lines changed.

````diff
- Features like [threads](/strands-typescript/threads) and the [inspector](/strands-typescript/inspector) are provided through the runtime and CopilotKit Intelligence. These give you conversation persistence and debugging capabilities out of the box.
+ Features like [threads](/strands-typescript/AG-UI-Streams) and the [inspector](/strands-typescript/inspector) are provided through the runtime and CopilotKit Intelligence. These give you conversation persistence and debugging capabilities out of the box.
- 2. **Many ecosystem features won't work.** The AG-UI protocol supports a middleware layer designed to run on the backend. Many features in the CopilotKit ecosystem depend on this server-side middleware. Without the runtime, these features — including [threads](/strands-typescript/threads) and other capabilities — will not be available.
+ 2. **Many ecosystem features won't work.** The AG-UI protocol supports a middleware layer designed to run on the backend. Many features in the CopilotKit ecosystem depend on this server-side middleware. Without the runtime, these features — including [threads](/strands-typescript/AG-UI-Streams) and other capabilities — will not be available.
````

**Low — Open, close, and feedback**

`/strands-typescript/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Capture message feedback (thumbs up / down)”

12 prose lines changed.

````diff
- slot**. The buttons only render when a handler is provided:
+ slot**. Without Automatic Learning capture, the buttons only render when a
+ handler or a custom thumb slot is provided:
+ 
+ With [Automatic Learning capture](/strands-typescript/intelligence/capture-interactions#collect-reply-ratings)
+ on and a Trajectory started, the buttons appear without handlers in every chat
+ that renders messages with `CopilotChatMessageView` inside a
+ `CopilotChatConfigurationProvider`, as `CopilotChat`, `CopilotPopup`, and
````

**Low — Voice**

`/strands-typescript/voice` · route `/voice` · under “Custom transcription backends”

18 prose lines changed.

````diff
+ <Callout type="info" title="TranscriptionServiceOpenAI takes an openai 5.x client">
+ `@copilotkit/voice` depends on `openai` `^5.9.0`, and the `openai` option of
+ `TranscriptionServiceOpenAI` is typed against the copy of `openai` that
+ `@copilotkit/voice` resolves. Pass an `OpenAI` instance created from that same
+ installed copy. The `OpenAI` class has private (`#private`) members, so an
+ instance from another copy or another major version fails type-checking, even
+ when it looks the same.
+ 
````

---

---

## 2026-10-08

### 07:26 UTC — 5 pages, highest severity high

**High — Agent Config**

`/strands-typescript/agent-config` · route `/agent-config` · under “Turn frontend context into model input”

48 code lines, 4 headings, 17 prose lines changed.

````diff
- ### Turn frontend context into model input
+ ### Send application context with each run
- `useAgentContext` adds the typed configuration to the current AG-UI run.
- The Strands adapter does not add arbitrary context to the model prompt, so
- format the current run's context. This showcase composes the helper into
- its shared `stateContextBuilder`:
+ `useAgentContext` adds configuration to the current AG-UI request. The
+ Strands adapter exposes it during model calls without saving it as user
````

**High — Quickstart**

`/strands-typescript/quickstart` · route `/quickstart` · under “Install CopilotKit packages” · in a `npm` block

2 code lines changed.

````diff
- npm install @copilotkit/react-ui @copilotkit/react-core @copilotkit/runtime @ag-ui/client@1.0.1
+ npm install @copilotkit/react-ui @copilotkit/react-core @copilotkit/runtime @ag-ui/client@1.0.2
````

**High — Synchronize Thread History**

`/strands-typescript/threads-import` · route `/threads-import` · under “Add Intelligence to your existing app”

2 code lines, 18 prose lines changed.

````diff
+ For a concrete example without historical import, see [keep an existing LangGraph conversation](/strands-typescript/intelligence/bring-your-own-thread-system#example-keep-an-existing-langgraph-conversation).
+ 
- If you also want users to reopen history recorded before Intelligence was connected, copy supported history into Intelligence using the steps below. The importer currently supports Google ADK, LangGraph, and Mastra stores. It copies historical content; it does not enable live delivery, recover past execution, or establish ongoing database replication.
+ If you also want users to reopen history recorded before Intelligence was connected, copy supported history into Intelligence using the steps below. This guide covers Google ADK, LangGraph, and Mastra stores. It copies historical content; it does not enable live delivery, recover past execution, or establish ongoing database replication.
- By default, the importer targets the CopilotKit Intelligence project selected when you created the app with the CopilotKit CLI. If that is the project that should receive the imported threads, continue to the dry run.
+ Choose the Intelligence project that will receive the history. Its app-api URL and project-scoped runtime key select the destination. You will export those values before importing.
- To target a different cloud-hosted project, select it before the dry run:
+ For a CLI-created app, you can select a cloud-hosted project:
````

**Medium — Thread & History Lifecycle**

`/strands-typescript/threads-lifecycle` · route `/threads-lifecycle` · under “Future runs can remain durable in both places”

1 heading, 7 prose lines changed.

````diff
- After historical import, future conversations that run through CopilotKit are
- written to CopilotKit Intelligence as threads. If your LangGraph agent
+ Once Intelligence is connected, conversations that run through that runtime are
+ recorded automatically in Intelligence. Historical import is optional. If your LangGraph agent
+ 
+ ## Example: keep an existing LangGraph conversation
+ 
+ Follow [Bring your own thread system](/strands-typescript/intelligence/bring-your-own-thread-system#example-keep-an-existing-langgraph-conversation) for an example that keeps native persistence and continues the same conversation.
````

**Low — Programmatic Control**

`/strands-typescript/programmatic-control` · route `/programmatic-control` · under “What is this?”

4 prose lines changed.

````diff
- - `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` to drive interrupt resolution from arbitrary UI.
+ - `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, resume })` for standard AG-UI interrupts, or `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` for legacy `on_interrupt` custom events, to drive interrupt resolution from arbitrary UI.
- - **`agent.runAgent(options)`** — low-level method on the agent instance. Sends the request to the runtime but does **not** execute frontend tools or chain follow-ups. Reach for this only when you need direct control. (For the interrupt-resume case, use `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` — see the snippet below — so the subscriber lifecycle still wraps the resumed run.)
+ - **`agent.runAgent(options)`** — low-level method on the agent instance. Sends the request to the runtime but does **not** execute frontend tools or chain follow-ups. Reach for this only when you need direct control. (For the interrupt-resume case, use `copilotkit.runAgent({ agent, resume })` for standard AG-UI interrupts, or `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` for legacy `on_interrupt` custom events — the snippet below shows the legacy form — so the subscriber lifecycle still wraps the resumed run.)
````

---

---
