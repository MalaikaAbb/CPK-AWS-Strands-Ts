import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

import {
  A2UI_DYNAMIC_AGENT_ID,
  A2UI_DYNAMIC_CATALOG_ID,
  agentUrl,
} from "@/lib/agents";

// A second runtime for the A2UI dynamic-schema route, matching the doc's
// `runtimeUrl="/api/copilotkit-declarative-gen-ui"`.
//
// The `a2ui` block is the one the published `agent.ts` names in its own
// comment: it says this route sets
// `a2ui: { injectA2UITool: true, defaultCatalogId: "declarative-gen-ui-catalog" }`,
// that the runtime forwards the flag, and that the adapter then auto-injects
// `generate_a2ui` and drives a secondary render planner. The doc *page* takes
// the other path — pass a catalog on the provider and the runtime needs no
// config at all — and says so. Both are wired: the provider carries the
// catalog, and this block matches the backend's own description of itself.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    [A2UI_DYNAMIC_AGENT_ID]: new HttpAgent({
      url: agentUrl(A2UI_DYNAMIC_AGENT_ID),
    }),
  },
  a2ui: {
    injectA2UITool: true,
    defaultCatalogId: A2UI_DYNAMIC_CATALOG_ID,
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit-declarative-gen-ui",
  });

  return handleRequest(req);
};
