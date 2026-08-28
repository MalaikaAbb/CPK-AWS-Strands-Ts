# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-28

### 11:06 UTC — 5 pages, highest severity low

**Low — Frontend Tools**

`/strands-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

12 prose lines changed.

````diff
- <Callout type="info" title="See this in Inspector">
- Open Inspector on localhost. Go to **Inspect**, then **Event Snippets**.
- You can compile a tool call, reasoning, text, or activity, run it on the live
- agent, and save it. Saved snippets are grouped by recipe. On localhost chat,
- **Save as snippet** uses the recipe for the thing you click and fills the form.
- On a tool call, generative UI, or A2UI, the bookmark sits to the right of the
- block (or to the left if there is no room on the right).
- Run of a `generateSandboxedUi` tool call paints the sandbox UI in chat.
````

**Info — Headless Threads**

`/strands-typescript/headless-threads` · route `/headless-threads`

Now tracked for the first time.

**Info — Threads Drawer**

`/strands-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer`

Now tracked for the first time.

**Info — Synchronize Thread History**

`/strands-typescript/threads-import` · route `/threads-import`

Now tracked for the first time.

**Info — Thread & History Lifecycle**

`/strands-typescript/threads-lifecycle` · route `/threads-lifecycle`

Now tracked for the first time.

---

## 2026-08-26

### 09:41 UTC — 14 pages, highest severity high

**High — Agent Config**

`/strands-typescript/agent-config` · route `/agent-config` · under “When to use this”

16 code lines, 1 heading, 20 prose lines changed. The number of fenced code blocks changed.

````diff
- <WhenFrameworkHas flag="agent_config_pattern" equals="shared-state">
+ 
- </WhenFrameworkHas>
- <WhenFrameworkHas flag="agent_config_pattern" equals="runtime-properties">
- ## How it works
- The runtime owns the agent in-process, so config travels through frontend
- runtime properties rather than agent state. There's no separate backend service
- to push state into: the typed object becomes the input to the agent factory
````

**High — Copilot Runtime**

`/strands-typescript/copilot-runtime` · route `/copilot-runtime` · under “Setting Up the Runtime”

41 code lines, 2 headings, 15 prose lines changed. The number of fenced code blocks changed.

````diff
- The runtime is a lightweight server endpoint that you add to your backend. Here's a minimal example using Next.js:
+ The runtime is a lightweight server endpoint that you add to your backend:
- ```ts title="app/api/copilotkit/route.ts"
+ ```npm
+ npm install @copilotkit/runtime
+ ```
+ 
+ Here's a minimal example using Next.js. `createCopilotRuntimeHandler` returns a
````

**High — A2UI · Fixed Schema**

`/strands-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Compositional schemas”

6 code lines, 5 headings, 113 prose lines changed. The number of fenced code blocks changed.

````diff
- renderer props are typed as their resolved values (plain `z.string()`,
- not a path-or-literal union).
+ your renderer receives the resolved value and never sees the path — but
+ the *definition* still has to declare that prop as a literal-or-binding
+ union, because that union is the only signal the binder has that the
+ prop is bindable. See [Declare the component
+ definitions](#declare-the-component-definitions).
+ ### Install the renderer package
````

**High — Tool Call Rendering**

`/strands-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “What is this?”

105 code lines, 16 prose lines changed. The number of fenced code blocks changed.

