/**
 * The plain chat agents.
 *
 * Every one of these is the Quickstart's TypeScript `main.ts` with a different
 * `name` and `systemPrompt`:
 *
 *     const agent = new Agent({ model, systemPrompt: "..." });
 *     await agent.initialize();
 *     const aguiAgent = new StrandsAgent({ agent, name: "strands_agent" });
 *
 * Note what is absent: `tools`. That is not an omission — no page in the
 * Strands TypeScript doc tree ever passes a populated `tools=` to a Strands
 * `Agent`. The published `agent.ts` does (`tools: SHOWCASE_TOOLS`), but
 * `SHOWCASE_TOOLS` comes from `./tools`, which is published nowhere. See
 * `backend/docs_verbatim/README.md`.
 *
 * Frontend tools are a different channel and do reach these agents: the
 * adapter's `syncProxyTools` registers CopilotKit's forwarded tool
 * declarations onto the Strands tool registry per run. No doc page says so.
 *
 * System prompts here are this repo's, kept to one line each and describing
 * only what the route under test needs. The docs' own prompt constants
 * (`SYSTEM_PROMPT`, `VOICE_SYSTEM_PROMPT`, …) live in the unpublished
 * `./prompts` module, so there is nothing to copy.
 */

import { Agent, type ToolList } from "@strands-agents/sdk";
import { StrandsAgent } from "@ag-ui/aws-strands";

import { createModel } from "./model";
import { TOOL_RENDERING_TOOLS } from "./tools";
import { GENUI_TOOLS } from "./genui-tools";

export interface ChatAgentSpec {
  name: string;
  description: string;
  systemPrompt: string;
  /** `"chat"` forces the Chat Completions adapter — see `model.ts`. */
  api?: "chat" | "responses";
  /**
   * Backend tools, for the one agent that has any.
   *
   * Left undefined everywhere else, which is the honest default: no Strands
   * TypeScript page passes a populated `tools=` to a Strands `Agent`. See
   * `tools.ts` and `genui-tools.ts` for the two exceptions and where their
   * code came from.
   */
  tools?: ToolList;
}

export async function buildChatAgent(spec: ChatAgentSpec): Promise<StrandsAgent> {
  const agent = new Agent({
    model: createModel({ api: spec.api }),
    systemPrompt: spec.systemPrompt,
    ...(spec.tools ? { tools: spec.tools } : {}),
  });

  await agent.initialize();

  return new StrandsAgent({
    agent,
    name: spec.name,
    description: spec.description,
  });
}

const HELPFUL = "You are a helpful AI assistant.";

/**
 * The system prompt every frontend-tool route gets.
 *
 * The agent cannot see a tool list at construction time — the forwarded tools
 * arrive per run — so the prompt says "use the tools you have" rather than
 * naming any. Naming tools that may not be forwarded is how you get an agent
 * that hallucinates a call.
 */
const USE_FRONTEND_TOOLS =
  "You are a helpful AI assistant embedded in a web application. " +
  "The application registers tools with you at the start of every turn. " +
  "When the user asks for something one of those tools can do, call it " +
  "rather than describing what you would do. Never claim to have done " +
  "something you did not call a tool for.";

