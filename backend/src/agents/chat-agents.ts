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
   * `tools.ts` for the exception and where its code came from.
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
    name: "programmatic-control",
    description: "Backs Programmatic Control.",
    systemPrompt: USE_FRONTEND_TOOLS,
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
  {
    name: "agent-config",
    description: "Backs Agent Config.",
    systemPrompt:
      "You are a helpful AI assistant. The application publishes response " +
      "preferences (tone, expertise, response length) as context. Obey them " +
      "on every reply.",
  },
  {
    name: "subagents",
    description:
      "Backs Sub-Agents. Has no delegation tools — the page never publishes " +
      "them.",
    systemPrompt:
      "You are a supervisor assistant coordinating research, writing, and " +
      "critique work.",
  },
];

// The agents that are NOT the Quickstart shape live elsewhere, because their
// published shape is different: `state-agents.ts` (Shared State pages, which
// add a `StrandsAgentConfig`) and `a2ui-dynamic-agent.ts` (the one factory in
// the published `agent.ts` this repo can run).
