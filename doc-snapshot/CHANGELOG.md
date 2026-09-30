# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-30

### 09:07 UTC — 6 pages, highest severity high

**High — Quickstart**

`/strands-typescript/quickstart` · route `/quickstart` · under “Prerequisites”

44 code lines, 41 prose lines changed. The number of fenced code blocks changed.

````diff
- - An OpenAI API key
+ - An OpenAI or Anthropic API key
- <Callout type="info" title="What about other models?">
- The starter template is configured to use OpenAI's GPT-4o by default, but you can modify it to use any language model supported by Strands.
+ <ApiKeyHint provider="openai" />
+ 
+ <Callout type="info" title="Using Anthropic instead">
+ Add `ANTHROPIC_API_KEY` to `agent/.env`, then swap the model:
````

**Medium — Synchronize Thread History**

`/strands-typescript/threads-import` · route `/threads-import` · under “Import & Synchronize Thread History”

5 headings, 23 prose lines changed.

````diff
- # Import & Synchronize Thread History
+ # Add AG-UI Streams to Existing Threads
- > Import historical conversations into CopilotKit Intelligence, then keep future CopilotKit runs synchronized with Rich Threads.
+ > Add Intelligence’s AG-UI streams to your existing agent conversations, with optional historical import for supported stores.
- ## What is this?
+ <span id="what-is-this" />
- Import brings existing conversations into CopilotKit Intelligence as Rich Threads while you keep the native storage or analytics you already use. Import supported history once, then continue running those conversations through CopilotKit so users can resume them through the same thread UI as new conversations.
+ ## Add Intelligence to your existing app
````

**Medium — Thread & History Lifecycle**

`/strands-typescript/threads-lifecycle` · route `/threads-lifecycle` · under “The lifecycle at a glance”

2 headings, 10 prose lines changed.

````diff
- 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [Threads & Persistence Architecture](/strands-typescript/intelligence/threads-explained) for the full server-side model.
+ 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [AG-UI Streams & Framework Threads](/strands-typescript/intelligence/threads-explained) for the full server-side model.
- ## Scope Rich Threads to the signed-in user
+ <span id="scope-rich-threads-to-the-signed-in-user" />
+ ## Scope AG-UI Streams to the signed-in user
+ 
- verified application user to Rich Threads.
+ verified application user to threads.
````

**Low — Headless Threads**

`/strands-typescript/headless-threads` · route `/headless-threads` · under “Headless Threads”

22 prose lines changed.

