/**
 * The nav, the route headers, and the README status table all read from here,
 * so a doc page and its implementation status are described exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/strands-typescript.
 * `agentId` is the id the agent is registered under in
 * `backend/src/agents/registry.ts`, which is also the path it is mounted at —
 * so a route, its doc page, and its agent line up in one place.
 *
 * The grouping is this harness's, not the doc sidebar's. The Strands
 * TypeScript sidebar scatters these pages across "Build Chat UIs", "Build
 * Generative UI", "Add Agent Powers" and "Runtime"; several pages below (the
 * `prebuilt-components/*` and `custom-look-and-feel/*` routes, and both
 * `your-components/*` routes) are reachable by URL but do not appear in that
 * sidebar at all. They are marked `offNav`.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/strands-typescript";

export type RouteStatus = "working" | "partial" | "reference" | "broken" | "not-started";

export interface RouteMeta {
  path: string;
  title: string;
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  /** Reachable by URL but absent from the Strands TypeScript doc sidebar. */
  offNav?: boolean;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Agent id from `backend/src/agents/registry.ts`. */
  agentId?: string;
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/strands-typescript",
        summary: "What this harness covers and how the pieces fit together.",
        status: "reference",
        statusNote:
          "Landing page — orientation, the agent roster, and the doc-gap ledger.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        agentId: "strands_agent",
        title: "Quickstart",
        docPath: "/strands-typescript/quickstart?agent=bring-your-own",
        summary:
          "The bring-your-own-agent path: a Strands Agent wrapped in StrandsAgent, served by createStrandsApp over Express, reached over HTTP by a v2 catch-all runtime carrying CopilotKit Intelligence.",
        status: "working",
        statusNote:
          "Re-synced 2026-09-16: the provider now lives in its own client app/providers.tsx, rendered by the server layout, and page.tsx is a client component. The demo mounts that provider verbatim, so the sidebar is bound by agent=\"strands_agent\" rather than agentId. The one page whose backend is published end to end; its model id still is not.",
      },
    ],
  },
  {
    title: "Prebuilt Components",
    routes: [
      {
        path: "/prebuilt-components/chat",
        hasDemo: true,
        agentId: "agentic_chat",
        offNav: true,
        title: "CopilotChat",
        docPath: "/strands-typescript/prebuilt-components/chat",
        summary:
          "The base inline chat surface, sized to fill whatever container you give it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/sidebar",
        hasDemo: true,
        agentId: "prebuilt-sidebar",
        offNav: true,
        title: "CopilotSidebar",
        docPath: "/strands-typescript/prebuilt-components/sidebar",
        summary:
          "The collapsible docked chat that wraps your main content rather than covering it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/popup",
        hasDemo: true,
        agentId: "prebuilt-popup",
        offNav: true,
        title: "CopilotPopup",
        docPath: "/strands-typescript/prebuilt-components/popup",
        summary:
          "The floating launcher that opens an overlay chat on top of the page.",
        status: "working",
      },
      {
        path: "/prebuilt-components/chat-controls",
        hasDemo: true,
        agentId: "chat-controls",
        offNav: true,
        title: "Open, close, and feedback",
        docPath: "/strands-typescript/prebuilt-components/chat-controls",
        summary:
          "Driving modal state from your own UI with useCopilotChatConfiguration, and capturing thumbs up/down.",
        status: "working",
      },
    ],
  },
  {
    title: "Rich Threads",
    routes: [
      {
        path: "/prebuilt-components/copilot-threads-drawer",
        hasDemo: true,
        agentId: "threads-demo",
        title: "Threads Drawer",
        docPath: "/strands-typescript/prebuilt-components/copilot-threads-drawer",
        summary:
          "The drop-in conversation sidebar: list, switch, archive and delete threads with no active-thread state of your own.",
        status: "working",
        statusNote:
          "Wired exactly as published. Threads live in CopilotKit Intelligence, so without INTELLIGENCE_API_KEY the drawer renders its locked view instead of a list — the doc's own documented behaviour, not a failure here.",
      },
      {
        path: "/headless-threads",
        hasDemo: true,
        agentId: "threads-demo",
        title: "Headless Threads",
        docPath: "/strands-typescript/headless-threads",
        summary:
          "useThreads as a data layer: list, rename, archive, delete and paginate behind your own UI.",
        status: "working",
        statusNote:
          "Every hook member the page uses exists and is wired, including the pagination block. Same licence gate as the drawer — no key, no list.",
      },
      {
        path: "/threads-lifecycle",
        hasDemo: true,
        agentId: "threads-demo",
        title: "Thread & History Lifecycle",
        docPath: "/strands-typescript/threads-lifecycle",
        summary:
          "Where a threadId comes from, how history replays, and how to switch or start a conversation.",
        status: "working",
        statusNote:
          "Carried over from the llamaindex harness: a thread picker plus all three setter branches. setActiveThreadId and startNewThread work with or without a licence; replay and the picker are what need the store. Two of the page's snippets call helpers it never defines.",
      },
      {
        path: "/threads-import",
        agentId: "threads-demo",
        title: "Synchronize Thread History",
        docPath: "/strands-typescript/threads-import",
        summary:
          "The CLI import flow for bringing existing conversations into Intelligence as Rich Threads.",
        status: "reference",
        statusNote:
          "No application code on the page — it is a CLI workflow. And its two supported sources are Google ADK and LangGraph; neither is Strands.",
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/css",
        hasDemo: true,
        agentId: "chat-customization-css",
        offNav: true,
        title: "CSS Customization",
        docPath: "/strands-typescript/custom-look-and-feel/css",
        summary:
          "Re-skinning the chat with the v2 shadcn design tokens and the .copilotKit* class hooks, using the page's own HALCYON theme.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        agentId: "chat-slots",
        offNav: true,
        title: "Slots",
        docPath: "/strands-typescript/custom-look-and-feel/slots",
        summary:
          "Overriding chat sub-components at all three levels: class strings, prop objects, and whole components.",
        status: "working",
        statusNote:
          "All three overrides take effect. The components behind them are this repo's — the page declares them and never defines them.",
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        agentId: "headless-simple",
        offNav: true,
        title: "Headless UI",
        docPath: "/strands-typescript/custom-look-and-feel/headless-ui",
        summary:
          "A chat built from useAgent, useCopilotKit and useRenderToolCall alone, with no CopilotKit chrome.",
        status: "working",
        statusNote:
          "The three hooks do the work and the chat streams. Every snippet on the page is printed with its import block stripped, so the bubbles are this repo's.",
      },
      {
        path: "/custom-look-and-feel/markdown",
        hasDemo: true,
        agentId: "chat-markdown",
        title: "Markdown Rendering",
        docPath: "/strands-typescript/custom-look-and-feel/markdown",
        summary:
          "The markdownRenderer slot on assistant messages in all three forms: a Streamdown components map, a class string, and a whole replacement component.",
        status: "working",
        statusNote:
          "All three snippets run exactly as published. The page defines no CSS for its my-link and my-heading classes, so the first example is only visible in DevTools.",
      },
    ],
  },
  {
    title: "Input Modalities",
    routes: [
      {
        path: "/multimodal-attachments",
        hasDemo: true,
        agentId: "multimodal",
        title: "Multimodal Attachments",
        docPath: "/strands-typescript/multimodal-attachments",
        summary:
          "Drag-and-drop file attachments sent to the agent as AG-UI content parts.",
        status: "working",
        statusNote:
          "The adapter converts image, document and video parts. Audio parts it drops on the floor — see the doc gaps.",
      },
      {
        path: "/voice",
        hasDemo: true,
        agentId: "voice-demo",
        title: "Voice",
        docPath: "/strands-typescript/voice",
        summary:
          "A second runtime carrying a TranscriptionService, which is what makes the composer grow a mic button.",
        status: "working",
        statusNote:
          "The mic transcribes through OpenAI Whisper, so it needs OPENAI_API_KEY. Without one the route still runs via the doc's sample-audio button.",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        agentId: "gen-ui-tool-based",
        title: "Components as Tools",
        docPath: "/strands-typescript/generative-ui/tool-based",
        summary:
          "useComponent registering a React component as a tool the agent calls to render it.",
        status: "working",
        statusNote:
          "Works because the adapter forwards frontend tools automatically. No doc page says it does — the page's backend section is a `setup skipped` placeholder.",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        agentId: "tool-rendering",
        title: "Tool Call Rendering",
        docPath: "/strands-typescript/generative-ui/tool-rendering",
        summary:
          "Named renderers for get_weather and search_flights, plus the wildcard catch-all from useDefaultRenderTool.",
        status: "partial",
        statusNote:
          "get_weather draws its card end to end. search_flights has no tool, so that renderer stays idle — and the page's backend section is still a `snippet skipped` marker for both.",
      },
      {
        path: "/generative-ui/your-components/display-only",
        hasDemo: true,
        agentId: "gen-ui-display-only",
        offNav: true,
        title: "Your Components · Display-only",
        docPath: "/strands-typescript/generative-ui/your-components/display-only",
        summary:
          "The page's own useComponent example: a weather card the agent renders with no handler and no interaction.",
        status: "working",
        statusNote: "The doc's snippet verbatim, including its `showWeather` name.",
      },
      {
        path: "/generative-ui/your-components/interactive",
        hasDemo: true,
        agentId: "gen-ui-interactive",
        offNav: true,
        title: "Your Components · Interactive",
        docPath: "/strands-typescript/generative-ui/your-components/interactive",
        summary:
          "An approve/deny gate around a command, built with useHumanInTheLoop.",
        status: "working",
        statusNote:
          "The gate suspends the run and resumes it on either button. The doc page is still 156 bytes of placeholder — the example was supplied separately.",
      },
      {
        path: "/generative-ui/a2ui/dynamic-schema",
        hasDemo: true,
        agentId: "declarative-gen-ui",
        title: "A2UI · Dynamic Schema",
        docPath: "/strands-typescript/generative-ui/a2ui/dynamic-schema",
        summary:
          "A bring-your-own-catalog surface where a secondary LLM designs the layout per request.",
        status: "partial",
        statusNote:
          "The only A2UI route with a runnable backend — its factory is the one in the published agent.ts whose dependencies are all inline. renderers.tsx still ships with no imports.",
      },
      {
        path: "/generative-ui/a2ui/fixed-schema",
        hasDemo: true,
        agentId: "a2ui-fixed-schema",
        title: "A2UI · Fixed Schema",
        docPath: "/strands-typescript/generative-ui/a2ui/fixed-schema",
        summary:
          "A flight card whose component tree is authored as JSON up front; the tool supplies only the data.",
        status: "partial",
        statusNote:
          "Runs end to end. The `display_flight` tool is the published `agent.ts` verbatim; the component tree it reads is published on no Strands page and was carried over from the Google ADK harness, which ships the identical schema for the identical demo.",
      },
      {
        path: "/generative-ui/json-render",
        hasDemo: true,
        agentId: "byoc_json_render",
        title: "JSON Render",
        docPath: "/strands-typescript/generative-ui/json-render",
        summary:
          "An agent-emitted { root, elements } spec validated against a Zod catalog and drawn by @json-render/react's Renderer.",
        status: "working",
        statusNote:
          "Runs the fixed renderer: the doc's <Renderer spec catalog> call throws on @json-render/react 0.21 (it takes registry and needs JSONUIProvider), so the demo builds a registry from the page's catalog and adds the provider. Missing helpers, components, runtime route and agent prompt are written in.",
      },
      {
        path: "/generative-ui/hashbrown",
        hasDemo: true,
        agentId: "byoc_hashbrown",
        title: "Hashbrown",
        docPath: "/strands-typescript/generative-ui/hashbrown",
        summary:
          "Streamed structured output parsed progressively by @hashbrownai/react and rendered through a component catalog.",
        status: "working",
        statusNote:
          "Runs the fixed renderer: the doc's hook calls throw on @hashbrownai/react 0.6.1 (useJsonParser needs a schema, useUiKit takes { components }), and its example output is the wrong shape, so the demo exposes the components, parses against kit.schema and prompts for the { ui: [...] } envelope. Missing components, runtime route and agent prompt are written in.",
      },
      {
        path: "/generative-ui/components/surfaces",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Surfaces",
        docPath: "/strands-typescript/generative-ui/components/surfaces",
        summary:
          "GenerativeUISurface page targets the chat can fill, limit, scroll to, and replace, with per-component error boundaries.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. All published snippets run. Product, ProductRow and the product list are repo scaffolding; ./catalog is taken to be the Catalogs page's shopUI; products come from a repo-authored search_products tool.",
      },
      {
        path: "/generative-ui/components/catalogs",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Catalogs",
        docPath: "/strands-typescript/generative-ui/components/catalogs",
        summary:
          "createGenerativeUI catalogs: typed components, zod and Valibot props, extends, parameterOrder and exportA2UICatalog.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. Every snippet runs; Hero, Panel and cartUI are repo scaffolding. fs.writeFileSync is replaced by printing the exported catalog.",
      },
      {
        path: "/generative-ui/components/standard-catalog",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Standard catalog",
        docPath: "/generative-ui/components/standard-catalog",
        summary:
          "standardUI's 69 components as is, extended with a ProductCard, with Map/Video/HtmlView omitted, and with Card overridden.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. This page has no strands-typescript URL; it lives at the framework-neutral path. ProductCard and productSchema are repo scaffolding.",
      },
      {
        path: "/generative-ui/components/state-and-actions",
        hasDemo: true,
        agentId: "genui",
        title: "Components · State and actions",
        docPath: "/strands-typescript/generative-ui/components/state-and-actions",
        summary:
          "App state bound into props, functions run on click, events sent to the agent, and writable props that keep user input.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. Cart, cart.addItem, the state-catalog ProductCard and the catalogs around the fragment snippets are repo scaffolding. Renderer functions cannot be called by the agent in this version, so allowedCallers is shown as exported only.",
      },
      {
        path: "/generative-ui/components/theming",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Theming",
        docPath: "/strands-typescript/generative-ui/components/theming",
        summary:
          "The theme option's CSS variables, a typed GenerativeUITheme file, dark-mode overrides, map styles, and .a2ui-surface CSS.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The dark-mode script renders in the demo body, not <head>. The page's mapStyle URLs are placeholders, so the Map variant draws no basemap.",
      },
      {
        path: "/generative-ui/components/transports",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Transports",
        docPath: "/strands-typescript/generative-ui/components/transports",
        summary:
          "The render_ui tool transport vs the markdown transport, the runtime's generativeUI flag, and agentIds scoping.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The runtime sample's agent is undefined; the Quickstart-shaped genui agent stands in, plus a shop agent so agentIds has one agent inside and one outside.",
      },
      {
        path: "/generative-ui/components/markdown-mode",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Markdown mode",
        docPath: "/strands-typescript/generative-ui/components/markdown-mode",
        summary:
          "The agent writes A2UI operations in a2ui code blocks inside its reply; sendContext: false moves the catalog into forwardedProps.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The sendContext: false variant renders no UI by design: the only backend shown for it is Python reading forwarded_props, which no Strands TypeScript agent does.",
      },
      {
        path: "/generative-ui/components/from-a2ui",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Adopt from A2UI",
        docPath: "/strands-typescript/generative-ui/components/from-a2ui",
        summary:
          "The v0.9 a2ui renderer → A2UI 1.0 migration: the After catalog running on the new engine, with the Before code shown.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. Airport and Arrow are repo scaffolding. The support matrix rules out @ag-ui/a2ui-toolkit 0.0.5 agent tools, which is what this repo's fixed-schema A2UI agent uses.",
      },
      {
        path: "/generative-ui/mcp-apps",
        hasDemo: true,
        title: "MCP Apps",
        docPath: "/strands-typescript/generative-ui/mcp-apps",
        summary:
          "An MCP server's UI resources rendered inline in the chat as sandboxed iframes, wired by the runtime's mcpApps.servers.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The runtime route is the Code tab's, verbatim, pointed at the public Excalidraw server. ./chat and the showcase agent at / are unpublished: a plain CopilotChat and a Quickstart-shaped stand-in replace them.",
      },
      {
        path: "/generative-ui/open-generative-ui",
        hasDemo: true,
        title: "Open Generative UI",
        docPath: "/strands-typescript/generative-ui/open-generative-ui",
        summary:
          "generateSandboxedUi streaming agent-written HTML/CSS/JS into a sandboxed iframe, plus sandbox functions that call back into the host.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The runtime route is verbatim. VISUALIZATION_DESIGN_SKILL and openGenUiSuggestions are unpublished and commented out, so the minimal demo uses the default design skill and the advanced one has no suggestions. ./chat and the agent at / are stand-ins.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        agentId: "frontend-tools",
        title: "Frontend Tools",
        docPath: "/strands-typescript/frontend-tools",
        summary:
          "A tool the agent calls that executes in the browser and changes the page.",
        status: "partial",
        statusNote:
          "useFrontendTool registers exactly as the page shows, and the adapter's proxy-tool sync gets it to the model. The page never explains that step. The \"Registering a list of tools\" sub-section is broken: useFrontendTools is not exported by @copilotkit/react-core 1.73.0.",
      },
      {
        path: "/webmcp",
        hasDemo: true,
        agentId: "webmcp",
        title: "WebMCP",
        docPath: "/strands-typescript/webmcp",
        summary:
          "A frontend tool mirrored onto document.modelContext so WebMCP browser agents can call it, plus the core-only registration with no agent.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. Both snippets run; searchOrders is a repo-authored stub. WebMCP itself needs Chrome 149+ with the flag or origin trial; elsewhere registration is skipped and only the chat path works.",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "Human in the Loop",
        docPath: "/strands-typescript/human-in-the-loop",
        summary:
          "useHumanInTheLoop suspending the run behind a time picker until the user answers.",
        status: "working",
        statusNote:
          "Pattern 1 works. This page calls Pattern 2 (`useInterrupt`) LangGraph-only, but the newer useInterrupt and Headless Interrupts pages publish a native Strands interrupt agent — see /human-in-the-loop/useInterrupt.",
      },
      {
        path: "/human-in-the-loop/governed-actions",
        hasDemo: true,
        agentId: "governed-actions",
        title: "Governed Action Approval UI",
        docPath: "/strands-typescript/human-in-the-loop/governed-actions",
        summary:
          "Gating a side-effecting tool call behind an approve/reject card before it runs.",
        status: "partial",
        statusNote:
          "The useHumanInTheLoop half works: the tool registers, the run suspends on the card, and respond() resumes it. The governance behind it does not exist — no page publishes a policy engine, a tool that emits a GovernedAction, or executeSideEffect, so verdict is whatever the model invents. The page's other pattern (useInterrupt) is not implemented here; the native Strands interrupt it needs is published on the useInterrupt page and runs at /human-in-the-loop/useInterrupt.",
      },
      {
        path: "/human-in-the-loop/useInterrupt",
        hasDemo: true,
        agentId: "interrupt",
        title: "Pausing the Agent (useInterrupt)",
        docPath: "/strands-typescript/human-in-the-loop/useInterrupt",
        summary:
          "A Strands tool pausing itself with context.interrupt(); useInterrupt renders a time picker inline and resolve() resumes the run.",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The agent and page are published; the agent imports this repo's createModel. The card/button/badge primitives and generateFallbackSlots are repo-authored; the suggestions hook is commented out.",
      },
      {
        path: "/human-in-the-loop/headless",
        hasDemo: true,
        agentId: "interrupt",
        title: "Headless Interrupts",
        docPath: "/strands-typescript/human-in-the-loop/headless",
        summary:
          "The same native interrupt, with the picker rendered in an app panel outside the chat (renderInChat: false).",
        status: "partial",
        statusNote:
          "Built, not yet checked in a browser. The page is published unchanged; only generateFallbackSlots (re-exported from the useInterrupt route) and the agent's createModel import are repo-supplied.",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        agentId: "programmatic-control",
        title: "Programmatic Control",
        docPath: "/strands-typescript/programmatic-control",
        summary:
          "Driving runs from code with addMessage, runAgent, stopAgent and subscribe — no chat component.",
        status: "working",
        statusNote:
          "Google ADK's implementation of this page, carried over on request. It runs the doc's headless-complete send pipeline, which destructures three helpers the docs never define.",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Render state in your app",
        docPath: "/strands-typescript/shared-state/rendering-in-app",
        summary:
          "useAgent read outside the chat: a main-view canvas subscribing to the same agent state the chat uses.",
        status: "working",
        statusNote:
          "The page is byte-identical to Google ADK's apart from link prefixes, so the requested carry-over is a no-op. The read path and setState both work; nothing on the Strands side can write state back.",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        agentId: "readonly-state-agent-context",
        title: "Agent Read-Only Context",
        docPath: "/strands-typescript/shared-state/agent-readonly",
        summary:
          "useAgentContext as a one-way UI-to-agent channel — props for the agent, with no setter.",
        status: "broken",
        statusNote:
          "Context entries reach the model. The page credits a `CopilotKitMiddleware` that this adapter does not have — see the doc gaps.",
      },
      {
        path: "/shared-state/in-app-agent-read",
        hasDemo: true,
        agentId: "languageAgent",
        title: "Reading agent state",
        docPath: "/strands-typescript/shared-state/in-app-agent-read",
        summary:
          "Reading agent.state in your own components, against the one Strands agent the docs wire to state.",
        status: "working",
        statusNote:
          "The page's own agentId contradicts its own backend; this route addresses the agent the backend actually names.",
      },
      {
        path: "/shared-state/in-app-agent-write",
        hasDemo: true,
        agentId: "languageAgent",
        title: "Writing agent state",
        docPath: "/strands-typescript/shared-state/in-app-agent-write",
        summary:
          "agent.setState writing back, folded into the prompt by the config's stateContextBuilder.",
        status: "working",
      },
    ],
  },
  {
    title: "Multi-Agent",
    routes: [
      {
        path: "/multi-agent/subagents",
        hasDemo: true,
        agentId: "subagents",
        title: "Sub-Agents",
        docPath: "/strands-typescript/multi-agent/subagents",
        summary:
          "A supervisor delegating to research, writing and critique sub-agents, with a live delegation log.",
        status: "working",
        statusNote:
          "Three placeholders in one page: the setup, the sub-agent definitions, and the delegation tools. Only the log component survives, and it references four types it never imports.",
      },
    ],
  },
  {
    title: "Agent Config",
    routes: [
      {
        path: "/agent-config",
        hasDemo: true,
        agentId: "agent-config-demo",
        title: "Agent Config",
        docPath: "/strands-typescript/agent-config",
        summary:
          "A typed config object the UI owns, published with useAgentContext; the Strands adapter shows it to the model on every call.",
        status: "working",
        statusNote:
          "Runs the page's demo Code tab unchanged on its own runtime, plus the page's withStateContext and ShowcaseStrandsAgent. The adapter (0.3.0) handles the context itself. withStateContext's formatPreferencesBlock call is commented out because it is unpublished, and this route doesn't use it.",
      },
    ],
  },
  {
    title: "AWS Strands (TypeScript)",
    routes: [
      {
        path: "/copilot-runtime",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "Copilot Runtime",
        docPath: "/strands-typescript/copilot-runtime",
        summary:
          "This repo's live runtime config, every agent it routes to, and a raw AG-UI event capture.",
        status: "working",
      },
      {
        path: "/ag-ui",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "AG-UI",
        docPath: "/strands-typescript/ag-ui",
        summary:
          "useAgent as the AbstractAgent handle, and agent.subscribe walking the full event stream live.",
        status: "working",
      },
      {
        path: "/deploy-agentcore",
        title: "AWS AgentCore",
        docPath: "/strands-typescript/deploy-agentcore",
        summary:
          "Putting a CopilotKit runtime in front of an agent hosted on Bedrock AgentCore: the CLI/CDK template, or an HttpAgent plus a custom runner aimed at /invocations.",
        status: "reference",
        statusNote:
          "Needs an AWS account (CDK, Cognito, AgentCore Runtime) — not testable locally. Page code kept byte-exact in backend/docs_verbatim/deploy-agentcore/ and shown, not run.",
      },
      {
        path: "/troubleshooting/migrate-to-v2",
        title: "Migrate to V2",
        docPath: "/strands-typescript/troubleshooting/migrate-to-v2",
        summary:
          "Migration notes for moving a v1 frontend onto @copilotkit/react-core/v2, checked against this repo.",
        status: "reference",
        statusNote:
          "Troubleshooting page, shown as reference. This repo is already on v2; its frontend's @ag-ui/client ^1.0.3 does not match the 1.0.2 the runtime depends on, which is the duplicate the guide warns about.",
      },
      {
        path: "/troubleshooting/migrate-to-1.10.X",
        title: "Migrate to 1.10.X",
        docPath: "/strands-typescript/troubleshooting/migrate-to-1.10.X",
        summary:
          "v1-era notes: plain-object messages, generativeUI on custom assistant messages, and the useCopilotChatHeadless_c hook.",
        status: "reference",
        statusNote:
          "Troubleshooting page, shown as reference. Every snippet is v1 (@copilotkit/react-ui, message classes) and none of them applies to this v2 repo as written.",
      },
    ],
  },
  {
    title: "Doc Sync",
    routes: [
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/strands-typescript",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
