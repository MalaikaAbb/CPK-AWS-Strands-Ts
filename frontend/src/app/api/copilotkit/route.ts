import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

import {
  AGENT_IDS,
  A2UI_DYNAMIC_AGENT_ID,
  A2UI_FIXED_AGENT_ID,
  agentUrl,
} from "@/lib/agents";

// The Quickstart's runtime, widened from one agent to the whole registry.
//
// It registers `strands_agent: new HttpAgent({ url: "http://localhost:8000" })`
// because it has exactly one agent and `createStrandsApp(aguiAgent, { path: "/" })`
// puts it at the server root. This harness has one agent per doc route, so the
// Node server gives each its own app and mounts it at `/{agent_id}` — hence the
// trailing slash that `agentUrl()` adds. The ids are the same strings the
// routes pass as `agentId`.
const serviceAdapter = new ExperimentalEmptyAdapter();

const agents = Object.fromEntries(
  // The A2UI dynamic-schema agent deliberately does not go through this
  // runtime — it has its own at /api/copilotkit-declarative-gen-ui, where the
  // catalog on the provider is what turns A2UI on.
  AGENT_IDS.filter((id) => id !== A2UI_DYNAMIC_AGENT_ID).map((id) => [
    id,
    new HttpAgent({ url: agentUrl(id) }),
  ]),
);

// A2UI, scoped to the fixed-schema agent with tool injection off — exactly as
// the Copilot Runtime page and the fixed-schema page both describe it.
//
// `injectA2UITool: false` is the load-bearing half: that agent owns its own
// `display_flight` tool and returns the operations container itself, so it must
// not also be handed a `generate_a2ui` tool. The middleware still detects the
// envelope in the tool result and paints the surface.
//
// Scoped with `agents: [...]` rather than applied globally, so the other 23
// agents on this runtime are untouched. The dynamic-schema agent is excluded
// from this runtime entirely — it has its own endpoint, where injection is on.
const runtime = new CopilotRuntime({
  agents,
  a2ui: { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
