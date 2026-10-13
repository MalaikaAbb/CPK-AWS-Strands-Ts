// Harness note — the Agent Config demo Code tab's
// `src/app/api/copilotkit-agent-config/route.ts`, reproduced. One departure:
// the published `HttpAgent` points at `${AGENT_URL}/`, the root of the docs'
// single-agent server. This harness serves every agent from one process at its
// own id, so the URL is `${AGENT_URL}/agent-config-demo/` (see
// `backend/src/agents/agent-config-agent.ts`). Everything below the next blank
// line is the published file otherwise unchanged, comments included — the
// header's mention of `<CopilotKitProvider properties={...}>` describes the
// older branch of the page, not the `useAgentContext` relay the demo now uses.

// Dedicated runtime for the Agent Config Object demo.
//
// The page uses <CopilotKitProvider properties={...}> to forward a typed
// config object (tone / expertise / responseLength) to the agent. Scoped to
// its own endpoint so the Playwright spec can assert propagation against a
// single URL.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

function createAgent() {
  return new HttpAgent({ url: `${AGENT_URL}/agent-config-demo/` });
}

const agentConfigAgent = createAgent();
const agents = {
  "agent-config-demo": agentConfigAgent,
  default: agentConfigAgent,
};

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      runtime: new CopilotRuntime({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -- Published CopilotRuntime agents type wraps Record in MaybePromise<NonEmptyRecord<...>> which rejects plain Records; fixed in source, pending release
        agents,
      }),
      basePath: "/api/copilotkit-agent-config",
      mode: "single-route",
    });
    return await copilotHandler(req);
  } catch (error: unknown) {
    const e = error as { message?: string; stack?: string };
    return NextResponse.json(
      { error: e.message, stack: e.stack },
      { status: 500 },
    );
  }
};
