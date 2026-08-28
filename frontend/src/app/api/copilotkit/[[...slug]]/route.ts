import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

import { AGENT_IDS, A2UI_DYNAMIC_AGENT_ID, agentUrl } from "@/lib/agents";

// The Quickstart's runtime, widened from one agent to the whole registry.
//
// The published block is now a catch-all — `app/api/copilotkit/[[...slug]]/route.ts`
// — built with `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2` and
// exporting the same handler as both GET and POST. That replaces the older
// `copilotRuntimeNextJSAppRouterEndpoint` + `ExperimentalEmptyAdapter` pairing:
// the v2 handler routes the runtime's own sub-paths (`/info`, `/agent/:id/run`,
// `/transcribe`) underneath `basePath`, which a single non-catch-all route
// cannot do. The provider's `useSingleEndpoint={false}` is the client half of
// the same change.
//
// It registers `strands_agent: new HttpAgent({ url: "http://localhost:8000" })`
// because it has exactly one agent and `createStrandsApp(aguiAgent, { path: "/" })`
// puts it at the server root. This harness has one agent per doc route, so the
// Node server gives each its own app and mounts it at `/{agent_id}` — hence the
// trailing slash that `agentUrl()` adds. The ids are the same strings the
// routes pass as `agentId`.
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
/**
 * `new CopilotRuntime` directly, not `createRuntime` — SSE mode on purpose.
 *
 * `createRuntime` attaches Intelligence whenever a key is present, and the
 * client starts a thread adapter for EVERY agent an Intelligence runtime
 * advertises: a list fetch, a subscribe, and a WebSocket that retries on
 * failure — on every page, chat or not. This runtime advertises 25, so routing
 * it through `createRuntime` meant ~25 retrying sockets per page load, enough
 * to lock up a machine in dev.
 *
 * The Rich Threads routes use `/api/copilotkit-threads`, which registers one
 * agent and is the only endpoint that calls `createRuntime`.
 */
const runtime = new CopilotRuntime({
  agents,
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
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