````diff
+ Intelligence’s AG-UI streams power the history and delivery behind this custom UI. Use `useThreads` to list and manage conversations, and pass their `threadId` to your chat.
+ 
- CopilotKit Rich Threads enable persistent, resumable multi-turn conversations. The `useThreads` hook lists, creates, renames, archives, and deletes CopilotKit Intelligence threads with realtime synchronization via WebSocket. Threads work with any agent framework — CopilotKit Intelligence stores conversation history server-side, so users can close their browser and pick up where they left off. It does not list or mutate native LangGraph, ADK, or other framework stores unless your backend explicitly bridges those systems. Thread metadata updates (renames, archives, new threads) appear on connected clients without polling.
+ The `useThreads` hook lists, creates, renames, archives, and deletes CopilotKit Intelligence threads with realtime synchronization via WebSocket. Threads work with any agent framework — CopilotKit Intelligence stores conversation history server-side, so users can close their browser and pick up where they left off. It does not list or mutate native LangGraph, ADK, or other framework stores unless your backend explicitly bridges those systems. Thread metadata updates (renames, archives, new threads) appear on connected clients without polling.
- [scope Rich Threads to the signed-in user](/strands-typescript/threads-lifecycle#scope-rich-threads-to-the-signed-in-user)
+ [scope AG-UI Streams to the signed-in user](/strands-typescript/threads-lifecycle#scope-rich-threads-to-the-signed-in-user)
- <Callout type="info" title="Migrating existing history?">
- Threads capture new CopilotKit conversations once your app is connected to
````

**Low — Threads Drawer**

`/strands-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “When should I use this?”

4 prose lines changed.

````diff
- [scope Rich Threads to the signed-in user](/strands-typescript/threads-lifecycle#scope-rich-threads-to-the-signed-in-user).
+ [scope AG-UI Streams to the signed-in user](/strands-typescript/threads-lifecycle#scope-rich-threads-to-the-signed-in-user).
- - [Rich Threads overview](/strands-typescript/threads): compare thread UI and deployment paths
+ - [AG-UI Streams overview](/strands-typescript/threads): compare thread UI and deployment paths
````

**Low — Voice**

`/strands-typescript/voice` · route `/voice` · under “Custom transcription backends”

2 prose lines changed.

````diff
- A useful pattern is wrapping your service in a guard that returns a clean 4xx when credentials aren't configured, instead of an opaque 5xx from the underlying SDK:
+ A useful pattern is constructing the service only when its dedicated credential is configured. Without it, omit `transcriptionService`; the runtime reports the capability as disabled, hides the mic, and returns the documented 503 if `/transcribe` is called directly:
````

---

## 2026-09-24

### 11:34 UTC — 3 pages, highest severity high

**High — A2UI · Fixed Schema**

`/strands-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Fixed Schema A2UI”

25 code lines, 3 headings, 41 prose lines changed. The number of fenced code blocks changed.

````diff
- - **Schema-loading** (langgraph-python, langgraph-typescript,
- langgraph-fastapi, llamaindex, crewai-crews, pydantic-ai,
- ms-agent-python, google-adk), the schema is saved as a `.json`
- file next to the agent and loaded once at startup.
+ - **Schema-loading** (including Strands TypeScript), the schema is saved
+ as a `.json` file next to the agent and loaded once at startup.
- - **LLM-driven** (mastra, strands), the agent runs a secondary LLM
- call to produce the operations container per-request. The catalog
````

**Low — Frontend Tools**

`/strands-typescript/frontend-tools` · route `/frontend-tools` · under “Nothing to wire on the agent”

8 prose lines changed.

````diff
- declares none of its own. A tool registered with `useFrontendTool`
- reaches the model by name, and the browser executes the call.
+ declares none of its own. Frontend-registered tools reach the model by
+ name, and the browser handles their calls.
- a native tool with a proxy. Keep the `useFrontendTool` name distinct from
- every tool in `tools`.
+ a native tool with a proxy. Keep frontend tool names distinct from every
+ tool in `tools`.
````

**Low — Components as Tools**

`/strands-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Nothing to wire on the agent”

8 prose lines changed.

````diff
- declares none of its own. A tool registered with `useFrontendTool`
- reaches the model by name, and the browser executes the call.
+ declares none of its own. Frontend-registered tools reach the model by
+ name, and the browser handles their calls.
- a native tool with a proxy. Keep the `useFrontendTool` name distinct from
- every tool in `tools`.
+ a native tool with a proxy. Keep frontend tool names distinct from every
+ tool in `tools`.
````

---

---

## 2026-09-23

### 12:15 UTC — 8 pages, highest severity medium

**Medium — Headless UI**

`/strands-typescript/custom-look-and-feel/headless-ui` · route `/custom-look-and-feel/headless-ui` · under “Fully Headless UI”

2 headings changed.

````diff
- # Fully Headless UI
+ # Headless UI
````

**Low — Frontend Tools**

`/strands-typescript/frontend-tools` · route `/frontend-tools` · under “Nothing to wire on the agent”

4 prose lines changed.

````diff
- declares none of its own. A component registered with `useComponent`
+ declares none of its own. A tool registered with `useFrontendTool`
- a native tool with a proxy. Keep the `useComponent` name distinct from
+ a native tool with a proxy. Keep the `useFrontendTool` name distinct from
````

**Low — Components as Tools**

`/strands-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Nothing to wire on the agent”

4 prose lines changed.

````diff
- declares none of its own. A component registered with `useComponent`
+ declares none of its own. A tool registered with `useFrontendTool`
- a native tool with a proxy. Keep the `useComponent` name distinct from
+ a native tool with a proxy. Keep the `useFrontendTool` name distinct from
````

**Low — Headless Threads**

`/strands-typescript/headless-threads` · route `/headless-threads` · under “Configure your Runtime with CopilotKit Intelligence”

6 prose lines changed.

````diff
- Your `CopilotRuntime` must be connected to CopilotKit Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/strands-typescript/intelligence/connect-your-runtime) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
+ Your `CopilotRuntime` must be connected to CopilotKit Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/strands-typescript/intelligence/quickstart) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
- Managed project setup does not issue `COPILOTKIT_LICENSE_TOKEN`. That
+ Cloud-hosted setup does not issue `COPILOTKIT_LICENSE_TOKEN`. That
- the managed project API key.
+ the cloud-hosted project API key.
````

