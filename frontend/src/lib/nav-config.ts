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

export const DOC_SYNC_DATE = "2026-08-10";
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
          "The bring-your-own-agent path: a Strands Agent wrapped in StrandsAgent, served by createStrandsApp over Express, reached over HTTP by the Copilot Runtime.",
        status: "working",
        statusNote:
          "The one page whose backend is published end to end. Its model id is not — see the doc gaps below.",
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
        hasDemo: false,
        agentId: "a2ui-fixed-schema",
        title: "A2UI · Fixed Schema",
        docPath: "/strands-typescript/generative-ui/a2ui/fixed-schema",
        summary:
          "A flight card whose component tree is authored as JSON up front; the tool supplies only the data.",
        status: "broken",
        statusNote:
          "The tool that returns the operations container IS published — but it reads its component tree from a JSON file that is not. No tree, no card, no demo.",
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
        status: "working",
        statusNote:
          "useFrontendTool registers exactly as the page shows, and the adapter's proxy-tool sync gets it to the model. The page never explains that step.",
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
          "Pattern 1 works. Pattern 2 (`useInterrupt`) is LangGraph-only and does not apply to Strands — half the page is inert here.",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        agentId: "programmatic-control",
        title: "Programmatic Control",
        docPath: "/strands-typescript/programmatic-control",
        summary:
          "Driving runs from code with addMessage, runAgent, stopAgent and subscribe — no chat component.",
        status: "partial",
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
        status: "partial",
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
        status: "working",
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
        status: "broken",
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
        agentId: "agent-config",
        title: "Agent Config",
        docPath: "/strands-typescript/agent-config",
        summary:
          "A typed config object the UI owns, published with useAgentContext and rebuilt into the system prompt each turn.",
        status: "partial",
        statusNote:
          "The UI half is the page's, verbatim, and the agent obeys it. The backend half the page shows is LangGraph Python under a generic `backend/agent.py` label.",
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
