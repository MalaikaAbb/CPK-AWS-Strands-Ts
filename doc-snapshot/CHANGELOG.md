# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

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

## 2026-10-05

### 08:25 UTC — 1 page, highest severity medium

**Medium — Copilot Runtime**

`/strands-typescript/copilot-runtime` · route `/copilot-runtime` · under “Runtime languages”

1 heading, 24 prose lines changed.

````diff
+ ## Runtime languages
+ 
+ **TypeScript is the default and most fully featured runtime. It is the only runtime that can run without CopilotKit Intelligence.** Use it for an open-source setup, or connect it to Intelligence when you need its services.
+ 
+ Python, Go, Ruby, and C#/.NET runtimes require an Intelligence project and server-side API key. They work with both [cloud-hosted](/strands-typescript/intelligence/managed-intelligence-platform) and [self-hosted](/strands-typescript/intelligence/self-hosting) Intelligence; they do not provide an in-memory or SQLite runner.
+ 
+ | Language | Host | Without Intelligence |
+ | --- | --- | --- |
````

---

---

## 2026-10-02

### 05:21 UTC — 2 pages, highest severity high

**High — Synchronize Thread History**

`/strands-typescript/threads-import` · route `/threads-import` · under “Include earlier conversations (optional)”

3 code lines, 15 prose lines changed. The number of fenced code blocks changed.

````diff
- If you also want users to reopen history recorded before Intelligence was connected, copy supported history into Intelligence using the steps below. The importer currently supports Google ADK and LangGraph stores. It copies historical content; it does not enable live delivery, recover past execution, or establish ongoing database replication.
+ If you also want users to reopen history recorded before Intelligence was connected, copy supported history into Intelligence using the steps below. The importer currently supports Google ADK, LangGraph, and Mastra stores. It copies historical content; it does not enable live delivery, recover past execution, or establish ongoing database replication.
+ | Mastra | [Add AG-UI streams to Mastra conversations](/mastra/threads-import) | Saved conversations from a local LibSQL database or a Mastra server. |
+ - saved agent state when supported by the source
- It does not import agent state snapshots, framework transport noise, LangSmith traces, or unsupported source stores.
+ It does not import framework transport noise, LangSmith traces, or unsupported source stores. What is available depends on what your source saved; see your framework’s import guide for details.
- <Tabs groupId="thread_import_source" items={['ADK', 'LangGraph']}>
+ <Tabs groupId="thread_import_source" items={['ADK', 'LangGraph', 'Mastra']}>
````

**Low — AG-UI**

`/strands-typescript/ag-ui` · route `/ag-ui` · under “How agents slot into the runtime”

3 prose lines changed.

````diff
+ To write the custom implementation yourself, and keep its own fields through
+ the clone in step 2, see [Write your own AG-UI agent](/strands-typescript/backend/custom-ag-ui-agent).
+ 
````

---

---
