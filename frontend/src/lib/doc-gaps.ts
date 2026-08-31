/**
 * Everything docs.copilotkit.ai/strands-typescript does not publish.
 *
 * Every entry is a statement about the docs, verified against the page it
 * cites on the doc-sync date in `nav-config.ts`. Nothing here describes a
 * limitation of this repo or of AWS Strands itself — only of the
 * documentation, which is what this harness exists to test.
 *
 * A route's page renders its gaps with `<DocGaps path="…" />`. The entries that
 * concern the backend are mirrored, per agent, in the `gaps` field of
 * `backend/src/agents/registry.ts`, which the server exposes at `GET /gaps`.
 * The two lists are maintained by hand; `curl localhost:8000/gaps` is how you
 * check them against each other.
 *
 * When a doc page starts publishing the missing half, delete the entry. The
 * panel disappears from the route and the README status table follows.
 */

export type GapSeverity = "blocking" | "degraded" | "note";

export interface DocGap {
  id: string;
  /** One line, in the imperative: what is missing. */
  title: string;
  detail: string;
  severity: GapSeverity;
  /** The doc page the claim is about. */
  docPath: string;
}

const GAP_LIST: DocGap[] = [
  // ---------------------------------------------------------------- backend
  {
    id: "setup-skipped",
    title: "The page emits a placeholder where the backend snippet should be",
    detail:
      'Instead of Strands code, the published markdown contains the literal comment `<!-- setup skipped: … is not bundled for strands-typescript -->`. The same page for Google ADK prints a full agent definition at that spot. Seven pages are affected: frontend-tools, generative-ui/tool-based, human-in-the-loop, shared-state/agent-readonly, agent-config, programmatic-control, multi-agent/subagents.',
    severity: "blocking",
    docPath: "/strands-typescript",
  },
  {
    id: "agent-ts-orphan-imports",
    title: "The published backend file is complete but four of its imports are not",
    detail:
      "`src/agent/agent.ts` appears on 18 pages, byte-identical each time, and — unlike the Python sibling — it is not truncated. It is still unrunnable: it imports `createModel` from `./model-factory`, `SHOWCASE_TOOLS` from `./tools`, six symbols from `./state`, four prompt constants from `./prompts`, and reads `./a2ui_schemas/flight_schema.json`. None of those five is published on any page. `server.ts`, which its own docstring credits with mounting the agents, is likewise never shown. Full analysis in `backend/docs_verbatim/README.md`.",
    severity: "blocking",
    docPath: "/strands-typescript/prebuilt-components/chat",
  },
  {
    id: "demo-viewer-first-tab-only",
    title: "Only the first tab of each demo source viewer is actually published",
    detail:
      "The demo widget shows a tab strip — `src/agent/agent.ts`, `src/agent/tools.ts`, `src/app/demos/…/page.tsx`, `src/app/api/copilotkit/route.ts` — but only the first panel is server-rendered. Every other tab's content is absent from the page payload, so the file names are visible and the files are not. `tools.ts` is named on the Tool Call Rendering page and its body appears nowhere in the doc tree.",
    severity: "blocking",
    docPath: "/strands-typescript/generative-ui/tool-rendering",
  },
  {
    id: "no-tool-wiring",
    title: "No page attaches a backend tool to a Strands agent",
    detail:
      "`buildShowcaseAgent` passes `tools: SHOWCASE_TOOLS`, and `SHOWCASE_TOOLS` is never defined. Outside that one line, no Strands TypeScript page passes a populated `tools=` to a Strands `Agent`. Every agent in this harness is therefore tool-free on the backend; see `backend/src/agents/chat-agents.ts`.",
    severity: "blocking",
    docPath: "/strands-typescript/generative-ui/tool-rendering",
  },
  {
    id: "frontend-tool-channel-undocumented",
    title: "Frontend tools do reach the agent, and no page says how",
    detail:
      "Google ADK opens CopilotKit's frontend-tool channel with `AGUIToolset()` in the agent's `tools=` list, and its doc pages say so. Every Strands TypeScript page that would cover the equivalent is the `setup skipped` placeholder. The mechanism exists anyway: `@ag-ui/aws-strands@0.2.3` exports `createProxyTool` and `syncProxyTools` and registers the runtime's forwarded tool declarations onto the Strands tool registry per run. That is why Frontend Tools, Components as Tools, Display-only and Human-in-the-Loop work in this harness. A reader following the docs alone has no way to know it.",
    severity: "note",
    docPath: "/strands-typescript/frontend-tools",
  },
  {
    id: "no-agent-server-composition",
    title: "No page shows more than one agent in a Strands process",
    detail:
      'Every published example ends at `createStrandsApp(aguiAgent, { path: "/" })` and `app.listen(8000)` — one app, one agent, one root. Nothing documents serving a second agent from the same process. `backend/src/server.ts` here mounts one `createStrandsApp` per agent with plain Express `app.use`, leaving the documented call untouched, but the composition is this repo\'s.',
    severity: "note",
    docPath: "/strands-typescript/quickstart?agent=bring-your-own",
  },

  // -------------------------------------------------------------- quickstart
  {
    id: "quickstart-model-id",
    title: "The Quickstart names a model that does not exist",
    detail:
      'The TypeScript block sets `modelId: "gpt-5.4"`. The callout immediately under it says the example "uses OpenAI\'s GPT-4o", and both Shared State pages build the same model with `modelId: "gpt-4o"`. This repo defaults to `gpt-4o` and exposes `MODEL_ID` so you can set it back to the literal value and watch it fail.',
    severity: "degraded",
    docPath: "/strands-typescript/quickstart?agent=bring-your-own",
  },
  {
    id: "quickstart-installs-v1-package",
    title: "The install line and the import lines are from different major versions",
    detail:
      "The Quickstart installs `@copilotkit/react-ui @copilotkit/react-core @copilotkit/runtime @ag-ui/client`, then every subsequent code block imports from the v2 entry points — `@copilotkit/react-core/v2` for the provider and components, `@copilotkit/runtime/v2` for the runtime and `CopilotKitIntelligence`. `@copilotkit/react-ui` is the v1 package and nothing on the page uses it. The unpinned `@ag-ui/client` is the more damaging half: every CopilotKit package depends on exactly `0.0.57`, npm resolves the bare install to `0.0.58`, and the two copies make `HttpAgent` nominally distinct from the `AbstractAgent` the runtime expects — `agents: { strands_agent: new HttpAgent(...) }` then fails to typecheck with 'separate declarations of a private property _debug'. This repo pins `0.0.57` exactly so the trees dedupe.",
    severity: "degraded",
    docPath: "/strands-typescript/quickstart?agent=bring-your-own",
  },
  {
    id: "intelligence-key-assertion",
    title:
      "The runtime block asserts a licence key the same page says you can omit",
    detail:
      'The published runtime does `intelligence: new CopilotKitIntelligence({ apiKey: process.env.INTELLIGENCE_API_KEY! })` — a non-null assertion. The callout directly beneath it says the opposite is supported: "Drop the `intelligence` and `identifyUser` options and the runtime falls back to SSE mode with an in-memory runner." Following the code literally with no key set does not produce that fallback; it constructs `CopilotKitIntelligence` with `undefined` and asserts otherwise. Getting the documented behaviour means dropping both options, which is a code change the block does not show. This repo does the drop in `frontend/src/lib/intelligence.ts` so the harness runs with or without a licence.',
    severity: "degraded",
    docPath: "/strands-typescript/quickstart?agent=bring-your-own",
  },
  {
    id: "quickstart-next-links-404",
    title: 'The "What\'s next" cards point at a path prefix that does not exist',
    detail:
      "Both cards link to `/aws-strands/generative-ui/tool-rendering` and `/aws-strands/frontend-tools`. The live tree is `/strands-typescript/...`. The Deploy link on the same page points at `/strands-typescript/deploy-agentcore`, while the sidebar lists that page as `/strands-typescript/deploy/agentcore`.",
    severity: "note",
    docPath: "/strands-typescript/quickstart?agent=bring-your-own",
  },

  // ------------------------------------------------------------ generative UI
  {
    id: "weather-tool-backend-missing",
    title: "The tool-rendering page's backend section is an empty marker",
    detail:
      'The page builds to a heading — "The backend tool definition… expose a tool named `get_weather`, return structured data" — and then prints `<!-- snippet skipped: region \'weather-tool-backend\' missing in strands-typescript::tool-rendering -->`. There is no `get_weather` and no `search_flights` anywhere in the Strands TypeScript tree, so the two named renderers on this page have nothing to render.',
    severity: "blocking",
    docPath: "/strands-typescript/generative-ui/tool-rendering",
  },
  {
    id: "renderers-missing-imports",
    title: "Both A2UI pages print renderers.tsx with no imports",
    detail:
      "The dynamic-schema page's block opens directly at `export const myRenderers: CatalogRenderers<MyDefinitions> = {` and has no import line at all, so ten distinct symbols are used and none is bound: `React`, `CatalogRenderers`, `MyDefinitions`, ten recharts primitives, four lucide icons, and the `CardShell` / `Badge` / `Button` / `c` / `CHART_COLORS` chrome the renderers are built on. `MyDefinitions` is not merely unimported — `definitions.ts` exports the value `myDefinitions` and no such type. The fixed-schema page has the same defect: its block opens at `export const renderers: CatalogRenderers<Definitions> = {` and uses `Card`, `Badge`, `Separator`, `UIButton` and a helper `s()`, none imported or defined. Neither block compiles as printed. This repo splits the difference on the dynamic page — the packaged symbols get the import line the block omits, the five unpublished ones are reconstructed in `primitives.tsx` from the call sites that pin their signatures, and the route lists all of them.",
    severity: "degraded",
    docPath: "/strands-typescript/generative-ui/a2ui/dynamic-schema",
  },
  {
    id: "a2ui-fixed-schema-missing",
    title: "Every backend step of the fixed-schema page is a skipped snippet",
    detail:
      "The page has five `<!-- snippet skipped -->` markers and no backend code at all. Three of them are the same missing region (`backend-render-operations`), once per framework branch — including the `llm-driven` branch under **Generate the schema dynamically**, which is the branch that applies to Strands. The other two are `backend-schema-json-load`. So the step that would show a Strands agent producing the surface is empty on the one path a Strands reader is routed to.",
    severity: "blocking",
    docPath: "/strands-typescript/generative-ui/a2ui/fixed-schema",
  },
  {
    id: "a2ui-flight-schema-json-missing",
    title: "The fixed-schema tool is published; the schema it reads is not",
    detail:
      "`buildA2uiFixedSchemaAgent` in `agent.ts` is complete — the `display_flight` tool, its Zod input schema, and the `createSurface`/`updateComponents`/`updateDataModel` envelope. It renders `FLIGHT_SCHEMA`, parsed from `./a2ui_schemas/flight_schema.json`. That file appears on no page: the tree is drawn as an ASCII diagram (Card → Column → Title / Row / Row / Button) and given as data nowhere. This route runs because the file was carried over from the Google ADK harness, whose backend ships the identical schema for the identical demo — same twelve nodes, same shape, same four data paths (`/origin`, `/destination`, `/airline`, `/price`). A reader following the Strands tree alone still cannot build it, which is why the route is Partial rather than Working.",
    severity: "degraded",
    docPath: "/strands-typescript/generative-ui/a2ui/fixed-schema",
  },
  {
    id: "a2ui-python-on-ts-pages",
    title: "The A2UI pages talk about the Python SDK on a TypeScript page",
    detail:
      'Fixed-schema: the Button renderer\'s comment says the click handler "is inert until the Python SDK exposes `action_handlers=` on `a2ui.render` (see `src/agents/a2ui_fixed.py`)", and the action-handlers section says "the Python tool matches it with a handler keyed by the action name". Dynamic-schema: the opt-out section\'s "A2UI agent tool" step prints `from ag_ui_langgraph import get_a2ui_tools` / `ChatOpenAI` under a `python title="agent.py"` label, and the streaming section says the tool call "streams through LangGraph as `TOOL_CALL_ARGS` events". `@ag-ui/aws-strands` exports its own `getA2UITools`; no page shows it.',
    severity: "degraded",
    docPath: "/strands-typescript/generative-ui/a2ui/fixed-schema",
  },
  {
    id: "interactive-page-empty",
    title: "The Interactive page has no content at all",
    detail:
      '`generative-ui/your-components/interactive` is 156 bytes of markdown in total: a title, a one-line description, and the single unrendered tag `<Interactive components={props.components} framework="aws-strands" />`. Note the framework slug — `aws-strands`, the Python tree, on a page served under `/strands-typescript`. There is no code on this page to reproduce.',
    severity: "blocking",
    docPath: "/strands-typescript/generative-ui/your-components/interactive",
  },
  {
    id: "chat-suggestions-hook-undefined",
    title: "The CopilotChat page's only code example calls an undefined hook",
    detail:
      "The page's whole `Chat` component is three lines, and one of them is `useAgenticChatSuggestions();`. That hook is not exported by any CopilotKit package and is not defined anywhere in the doc tree — it lives in the demo app's own `./suggestions` module, which the source viewer does not publish.",
    severity: "note",
    docPath: "/strands-typescript/prebuilt-components/chat",
  },

  {
    id: "runtime-route-missing-verbs",
    title:
      "The Quickstart's runtime route exports two verbs; Rich Threads needs four",
    detail:
      "The published `app/api/copilotkit/[[...slug]]/route.ts` ends with `export const GET = handler;` and `export const POST = handler;` and nothing else. Next.js answers any verb a route does not export with a 405, and the threads client uses four — GET and POST to list and connect, PATCH to rename and archive, DELETE to delete (verified against `@copilotkit/core` 1.69.0, whose request layer issues exactly those and never PUT). So a runtime built to the Quickstart serves chat perfectly and 405s every thread mutation: `DELETE /api/copilotkit/threads/<id> 405`, then `unhandledRejection: Error: Request failed: 405`. Nothing on the Quickstart, the Threads Drawer page or Headless Threads mentions the extra exports, and because chat is unaffected the runtime looks healthy. This repo exports PATCH and DELETE on all three runtimes. The Voice page's published route is closer — POST, GET, PUT, DELETE — but still omits PATCH, so rename and archive would 405 there too.",
    severity: "blocking",
    docPath: "/strands-typescript/quickstart?agent=bring-your-own",
  },

  // ------------------------------------------------------------ rich threads
  {
    id: "drawer-slots-untypeable",
    title: "The Threads Drawer's slot example does not typecheck",
    detail:
      "The Customization section lists five slots (`header`, `empty`, `footer`, `memories`, `launcher-icon`) and shows `<CopilotThreadsDrawer><span slot=“header”>My conversations</span></CopilotThreadsDrawer>`. Against `@copilotkit/react-core@1.69.0` that is a type error: `CopilotThreadsDrawerProps` declares eleven members — agentId, onThreadSelect, onNewThread, onLicensed, licenseUrl, renderRow, label, recentLabel, limit, collapsible, onCollapseChange — and `children` is not one of them. The underlying `copilotkit-threads-drawer` web component does accept slotted light-DOM children, so the feature is real and the React wrapper's typing is what withholds it. The same table also omits `collapsible` and `onCollapseChange`, which exist on the type.",
    severity: "degraded",
    docPath: "/strands-typescript/prebuilt-components/copilot-threads-drawer",
  },
  {
    id: "threads-two-licence-paths",
    title: "Adjacent thread pages put the licence key in two different places",
    detail:
      'The Threads Drawer page puts it on the client — `<CopilotKitProvider runtimeUrl="/api/copilotkit" publicLicenseKey="ck_pub_...">`. Headless Threads and the Quickstart put it on the server — `intelligence: new CopilotKitIntelligence({ apiKey: process.env.INTELLIGENCE_API_KEY! })` — and Headless Threads adds "keep that key server-side". Both props exist on their respective types. Nothing on either page says whether they are alternatives, complements, or two tiers, or which one a new app should reach for. This harness uses the server path for all three runtimes.',
    severity: "degraded",
    docPath: "/strands-typescript/prebuilt-components/copilot-threads-drawer",
  },
  {
    id: "threads-verify-app-session-undefined",
    title: "The identifyUser snippet awaits a function defined on no page",
    detail:
      "Both Headless Threads and Thread & History Lifecycle print `identifyUser: async (request) => { const session = await verifyAppSession(request); … }`. `verifyAppSession` is imported nowhere and defined nowhere in the doc tree; the comment “Your server-side auth” is the whole specification. The snippet does not run as printed. This harness has no auth provider, so `frontend/src/lib/intelligence.ts` uses the Quickstart's simpler published `identifyUser` — the `x-user-id` / `x-user-name` header form — rather than inventing a session layer.",
    severity: "degraded",
    docPath: "/strands-typescript/headless-threads",
  },
  {
    id: "threads-sidebar-two-snippets",
    title: "Headless Threads shows one file twice with two incompatible hook calls",
    detail:
      "`ThreadSidebar.tsx` appears as two blocks. The first destructures `threads, isLoading, renameThread, archiveThread, deleteThread` from `useThreads({ agentId })`; the second re-destructures the same hook with `limit: 20` and takes `hasMoreThreads, isFetchingMoreThreads, fetchMoreThreads`. Read as one file that is two `useThreads` calls and two subscriptions. `deleteThread` is destructured in the first and used in neither. This repo merges them into a single call, which is the only way to have both sets of members.",
    severity: "note",
    docPath: "/strands-typescript/headless-threads",
  },
  {
    id: "threads-lifecycle-myapi-undefined",
    title: "The custom-thread-creation section is built on an undefined backend",
    detail:
      'Both snippets under "Creating a thread with your own API on the first message" call `myApi.createThread()`, which is imported nowhere and defined nowhere; the headless variant additionally replaces the send with the comment `// ...then trigger the run with your send logic`. Both are shape-only. The section does state one precise and genuinely useful fact — for a send fired in the same handler, set `agent.threadId` directly rather than `setActiveThreadId`, because the latter only reaches the agent on the next render.',
    severity: "note",
    docPath: "/strands-typescript/threads-lifecycle",
  },
  {
    id: "threads-import-no-strands-source",
    title: "The thread-import page supports no Strands source",
    detail:
      'Served under `/strands-typescript`, the Supported sources table has exactly two rows — Google ADK and LangGraph — whose import guides live at `/google-adk/threads-import` and `/langgraph-python/threads-import`. `npx copilotkit@latest import --source` accepts neither `strands` nor any equivalent. A reader arriving from the Strands sidebar can run the dry run and find nothing to import. The page says "more sources coming soon" and never says Strands is not one of them. There is also no application code on the page at all — it is a CLI workflow, so the route is reference-only.',
    severity: "note",
    docPath: "/strands-typescript/threads-import",
  },

  // ----------------------------------------------------------------- frontend
  {
    id: "chat-controls-needs-provider",
    title:
      "The page's headline snippet cannot work in the position the page is about",
    detail:
      'Chat controls is a page about driving the chat from *your own UI*, and its first example is an `OpenChatButton` calling `useCopilotChatConfiguration()`. Rendered where the page implies — beside the chat, not inside it — that hook returns null, the snippet\'s own guard fires, and the button renders nothing at all. The fix is real but demoted to a side callout, and phrased for a different case: "the prebuilt `<CopilotPopup>` and `<CopilotSidebar>` create it automatically. If you compose chat yourself, wrap the relevant subtree in `<CopilotChatConfigurationProvider isModalDefaultOpen={false}>`." The prebuilt surfaces do create it — inside their own subtree, which a sibling button is not in. Putting your own controls next to a prebuilt chat is exactly the case that needs the wrapper, and it is the one reading the page leaves you unprepared for. This route wraps the subtree; with no `defaultOpen` on the sidebar its inner provider defers to the outer one, so both share one modal state.',
    severity: "note",
    docPath: "/strands-typescript/prebuilt-components/chat-controls",
  },
  {
    id: "slot-components-undefined",
    title: "The slots page declares its three custom slots and never defines them",
    detail:
      "All three code blocks are cumulative prefixes of one `slot-overrides.snippet.tsx`, and every one of them opens with `declare const CustomWelcomeScreen: React.ComponentType;` and its two siblings. The bodies are never shown, and neither is the `<CopilotChat>` that would consume the three locals — the snippet ends mid-function with no closing brace and no return. `slot-components.tsx` in this repo reconstructs them; the doc snippet is reproduced beside it unchanged.",
    severity: "degraded",
    docPath: "/strands-typescript/custom-look-and-feel/slots",
  },
  {
    id: "headless-snippets-no-imports",
    title: "Every headless-UI snippet is printed with its import block stripped",
    detail:
      "`headless-simple/chat.tsx` uses `generateMessageId`, `UserBubble`, `AssistantBubble` and a `visible` array with no import and no definition — and `generateMessageId` is not merely unimported, it is exported by no CopilotKit package (checked against `@copilotkit/react-core` 1.66.4, whose v2 entry point exports 24 `use*` hooks and no id helper), so the snippet cannot run as printed. `headless-complete/chat/message-list.tsx` uses `ToolMessage`, `useMemo` and `ActivityWrapper` the same way. `message-assistant.tsx` — the longest block on the page — uses `Avatar`, `AvatarFallback`, `Bot`, `User`, `cn`, `ReactMarkdown`, `remarkGfm`, `MultimodalPart`, `Attachment` and `AttachmentChip`, none imported and two of them (`react-markdown`, `remark-gfm`) third-party packages the page never lists as dependencies. The page also names `useRenderedMessages` in prose as its central piece and never shows it.",
    severity: "degraded",
    docPath: "/strands-typescript/custom-look-and-feel/headless-ui",
  },
  {
    id: "headless-simple-wrong-framework-label",
    title: "The headless snippet logs itself as langgraph-python",
    detail:
      'The `runAgent` error handler on the Strands TypeScript page reads `console.error("[langgraph-python:headless-simple] runAgent failed", err);`, with a comment above it explaining why the demo logs rather than swallows. The string is copied straight from another framework\'s repo. Reproduced as printed.',
    severity: "note",
    docPath: "/strands-typescript/custom-look-and-feel/headless-ui",
  },
  {
    id: "headless-helpers-undefined",
    title: "The headless send pipeline destructures helpers it never defines",
    detail:
      "The `headless-complete` snippet opens with `const { attachments, fileInputRef, containerRef, handleFileUpload, handleDragOver, handleDragLeave, handleDrop, dragOver, removeAttachment, consumeAttachments } = useAttachmentsConfig();` and also calls `useAutoScroll` and `buildContent`. None of the three is printed on any page — `useAttachmentsConfig` is a source-viewer tab title with no body. This repo reconstructs them in `headless-helpers.ts`, which is why the route is Partial.",
    severity: "degraded",
    docPath: "/strands-typescript/programmatic-control",
  },
  {
    id: "interrupt-not-available",
    title: "Strands has no interrupt primitive, so parts of two pages do not apply",
    detail:
      "Human-in-the-Loop spends half its length on `useInterrupt`, whose own comparison table names the backend surface as \"a server-side `interrupt()` call in your LangGraph agent\". Programmatic Control gates its interrupt section behind `<WhenFrameworkHas flag=\"interrupt_pattern\" …>`; for Strands neither the `native` nor the `promise-based` branch resolves — the promise-based snippet is replaced by `<!-- snippet skipped: region 'headless-promise-primitives' missing in strands-typescript::interrupt-headless -->` and the fallback text says to use `useHumanInTheLoop` instead. The three primitives (`addMessage`, `runAgent`, `subscribe`) are unaffected.",
    severity: "note",
    docPath: "/strands-typescript/programmatic-control",
  },
  {
    id: "css-v1-import",
    title: "The CSS page's inline-override example imports from the v1 package",
    detail:
      '`import { CopilotKitCSSProperties } from "@copilotkit/react-ui";` sits in the middle of a page whose demo is v2. The `--copilot-kit-*` variables it sets are the v1 token set; the v2 components read the shadcn `--primary` / `--background` tokens documented lower down the same page. Both halves are correct in isolation and cannot be combined.',
    severity: "note",
    docPath: "/strands-typescript/custom-look-and-feel/css",
  },
  {
    id: "voice-chat-component-missing",
    title: "The Voice page's page.tsx imports a component it never shows",
    detail:
      "The published `voice/page.tsx` renders `<VoiceChat />` imported from `./voice-chat`, and that file is not published. The prose then describes what the missing component does — drop the transcript into the composer's textarea, matched via `data-testid=\"copilot-chat-textarea\"`, using the native value setter plus a synthetic `input` event — instead of showing it. `SampleAudioButtonProps` is likewise used and never declared. The page also carries a `<WhenFrameworkHas flag=\"voice_backend_pattern\">` block that talks about Google ADK's `agent_server.py`.",
    severity: "degraded",
    docPath: "/strands-typescript/voice",
  },
  {
    id: "multimodal-audio-dropped",
    title: "The attachments table promises an audio modality the adapter discards",
    detail:
      'The supported-file-types table lists Audio (`audio/*`) with an audio-player preview and "Model-dependent" AI support, and the config example\'s `accept` string leads with `image/*,audio/*`. The Strands adapter does not forward audio: `convertAguiContentToStrands` in `@ag-ui/aws-strands` documents `AudioInputContent` as "skipped (Strands has no audio support)". An audio attachment uploads, previews, and silently never reaches the model. No page mentions this.',
    severity: "degraded",
    docPath: "/strands-typescript/multimodal-attachments",
  },

  // -------------------------------------------------------------- shared state
  {
    id: "language-agent-id-mismatch",
    title: "The read and write pages disagree on the agent id",
    detail:
      'Both pages print the same backend, which names the agent `languageAgent`. The *write* page\'s frontend calls `useAgent({ agentId: "languageAgent" })`; the *read* page\'s calls `useAgent({ agentId: "strands_agent" })` — an id that page never defines. Copied literally, the read page addresses an agent that does not exist. Mounted once here, as `languageAgent`.',
    severity: "degraded",
    docPath: "/strands-typescript/shared-state/in-app-agent-read",
  },
  {
    id: "agent-readonly-wrong-middleware",
    title: "The read-only context page credits middleware this adapter does not have",
    detail:
      'The page says context entries are "surfaced to the agent via the backend\'s `CopilotKitMiddleware`, which threads the entries into the model\'s message history on every turn". `@ag-ui/aws-strands` ships no `CopilotKitMiddleware`. It flattens `RunAgentInput.context[]` into a record itself and hands it to your `stateContextBuilder` as the third `extras` argument — a mechanism the page never mentions, on a page whose backend section is the `setup skipped` placeholder.',
    severity: "degraded",
    docPath: "/strands-typescript/shared-state/agent-readonly",
  },
  {
    id: "cross-framework-links",
    title: "The Shared State pages link out to LangGraph's docs and the Python demo",
    detail:
      'Both `in-app-agent-read` and `in-app-agent-write` tell you to "follow the instructions in the Getting Started guide" and link to `/langgraph/quickstart` rather than the Strands one. Both also embed a live example iframe pointed at `feature-viewer.copilotkit.ai/aws-strands/feature/shared_state` — the Python tree — from pages served under `/strands-typescript`.',
    severity: "note",
    docPath: "/strands-typescript/shared-state/in-app-agent-read",
  },
  {
    id: "rendering-in-app-frameworkless",
    title: "Render-state-in-your-app is the same page for every framework",
    detail:
      "Apart from link prefixes, this page is byte-identical to `/google-adk/shared-state/rendering-in-app`. It never mentions Strands, never shows a backend, and its `useAgent()` calls take no `agentId` — so the code as printed targets an agent literally named `default`, which no Strands page ever registers. Carrying Google ADK's version over, as requested, is therefore a no-op: it is already the same code.",
    severity: "note",
    docPath: "/strands-typescript/shared-state/rendering-in-app",
  },

  // --------------------------------------------------------------- multi-agent
  {
    id: "subagents-both-snippets-missing",
    title: "Sub-Agents publishes none of the three things it teaches",
    detail:
      "The page has three placeholders and one surviving code block. `<!-- setup skipped: subagents-setup … -->` replaces the introduction. `<!-- snippet skipped: region 'subagent-setup' … -->` replaces the sub-agent definitions. `<!-- snippet skipped: region 'supervisor-delegation-tools' … -->` replaces the delegation tools — the section that explains, in prose, exactly what those tools do to `delegations` in shared state. What is left is the log component that renders the result.",
    severity: "blocking",
    docPath: "/strands-typescript/multi-agent/subagents",
  },
  {
    id: "subagents-log-undefined-types",
    title: "The one Sub-Agents snippet references four symbols it never imports",
    detail:
      "`delegation-log.tsx` is printed with its import block stripped. It uses `SubAgentName` (as a type argument to `Set`), `SUB_AGENT_STYLE` (a record of emoji/label/colour), `DelegationLogProps`, and a `Delegation` shape with `sub_agent` / `task` / `result` / `status` / `id` fields. None is defined on the page. The `delegations` state key it renders is only ever described in prose.",
    severity: "degraded",
    docPath: "/strands-typescript/multi-agent/subagents",
  },
  {
    id: "no-state-from-result",
    title: "The tool → state binding is described only in prose",
    detail:
      "Sub-Agents says each delegation tool \"records the delegation into a `delegations` slot in shared agent state\". The mechanism is `ToolBehavior.stateFromResult`, and the published `agent.ts` wires exactly that — `makeSubagentStateFromResult(\"research_agent\")` and two siblings — while importing the factory from the unpublished `./state`. So the config that attaches it is visible and the function that implements it is not.",
    severity: "blocking",
    docPath: "/strands-typescript/multi-agent/subagents",
  },

  // -------------------------------------------------------------- agent config
  {
    id: "agent-config-wrong-framework",
    title: "The Agent Config backend sample is LangGraph Python, not Strands",
    detail:
      'Under a `python title="backend/agent.py"` label the page shows `async def my_agent_node(state: AgentState, config: RunnableConfig)` reading `state.get("copilotkit", {}).get("context", [])`. That is the LangGraph node signature and the LangGraph context location. Strands has neither, and this is the TypeScript tree. The Strands half of the page is the `setup skipped` placeholder; the alternative `runtime-properties` branch shows a TypeScript `agentConfigFactory` that belongs to a different architecture again.',
    severity: "blocking",
    docPath: "/strands-typescript/agent-config",
  },

  // ------------------------------------------------------------------- runtime
  {
    id: "runtime-pages-frameworkless",
    title: "Neither runtime page mentions Strands",
    detail:
      'Apart from cross-links, Copilot Runtime is framework-neutral: its snippet registers `// your agents go here` and its default-agent example points an `HttpAgent` at `https://my-agent.example.com` without importing `HttpAgent`. It never connects that to the `createStrandsApp` endpoint the Quickstart produces. The AG-UI page is the same — its examples target an agent id `research-agent` that appears nowhere else in the tree.',
    severity: "note",
    docPath: "/strands-typescript/copilot-runtime",
  },
];

