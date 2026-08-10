/**
 * Every agent this server serves, and where it is mounted.
 *
 * The key is the id the Copilot Runtime registers and the frontend passes as
 * `agentId`. `mountPath` defaults to `/{id}`; only Voice differs, because its
 * doc page points its `HttpAgent` at `${AGENT_URL}/voice/` while naming the
 * agent `voice-demo`.
 *
 * `gaps` is the backend-side half of `frontend/src/lib/doc-gaps.ts`. The server
 * exposes it at `GET /gaps` so the two lists can be checked against each other
 * without reading both files. They are maintained by hand.
 */

import type { StrandsAgent } from "@ag-ui/aws-strands";

import { CHAT_AGENT_SPECS, buildChatAgent } from "./chat-agents";
import { buildLanguageAgent, buildStateMirrorAgent } from "./state-agents";
import { buildA2uiDynamicAgent } from "./a2ui-dynamic-agent";

export interface RegistryEntry {
  id: string;
  /** Path this agent's Express app is mounted at. Defaults to `/{id}`. */
  mountPath: string;
  build: () => Promise<StrandsAgent>;
  /** What the docs do not publish for this agent, in one line each. */
  gaps: string[];
}

const NO_TOOLS =
  "No Strands TypeScript page passes a populated `tools=` to a Strands Agent, so this agent has none.";
const SETUP_SKIPPED =
  "The page's backend section is the literal `<!-- setup skipped: … is not bundled for strands-typescript -->` placeholder.";

const TOOL_RENDERING_GAPS = [
  "`get_weather` runs here, but its definition was supplied separately — the doc page prints `<!-- snippet skipped: region 'weather-tool-backend' -->` where it should be.",
  "`getWeatherImpl` is not published either; only its return shape is recoverable, from the `WeatherResult` interface in the published frontend `page.tsx`.",
  "`search_flights` has no published tool and no impl, so the page's second named renderer stays idle.",
];

function chatEntries(): RegistryEntry[] {
  return CHAT_AGENT_SPECS.map((spec) => ({
    id: spec.name,
    mountPath: `/${spec.name}`,
    build: () => buildChatAgent(spec),
    gaps: spec.name === "tool-rendering" ? TOOL_RENDERING_GAPS : [NO_TOOLS],
  }));
}

export const REGISTRY: RegistryEntry[] = [
  ...chatEntries(),

  {
    id: "languageAgent",
    mountPath: "/languageAgent",
    build: buildLanguageAgent,
    gaps: [
      "The read page addresses `strands_agent`; this backend — printed on that same page — names the agent `languageAgent`. Mounted once here, under the published name.",
    ],
  },
  {
    id: "shared-state-read-write",
    mountPath: "/shared-state-read-write",
    build: buildStateMirrorAgent,
    gaps: [
      "Render-state-in-your-app publishes no backend at all; this agent's `stateContextBuilder` generalises the Shared State pages' published one.",
      "Nothing on the Strands TypeScript side can write state back — that needs a tool with `ToolBehavior.stateFromArgs`, which no page publishes.",
    ],
  },
  {
    id: "declarative-gen-ui",
    mountPath: "/declarative-gen-ui",
    build: buildA2uiDynamicAgent,
    gaps: [
      "Runs `buildA2uiDynamicAgent` from the published `agent.ts` — the only factory in that file whose dependencies are all inline. `createModel` is substituted with the Quickstart's published model construction.",
    ],
  },
];

/**
 * Ids named by a doc page that this server does NOT serve, and why.
 *
 * `GET /gaps` reports these alongside the live registry so a missing agent
 * reads as a documented decision rather than an oversight.
 */
export const UNSERVED: { id: string; reason: string }[] = [
  {
    id: "a2ui-fixed-schema",
    reason:
      "`buildA2uiFixedSchemaAgent` is published in full, including the `display_flight` tool body, but it reads its component tree from `./a2ui_schemas/flight_schema.json` — a file no page publishes. Without the tree there is nothing to render.",
  },
  {
    id: "voice_agent / byoc_hashbrown / byoc_json_render",
    reason:
      "Published in `agent.ts` but each depends on a prompt constant from the unpublished `./prompts` module. The Voice route uses the Quickstart-shaped `voice-demo` agent instead.",
  },
  {
    id: "strands_agent (showcase build)",
    reason:
      "`buildShowcaseAgent` needs `SHOWCASE_TOOLS` from `./tools` and six symbols from `./state`, none published. The `strands_agent` served here is the Quickstart's, not the showcase's.",
  },
];
