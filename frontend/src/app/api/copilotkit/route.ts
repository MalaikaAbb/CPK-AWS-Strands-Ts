import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

import { AGENT_IDS, A2UI_DYNAMIC_AGENT_ID, agentUrl } from "@/lib/agents";

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

// No `a2ui` block here.
//
// The Copilot Runtime page describes `a2ui: { injectA2UITool: false, agents: [...] }`
// as the fixed-schema setup, and the fixed-schema page repeats it — but this
// harness serves no fixed-schema agent, because the component tree that agent
// renders is published nowhere. Registering the middleware for an agent that
// cannot exist would only make the runtime look configured. See the doc gaps on
// /generative-ui/a2ui/fixed-schema.
const runtime = new CopilotRuntime({ agents });

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
