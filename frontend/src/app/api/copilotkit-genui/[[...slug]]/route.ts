import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

import { agentUrl } from "@/lib/agents";

// Harness glue — the runtime every Components and surfaces demo points at.
//
// The pages give the provider `runtimeUrl="/api/copilotkit"` and change nothing
// on the runtime: when a run carries a catalog, the runtime adds `render_ui`
// and the guide on its own. No Strands TypeScript page shows a runtime for
// these pages, so this is the Quickstart's runtime shape with one agent, kept
// apart from `/api/copilotkit` so the catalog never reaches the other routes'
// agents. The agent is the Quickstart-shaped `genui` agent, which hands the
// run's tools and context entries to its model through the adapter.
const runtime = new CopilotRuntime({
  agents: { default: new HttpAgent({ url: agentUrl("genui") }) },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-genui",
});

export const GET = handler;
export const POST = handler;
