/**
 * The agent ids this app can address.
 *
 * Mirrors the keys of `REGISTRY` in `backend/src/agents/registry.ts`, which is
 * also where each agent is mounted: id `tool-rendering` is served at
 * `${AGENT_URL}/tool-rendering/`. Keeping the list here rather than fetching it
 * means the runtime route can be built synchronously at module load.
 *
 * If you add an agent to the backend registry, add its id here too — the
 * `/copilot-runtime` route cross-checks the two lists at runtime and reports
 * any drift.
 */

export const AGENT_IDS = [
  "strands_agent",
  "agentic_chat",
  "prebuilt-sidebar",
  "prebuilt-popup",
  "chat-controls",
  "chat-customization-css",
  "chat-slots",
  "headless-simple",
  "headless-complete",
  "multimodal",
  "voice-demo",
  "gen-ui-tool-based",
  "tool-rendering",
  "gen-ui-display-only",
  "gen-ui-interactive",
  "frontend-tools",
  "hitl-in-chat",
  "programmatic-control",
  "readonly-state-agent-context",
  "agent-config",
  "subagents",
  "languageAgent",
  "shared-state-read-write",
  "declarative-gen-ui",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

/** Where the Node agent server is listening. */
export const AGENT_URL = process.env.AGENT_URL ?? "http://localhost:8000";

/**
 * The AG-UI endpoint for an agent.
 *
 * Trailing slash on purpose. `server.ts` gives each agent its own
 * `createStrandsApp(..., { path: "/" })` and mounts it at `/{id}`, so the AG-UI
 * root for that agent is `/{id}/`. The Voice doc page writes its `HttpAgent`
 * URL the same way (`${AGENT_URL}/voice/`).
 */
export function agentUrl(id: string): string {
  return `${AGENT_URL}/${id}/`;
}

/**
 * The agent the Voice route talks to.
 *
 * Its doc page names the agent `voice-demo` on the provider but points the
 * `HttpAgent` at `${AGENT_URL}/voice/`. This harness mounts it at
 * `/voice-demo/` so the id and the path agree; the mismatch is a doc detail,
 * not a contract.
 */
export const VOICE_AGENT_ID = "voice-demo";

/** The agent the A2UI dynamic-schema route scopes its own runtime to. */
export const A2UI_DYNAMIC_AGENT_ID = "declarative-gen-ui";

/**
 * The catalog id the backend stamps into generated A2UI surfaces.
 *
 * Published in `agent.ts` as `A2UI_DYNAMIC_CATALOG_ID`. The frontend catalog
 * must declare the same id or nothing renders.
 */
export const A2UI_DYNAMIC_CATALOG_ID = "declarative-gen-ui-catalog";
