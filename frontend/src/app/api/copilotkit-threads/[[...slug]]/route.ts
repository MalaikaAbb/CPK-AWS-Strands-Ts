import { HttpAgent } from "@ag-ui/client";
import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

import { THREADS_AGENT_ID, agentUrl } from "@/lib/agents";
import { createRuntime } from "@/lib/intelligence";

/**
 * The only endpoint that calls `createRuntime`, and the only one registering a
 * single agent. Those two facts are the same decision.
 *
 * `createRuntime` attaches Intelligence when a key is configured, and the
 * client then starts a thread adapter for EVERY agent that runtime advertises
 * on `/info` — a `GET /threads?agentId=…`, a `POST /threads/subscribe`, and a
 * WebSocket that retries on failure (`MAX_SOCKET_RETRIES = 5`, 15s timeout) —
 * on every page, whether or not it mounts a chat.
 *
 * The app-wide runtime advertises 25 agents. Routing it through `createRuntime`
 * meant ~25 list fetches and 25 retrying sockets per page load, which is enough
 * to lock up a machine in dev, where Next also mirrors every browser warning
 * back to the server. Here it advertises one, and only the Rich Threads routes
 * talk to it.
 */
const runtime = createRuntime({
  agents: {
    [THREADS_AGENT_ID]: new HttpAgent({ url: agentUrl(THREADS_AGENT_ID) }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-threads",
});

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as DELETE,
};