export const DOC_GAPS: Record<string, DocGap> = Object.fromEntries(
  GAP_LIST.map((g) => [g.id, g]),
);

export type GapId = string;

/**
 * Which gaps apply to which route. Order matters — the most damaging one for
 * that route goes first, because that is what the panel leads with.
 */
export const ROUTE_GAPS: Record<string, GapId[]> = {
  // "/quickstart": [
  //   "quickstart-model-id",
  //   "quickstart-installs-v1-package",
  //   "intelligence-key-assertion",
  //   "quickstart-next-links-404",
  //   "no-agent-server-composition",
  // ],

  // "/prebuilt-components/chat": ["chat-suggestions-hook-undefined"],
  // "/prebuilt-components/chat-controls": ["chat-controls-needs-provider"],

  // "/custom-look-and-feel/css": ["css-v1-import"],
  // "/custom-look-and-feel/slots": ["slot-components-undefined"],
  // "/custom-look-and-feel/headless-ui": [
  //   "headless-snippets-no-imports",
  //   "headless-simple-wrong-framework-label",
  //   "demo-viewer-first-tab-only",
  // ],

  // "/multimodal-attachments": ["multimodal-audio-dropped"],
  // "/voice": ["voice-chat-component-missing", "agent-ts-orphan-imports"],

  // "/generative-ui/tool-based": [
  //   "setup-skipped",
  //   "frontend-tool-channel-undocumented",
  // ],
  // "/generative-ui/tool-rendering": [
  //   "weather-tool-backend-missing",
  //   "no-tool-wiring",
  //   "demo-viewer-first-tab-only",
  //   "agent-ts-orphan-imports",
  // ],
  // "/generative-ui/your-components/display-only": [
  //   "frontend-tool-channel-undocumented",
  // ],
  // "/generative-ui/your-components/interactive": ["interactive-page-empty"],
  // "/generative-ui/a2ui/dynamic-schema": [
  //   "renderers-missing-imports",
  //   "a2ui-python-on-ts-pages",
  //   "agent-ts-orphan-imports",
  // ],
  // "/generative-ui/a2ui/fixed-schema": [
  //   "a2ui-fixed-schema-missing",
  //   "a2ui-flight-schema-json-missing",
  //   "renderers-missing-imports",
  //   "a2ui-python-on-ts-pages",
  // ],

  // "/frontend-tools": ["setup-skipped", "frontend-tool-channel-undocumented"],
  // "/human-in-the-loop": [
  //   "setup-skipped",
  //   "interrupt-not-available",
  //   "frontend-tool-channel-undocumented",
  // ],
  // "/programmatic-control": [
  //   "setup-skipped",
  //   "headless-helpers-undefined",
  //   "interrupt-not-available",
  // ],

  // "/shared-state/rendering-in-app": [
  //   "rendering-in-app-frameworkless",
  //   "no-state-from-result",
  // ],
  // "/shared-state/agent-readonly": [
  //   "setup-skipped",
  //   "agent-readonly-wrong-middleware",
  // ],
  // "/shared-state/in-app-agent-read": [
  //   "language-agent-id-mismatch",
  //   "cross-framework-links",
  // ],
  // "/shared-state/in-app-agent-write": ["cross-framework-links"],

  // "/multi-agent/subagents": [
  //   "subagents-both-snippets-missing",
  //   "subagents-log-undefined-types",
  //   "no-state-from-result",
  //   "no-tool-wiring",
  // ],

  // "/agent-config": ["agent-config-wrong-framework", "setup-skipped"],

  // "/copilot-runtime": [
  //   "runtime-pages-frameworkless",
  //   "no-agent-server-composition",
  // ],
  // "/ag-ui": ["runtime-pages-frameworkless"],
};

export function gapsFor(path: string): DocGap[] {
  return (ROUTE_GAPS[path] ?? []).map((id) => {
    const gap = DOC_GAPS[id];
    if (!gap) throw new Error(`Unknown doc gap id "${id}" on route ${path}`);
    return gap;
  });
}

/** Total distinct gaps, for the status page's headline. */
export const ALL_GAPS = GAP_LIST;
