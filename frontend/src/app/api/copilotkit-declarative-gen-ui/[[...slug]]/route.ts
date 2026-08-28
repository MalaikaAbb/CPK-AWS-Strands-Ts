import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

import {
  A2UI_DYNAMIC_AGENT_ID,
  A2UI_DYNAMIC_CATALOG_ID,
  agentUrl,
} from "@/lib/agents";
import { createRuntime } from "@/lib/intelligence";

// A second runtime for the A2UI dynamic-schema route, matching the doc's
// `runtimeUrl="/api/copilotkit-declarative-gen-ui"`.
//
// Converted to the same catch-all + `createCopilotRuntimeHandler` shape the
// Quickstart now publishes, so all three runtimes in this repo are built the
// same way and all three carry Intelligence.
//
// The `a2ui` block is the one the published `agent.ts` names in its own
// comment: it says this route sets
// `a2ui: { injectA2UITool: true, defaultCatalogId: "declarative-gen-ui-catalog" }`,
// that the runtime forwards the flag, and that the adapter then auto-injects
// `generate_a2ui` and drives a secondary render planner. The doc *page* takes
// the other path — pass a catalog on the provider and the runtime needs no
// config at all — and says so. Both are wired: the provider carries the
// catalog, and this block matches the backend's own description of itself.
const runtime = createRuntime({
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

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-declarative-gen-ui",
});

// The published Quickstart block ends with exactly two exports:
//
//     export const GET = handler;
//     export const POST = handler;
//
// That is enough for chat and for `/info`, and it silently breaks Rich Threads.
// Next.js answers any verb a route does not export with a 405, and the threads
// client uses four: GET and POST to list and connect, PATCH to rename and
// archive, DELETE to delete. Follow the Quickstart literally and every thread
// mutation fails with `Request failed: 405` — while chat keeps working, so the
// runtime looks healthy.
//
// Verified against @copilotkit/core 1.69.0: its request layer issues GET,
// POST, PATCH and DELETE. It never issues PUT, so PUT is not exported here
// even though the Voice page's published route exports one.
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