````diff
- **Free course:** See this pattern built end-to-end in [Build Interactive Agents with Generative UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/) — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
+ **Free course:** See this pattern built end-to-end in [Build Interactive
+ Agents with Generative
+ UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/)
+ — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the
+ full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
- ```typescript
- // src/app/demos/tool-rendering/page.tsx
````

**High — Sub-Agents**

`/strands-typescript/multi-agent/subagents` · route `/multi-agent/subagents` · under “Setting up sub-agents”

87 code lines, 2 prose lines changed. The number of fenced code blocks changed.

````diff
- <!-- snippet skipped: region 'subagent-setup' missing in strands-typescript::subagents -->
+ ```typescript
+ // src/agent/tools.ts
+ const SUBAGENT_SYSTEM_PROMPTS: Record<string, string> = {
+ research_agent:
+ "You are a research sub-agent. Given a topic, produce a concise bulleted list of 3-5 key facts. No preamble, no closing.",
+ writing_agent:
+ "You are a writing sub-agent. Given a brief and optional source facts, produce a polished 1-paragraph draft. Be clear and concrete. No preamble.",
````

**High — Programmatic Control**

`/strands-typescript/programmatic-control` · route `/programmatic-control` · under “What is this?”

87 code lines, 2 headings, 38 prose lines changed. The number of fenced code blocks changed.

````diff
- Every example on this page is pulled from two live cells:
- `headless-complete` (full chat surface, shown here for the message-send
- path) and `interrupt-headless` (button-driven interrupt resolver, shown
- here for the subscribe + resume path).
+ The send-and-stop example below is intentionally self-contained. The
+ later subscription and interrupt examples are pulled from the live
+ `interrupt-headless` cell.
- The message-send path in `headless-complete` is the canonical pattern:
````

**High — Quickstart**

`/strands-typescript/quickstart` · route `/quickstart` · under “Quickstart”

54 code lines, 1 heading, 37 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
- body="Add persistent threads and the inspector with the Enterprise Intelligence Platform."
+ body="Add persistent threads and the inspector with CopilotKit Intelligence."
- - Python 3.12+
+ - Python 3.12+ (Python agents only)
- <SignupLink surface="docs_aws_strands_quickstart_step1">Sign up for a free developer account</SignupLink> on our Enterprise Intelligence Platform to get a license key. You'll use it later to enable persistent threads and the inspector.
+ <SignupLink surface="docs_aws_strands_quickstart_step1">Sign up for a free developer account</SignupLink> for CopilotKit Intelligence to get a license key. You'll use it later to enable persistent threads and the inspector.
- ```bash
````

**High — Render state in your app**

`/strands-typescript/shared-state/rendering-in-app` · route `/shared-state/rendering-in-app` · under “The pattern” · in a `tsx` block

29 code lines, 6 prose lines changed.

````diff
+ import { useEffect } from "react";
+ const INITIAL_CANVAS_STATE: CanvasState = {
+ title: "Project launch",
+ items: [
+ { id: "research", label: "Research user needs", done: true },
+ { id: "prototype", label: "Build a prototype", done: false },
+ ],
+ };
````

**Low — AG-UI**

`/strands-typescript/ag-ui` · route `/ag-ui` · under “The proxy pattern”

2 prose lines changed.

````diff
- routing, and CopilotKit Enterprise Intelligence without changing how the
+ routing, and CopilotKit Intelligence without changing how the
````

**Low — Frontend Tools**

`/strands-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

21 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/strands-typescript/inspector).
````

**Low — Human in the Loop**

`/strands-typescript/human-in-the-loop` · route `/human-in-the-loop` · under “HITL Overview”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/strands-typescript/inspector).
````

**Low — Open, close, and feedback**

`/strands-typescript/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Capture message feedback (thumbs up / down)”

11 prose lines changed.

````diff
- slot**. The buttons only render when a handler is provided:
+ When the slot is rendered through `CopilotChatMessageView`, a live assistant
+ message created by a direct AG-UI `TEXT_MESSAGE_START` can also include that
+ event's opaque `rawEvent` value. The join happens when the thumbs callback runs;
+ canonical messages and future run input stay unchanged. Chunk, snapshot,
+ persisted, legacy, and direct `CopilotChatAssistantMessage` paths don't provide
+ this callback metadata.
+ 
````

**Low — Agent Read-Only Context**

`/strands-typescript/shared-state/agent-readonly` · route `/shared-state/agent-readonly` · under “Agent Read-Only Context”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Context**.
+ The values you publish with `useAgentContext` appear here.
+ 
+ More detail: [Inspector](/strands-typescript/inspector).
````

**Low — Voice**

`/strands-typescript/voice` · route `/voice` · under “Next.js API route”

4 prose lines changed.

````diff
- <WhenFrameworkHas flag="voice_backend_pattern" equals="adk-fastapi-agent-path">
- For the Google ADK showcase, agent runs take one more hop: this Next.js route registers the `voice-demo` agent with an `HttpAgent` pointed at `${AGENT_URL}/voice`. The Python `agent_server.py` mounts registered ADK agents with `add_adk_fastapi_endpoint(app, ..., path=f"/{agent_name}")`, so the browser talks to `/api/copilotkit-voice` while the Next.js runtime forwards voice-demo agent runs to the backend `/voice` endpoint.
- </WhenFrameworkHas>
+ 
````

---

---

## 2026-08-17

### 12:33 UTC — 1 page, highest severity low

**Low — Voice** · _local snapshot edit, not an upstream change_

`/strands-typescript/voice` · route `/voice` · under “Driving the demo without a mic”

2 prose lines changed.

````diff
+ For Playwright runs, screenshots, or any flow where prompting for mic permissions is awkward, ship a button that emits a canned sample phrase through an `onTranscribed` callback, bypassing the transcription endpoint entirely:
+ 
````
