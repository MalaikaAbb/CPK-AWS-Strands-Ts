import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

import { agentUrl } from "@/lib/agents";

// Harness glue for the Components and surfaces overview: the same one-agent
// shape as /api/copilotkit-genui, pointed at the `genui-overview` Strands
// agent (the page's prompt, no repo-authored `search_products`). It stands in
// for the page's runtime, whose agent is a TanStack BuiltInAgent.
const runtime = new CopilotRuntime({
  agents: { default: new HttpAgent({ url: agentUrl("genui-overview") }) },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-genui-overview",
});

export const GET = handler;
export const POST = handler;