**Low — Threads Drawer**

`/strands-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “When should I use this?”

14 prose lines changed.

````diff
- server-side). <SignupLink surface="docs_drawer">Start managed onboarding</SignupLink> to create or select a project.
+ server-side). <SignupLink surface="docs_drawer">Start cloud-hosted setup</SignupLink> to create or select a project.
- body="Connect a managed project to get persistent threads and realtime sync."
+ body="Connect a cloud-hosted project to get persistent threads and realtime sync."
- **Managed Intelligence.** The project-scoped `CPK_INTELLIGENCE_API_KEY` is the
+ **Cloud-hosted Intelligence.** The project-scoped `CPK_INTELLIGENCE_API_KEY` is the
- organization's subscription. Managed project setup does not issue
+ organization's subscription. Cloud-hosted setup does not issue
````

**Low — Quickstart**

`/strands-typescript/quickstart` · route `/quickstart` · under “Set up CopilotKit Intelligence”

4 prose lines changed.

````diff
- <SignupLink surface="docs_aws_strands_quickstart_step1">Sign in to managed Intelligence</SignupLink>. Managed setup uses a server-side project API key and does not issue `COPILOTKIT_LICENSE_TOKEN`. You will connect the app after you create it below.
+ <SignupLink surface="docs_aws_strands_quickstart_step1">Sign in to cloud-hosted Intelligence</SignupLink>. Cloud-hosted setup uses a server-side project API key and does not issue `COPILOTKIT_LICENSE_TOKEN`. You will connect the app after you create it below.
- [Connect your runtime to Intelligence](/strands-typescript/intelligence/connect-your-runtime) for the
+ [Connect your runtime to Intelligence](/strands-typescript/intelligence/quickstart) for the
````

**Low — Synchronize Thread History**

`/strands-typescript/threads-import` · route `/threads-import` · under “What is this?”

2 prose lines changed.

````diff
- Built-in import currently supports Google ADK and LangGraph, with more sources coming soon. You can keep LangSmith, LangGraph, or ADK storage and analytics in place. For future CopilotKit-mediated runs, CopilotKit Intelligence persists the Rich Thread event history. When your agent remains connected to a durable LangGraph checkpointer or durable ADK session service with appropriate retention, those future runs continue through the native persistence path as well.
+ Built-in import currently supports Google ADK and LangGraph, with more sources coming soon. You can keep LangSmith, LangGraph, or ADK storage and analytics in place. For future CopilotKit-mediated runs, CopilotKit Intelligence persists the thread event history. When your agent remains connected to a durable LangGraph checkpointer or durable ADK session service with appropriate retention, those future runs continue through the native persistence path as well.
````

**Low — Thread & History Lifecycle**

`/strands-typescript/threads-lifecycle` · route `/threads-lifecycle` · under “Scope Rich Threads to the signed-in user”

2 prose lines changed.

````diff
- [Connect your runtime to Intelligence](/strands-typescript/intelligence/connect-your-runtime) covers the
+ [Connect your runtime to Intelligence](/strands-typescript/intelligence/quickstart) covers the
````

---

---