export const CHAT_AGENT_SPECS: ChatAgentSpec[] = [
  // Getting Started — the Quickstart's own agent, name and all.
  {
    name: "strands_agent",
    description: "The Quickstart agent, verbatim.",
    systemPrompt: HELPFUL,
  },

  // Prebuilt components. The doc pages name these agent ids on their
  // `<CopilotKit agent="...">`; the backend halves are not published, so each
  // is the Quickstart agent under the id the page uses.
  {
    name: "agentic_chat",
    description: "Backs the CopilotChat page.",
    systemPrompt: HELPFUL,
  },
  {
    name: "prebuilt-sidebar",
    description: "Backs the CopilotSidebar page.",
    systemPrompt: HELPFUL,
  },
  {
    name: "prebuilt-popup",
    description: "Backs the CopilotPopup page.",
    systemPrompt: HELPFUL,
  },
  {
    name: "chat-controls",
    description: "Backs the open/close/feedback page.",
    systemPrompt: HELPFUL,
  },

  // Custom look and feel — pure presentation, so a plain assistant is enough.
  {
    name: "chat-customization-css",
    description: "Backs the CSS customization page.",
    systemPrompt: HELPFUL,
  },
  {
    name: "chat-slots",
    description: "Backs the slots page.",
    systemPrompt: HELPFUL,
  },
  {
    name: "chat-markdown",
    description: "Backs the Markdown Rendering page.",
    systemPrompt: HELPFUL,
  },
  {
    name: "headless-simple",
    description: "Backs the minimal headless chat.",
    systemPrompt: HELPFUL,
  },
  {
    name: "headless-complete",
    description: "Backs the complete headless chat and Programmatic Control.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },

  // Input modalities.
  {
    name: "multimodal",
    description: "Backs the multimodal attachments page.",
    systemPrompt:
      "You are a helpful AI assistant. Users may attach images, documents, " +
      "or video to their messages. Describe what you were sent, in detail, " +
      "before answering.",
  },
  {
    // The Voice page's runtime route names this agent `voice-demo` and points
    // its HttpAgent at `${AGENT_URL}/voice/`, so the id and the mount path
    // differ. `registry.ts` carries that split.
    name: "voice-demo",
    description: "Backs the voice page. Tool-free, per the doc's own note.",
    systemPrompt:
      "You are a helpful AI assistant answering spoken questions. Keep " +
      "replies short enough to be read aloud.",
  },

  // Generative UI driven by frontend-registered components.
  {
    name: "gen-ui-tool-based",
    description: "Backs Components as Tools.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },
  {
    name: "tool-rendering",
    description:
      "Backs Tool Call Rendering. Has get_weather; search_flights is still " +
      "unpublished, so that renderer stays idle.",
    systemPrompt:
      "You are a helpful AI assistant with a weather tool. When the user asks " +
      "about the weather anywhere, call `get_weather` with that location " +
      "rather than answering from memory — the app draws the result as a card, " +
      "so keep your own reply to one short sentence and do not restate the " +
      "numbers. You have no flight-search tool; say so plainly if asked.",
    tools: TOOL_RENDERING_TOOLS,
  },
  {
    name: "gen-ui-display-only",
    description: "Backs Your Components · Display-only.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },
  {
    name: "gen-ui-interactive",
    description: "Backs Your Components · Interactive.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },

  // Components and surfaces (A2UI 1.0). The `render_ui` tool and the catalog
  // guide arrive per run from the runtime and the provider; the adapter hands
  // both to the model. The first sentence is the system prompt the Components
  // overview page gives its agent; the second is this repo's, because the
  // Catalogs page's ProductCard says to copy values from a tool result.
  // Components and surfaces overview. The page's agent is a TanStack
  // `BuiltInAgent` factory; this repo runs its own Strands agent instead, with
  // the factory's one-line prompt verbatim and no tools of its own (the page's
  // factory adds none besides the run's `render_ui`).
  {
    name: "genui-overview",
    description: "Backs the Components and surfaces overview.",
    systemPrompt:
      "You are a helpful assistant. When a visual answer helps, render it with generative UI.",
  },
  {
    name: "genui",
    description: "Backs the Components and surfaces pages.",
    systemPrompt:
      "You are a helpful assistant. When a visual answer helps, render it with generative UI. " +
      "When the user asks about products, call `search_products` first and copy its values into the props the component declares; " +
      "leave out any value the component has no prop for. " +
      "Use it only for products: render charts and other data yourself, and never give up on the rest of a request because a search came back empty. " +
      "In `render_ui` operations, put each prop directly on the component node next to `id` and `component`; never nest props under a `props` key.",
    tools: GENUI_TOOLS,
  },

  // WebMCP — the page's frontend tool is the only tool.
  {
    name: "webmcp",
    description: "Backs the WebMCP page.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },

  // App control.
  {
    name: "frontend-tools",
    description: "Backs the Frontend Tools page.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },
  {
    name: "hitl-in-chat",
    description: "Backs Human in the Loop.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },
  {
    name: "governed-actions",
    description: "Backs the Governed Action Approval UI page.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },
  {
    name: "programmatic-control",
    description: "Backs Programmatic Control.",
    systemPrompt: USE_FRONTEND_TOOLS,
  },

  // Rich Threads. One agent for all four thread routes, because `useThreads`
  // lists per agent — giving the thread pages their own keeps their history
  // out of every other route's list.
  {
    name: "threads-demo",
    description:
      "Backs the Rich Threads routes. Threads themselves live in CopilotKit " +
      "Intelligence, not here.",
    systemPrompt:
      "You are a helpful AI assistant. Keep replies short — these " +
      "conversations exist to be saved, reopened and switched between, so " +
      "the point is the thread, not the answer.",
  },

  // Shared state and context.
  {
    name: "readonly-state-agent-context",
    description: "Backs Agent Read-Only Context.",
    systemPrompt:
      "You are a helpful AI assistant. The application publishes read-only " +
      "context about the current user and their recent activity. Use it when " +
      "answering, and quote it back when asked what you know.",
  },
];

// The agents that are NOT the Quickstart shape live elsewhere, because their
// published shape is different: `state-agents.ts` (Shared State pages, which
// add a `StrandsAgentConfig`), `agent-config-agent.ts` (Agent Config's
// `StrandsAgent` subclass) and `a2ui-dynamic-agent.ts` (the one factory in
// the published `agent.ts` this repo can run).
