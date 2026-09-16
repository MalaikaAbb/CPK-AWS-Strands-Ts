# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-16

### 09:36 UTC — 2 pages, highest severity high

**High — Copilot Runtime**

`/strands-typescript/copilot-runtime` · route `/copilot-runtime` · under “Setting Up the Runtime” · in a `ts` block

2 code lines changed.

````diff
+ export const PATCH = handler;
+ export const DELETE = handler;
````

**High — Quickstart**

`/strands-typescript/quickstart` · route `/quickstart` · under “Configure CopilotKit Provider” · in a `tsx` block

21 code lines, 4 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx title="app/providers.tsx"
+ "use client";
+ 
+ import { CopilotKit } from "@copilotkit/react-core/v2";
+ 
+ export function Providers({ children }: { children: React.ReactNode }) {
+ return (
+ <CopilotKit runtimeUrl="/api/copilotkit" agent="strands_agent" useSingleEndpoint={false}>
````

---

## 2026-09-15

### 11:32 UTC — 4 pages, highest severity high

**High — Tool Call Rendering**

`/strands-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “The backend tool definition”

11 code lines, 1 prose line changed. The number of fenced code blocks changed.

````diff
- <!-- snippet skipped: region 'weather-tool-backend' missing in strands-typescript::tool-rendering -->
+ ```typescript
+ // src/agent/tools.ts
+ export const getWeather = tool({
+ name: "get_weather",
+ description: "Get current weather for a location.",
+ inputSchema: z.object({
+ location: z.string().describe("The location to get weather for."),
````

**High — Human in the Loop**

`/strands-typescript/human-in-the-loop` · route `/human-in-the-loop` · under “Two patterns for HITL in CopilotKit”

39 code lines, 1 heading, 17 prose lines changed. The number of fenced code blocks changed.

````diff
- <!-- setup skipped: human-in-the-loop-setup is not bundled for strands-typescript -->
+ <Steps>
+ <Step>
+ ### Pause a tool with Strands' native interrupt
+ 
+ AWS Strands ships a first-class
+ [interrupt primitive](https://strandsagents.com/docs/user-guide/concepts/interrupts/).
+ A tool's callback receives a context whose `interrupt({ name, reason })`
````

**High — Threads Drawer**

`/strands-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “Set up the Threads Drawer” · in a `tsx` block

2 code lines, 22 prose lines changed.

````diff
- <CopilotKitProvider runtimeUrl="/api/copilotkit" publicLicenseKey="ck_pub_...">
+ <CopilotKitProvider runtimeUrl="/api/copilotkit">
- Threads require CopilotKit Intelligence. Without a license key, the drawer shows
- a locked view in place of the list.
+ Threads require CopilotKit Intelligence. The drawer resolves its entitlement
+ through the Runtime, so the credential is server-side configuration rather than a
+ prop on the provider. Which credential you set depends on how you deploy.
+ 
````

**High — Programmatic Control**

`/strands-typescript/programmatic-control` · route `/programmatic-control` · under “Resolving a LangGraph interrupt from a button”

36 code lines, 2 headings, 15 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Resolving a LangGraph interrupt from a button
+ The `interrupt-headless` cell demonstrates the full pattern without
+ `useInterrupt` or a chat surface. A plain hook subscribes to
+ `on_interrupt` custom events, buffers the payload until the run
+ finalizes (so the UI doesn't flash mid-stream), and exposes a
+ `resolve(response)` callback that calls `copilotkit.runAgent({ agent,
+ forwardedProps: { command: { resume, interruptEvent } } })` to unblock
+ the graph:
````

---

---

## 2026-09-14

### 07:41 UTC — 3 pages, highest severity high

**High — Headless Threads**

`/strands-typescript/headless-threads` · route `/headless-threads` · under “Driving one agent per thread”

7 code lines, 1 heading, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Driving one agent per thread
+ 
+ `useThreads` lists and switches threads. To read or run an agent **scoped to a
+ specific thread** — one open tab per thread, for instance — pass all three of
+ `agentId`, `runtimeAgentId` and `threadId` to `useAgent`:
+ 
+ ```tsx
+ const { agent } = useAgent({
````

**Medium — Tool Call Rendering**

`/strands-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “Tool inputs and results are separate”

1 heading, 15 prose lines changed.

````diff
+ ### Tool inputs and results are separate
+ 
+ In `useRenderTool`, `parameters` contains the **inputs** the agent sent to the
+ tool. It does not change into the tool's return value when `status` becomes
+ `"complete"`. The completed output arrives separately as `result`, a string.
+ For a tool that returns JSON, parse that string before reading its fields.
+ 
+ For example, `get_weather` might receive `{ "location": "Paris" }` and return
````

**Low — Voice**

`/strands-typescript/voice` · route `/voice` · under “Next.js API route”

24 prose lines changed.

````diff
+ <Callout type="warn" title="Without a service, `/transcribe` answers 503">
+ A runtime with no `transcriptionService` still serves the route, and answers every request
+ `503` with `{ "error": "service_not_configured" }`. The mic button never appears, so the
+ symptom is a chat with no voice input rather than a visible server error — check `/info` for
+ `audioFileTranscriptionEnabled` when voice silently doesn't show up.
+ </Callout>
+ <Callout type="warn" title="Calling `/transcribe` yourself">
+ The chat handles this for you; these are the rules if you post to the route directly. As
````

---

---
