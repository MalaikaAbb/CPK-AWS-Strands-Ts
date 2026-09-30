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
import { buildSubagentsAgent } from "./subagents-agent";
import { buildA2uiFixedSchemaAgent } from "./a2ui-fixed-agent";
import { buildByocHashbrownAgent } from "./byoc-hashbrown-agent";
import {
  ANTHROPIC_QUICKSTART_AGENT_ID,
  buildAnthropicQuickstartAgent,
} from "./anthropic-quickstart-agent";

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

const AGENT_CONFIG_GAPS = [
  "The page's backend section is the `setup skipped` placeholder; the alternative it does print is LangGraph Python under a generic `backend/agent.py` label.",
  "`stateContextBuilder` here folds `RunAgentInput.context[]` into the prompt — the channel both context pages describe and neither publishes. Supplied separately; see `agent-context.ts`.",
];

const TOOL_RENDERING_GAPS = [
  "`get_weather` runs here, but its definition was supplied separately — the doc page prints `<!-- snippet skipped: region 'weather-tool-backend' -->` where it should be.",
  "`getWeatherImpl` is not published either; only its return shape is recoverable, from the `WeatherResult` interface in the published frontend `page.tsx`.",
  "`search_flights` has no published tool and no impl, so the page's second named renderer stays idle.",
];

const GOVERNED_ACTIONS_GAPS = [
  "The page publishes no backend half at all — not even the `setup skipped` placeholder the other HITL pages carry. There is no published tool that emits a `GovernedAction`, and no policy engine behind `verdict`.",
  "`executeSideEffect(action.tool, action.arguments)` is called by the page's own `handleApproval` sample and defined nowhere in the doc tree, so the approved branch has no published implementation.",
  "The page's other pattern, `useInterrupt`, needs a runtime that raises AG-UI interrupts. Nothing on the Strands TypeScript side does, and this page publishes no backend that would.",
];

const HAS_ANTHROPIC_KEY = Boolean(process.env.ANTHROPIC_API_KEY);

function chatEntries(): RegistryEntry[] {
  return CHAT_AGENT_SPECS.map((spec) => ({
    id: spec.name,
    mountPath: `/${spec.name}`,
    build: () => buildChatAgent(spec),
    gaps:
      spec.name === "tool-rendering"
        ? TOOL_RENDERING_GAPS
        : spec.name === "agent-config"
          ? AGENT_CONFIG_GAPS
          : spec.name === "governed-actions"
            ? GOVERNED_ACTIONS_GAPS
            : [NO_TOOLS],
  }));
}

export const REGISTRY: RegistryEntry[] = [
  ...chatEntries(),

  // The Quickstart's "Using Anthropic instead" variant of `strands_agent`.
  // Mounted only with a key: `AnthropicModel` throws at construction without
  // one, which would stop the whole server for anyone running OpenAI only.
  ...(HAS_ANTHROPIC_KEY
    ? [
        {
          id: ANTHROPIC_QUICKSTART_AGENT_ID,
          mountPath: `/${ANTHROPIC_QUICKSTART_AGENT_ID}`,
          build: buildAnthropicQuickstartAgent,
          gaps: [NO_TOOLS],
        },
      ]
    : []),

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
    id: "subagents",
    mountPath: "/subagents",
    build: buildSubagentsAgent,
    gaps: [
      "The page's backend section is three placeholders — `setup skipped: subagents-setup`, `snippet skipped: 'subagent-setup'` and `snippet skipped: 'supervisor-delegation-tools'` — so neither the sub-agents nor the delegation tools are published.",
      "`delegation-log.tsx` renders a `delegations` state slot nothing can populate: writing state back needs a tool with `ToolBehavior.stateFromArgs`, which the page's sample calls `makeSubagentStateFromResult` and never publishes.",
    ],
  },
  {
    id: "a2ui-fixed-schema",
    mountPath: "/a2ui-fixed-schema",
    build: buildA2uiFixedSchemaAgent,
    gaps: [
      "Runs `buildA2uiFixedSchemaAgent` from the published `agent.ts` verbatim. The component tree it reads — `a2ui_schemas/flight_schema.json` — is published on no Strands page; this copy is carried over from the Google ADK harness, which ships the identical schema for the identical demo.",
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
  {
    id: "byoc_hashbrown",
    mountPath: "/byoc_hashbrown",
    build: buildByocHashbrownAgent,
    gaps: [
      "Runs `buildByocHashbrownAgent` from the published `agent.ts`. Its `BYOC_HASHBROWN_SYSTEM_PROMPT` comes from the unpublished `./prompts`, so the prompt here is harness-authored.",
      "The prompt asks for Hashbrown's `{ \"ui\": [ { \"Name\": { \"props\": … } } ] }` envelope, not the `{ \"type\": … }` shape the page's example output shows, which a UI kit cannot render.",
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
    id: "voice_agent / byoc_json_render",
    reason:
      "Published in `agent.ts` but each depends on a prompt constant from the unpublished `./prompts` module. The Voice route uses the Quickstart-shaped `voice-demo` agent instead. (`byoc_hashbrown` has the same gap and is served with a harness-authored prompt.)",
  },
  {
    id: "strands_agent (showcase build)",
    reason:
      "`buildShowcaseAgent` needs `SHOWCASE_TOOLS` from `./tools` and six symbols from `./state`, none published. The `strands_agent` served here is the Quickstart's, not the showcase's.",
  },
  ...(HAS_ANTHROPIC_KEY
    ? []
    : [
        {
          id: ANTHROPIC_QUICKSTART_AGENT_ID,
          reason:
            "ANTHROPIC_API_KEY is not set in backend/.env. `AnthropicModel` throws at construction without it, so this agent is left unmounted rather than stopping the server.",
        },
      ]),
];
