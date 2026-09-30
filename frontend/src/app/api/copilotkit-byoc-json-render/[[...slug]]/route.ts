import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

import { agentUrl } from "@/lib/agents";
import { createRuntime } from "@/lib/intelligence";

// Harness-authored. The JSON Render page's frontend points at
// `runtimeUrl="/api/copilotkit-byoc-json-render"` with
// `agent="byoc_json_render"`, but no page shows this route. It is the same
// catch-all + `createCopilotRuntimeHandler` shape as the repo's other runtimes,
// with one agent and no extra middleware.
const runtime = createRuntime({
  agents: {
    byoc_json_render: new HttpAgent({
      url: agentUrl("byoc_json_render"),
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-byoc-json-render",
});

// GET, POST, PATCH and DELETE, for the reason given in the declarative-gen-ui
// route next door: the threads client uses all four.
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
