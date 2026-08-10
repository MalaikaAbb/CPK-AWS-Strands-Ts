"use client";

import { CopilotSidebar, useAgent } from "@copilotkit/react-core/v2";
import { useEffect } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The read page's `ui/app/page.tsx`, reproduced with one correction.
 *
 * The doc's snippet is:
 *
 *     const { agent } = useAgent({
 *       agentId: "strands_agent",
 *       initialState: { language: "spanish" }
 *     });
 *
 * `strands_agent` is an id this page never defines. The backend printed
 * directly above it — the same `agent/main.ts` the write page prints — names
 * the agent `languageAgent`, and the write page's frontend uses that. So the
 * id here is `languageAgent`, which is the one the backend actually serves.
 * Everything else, including `initialState: { language: "spanish" }`, is the
 * page's.
 *
 * `initialState` does not exist. Both Shared State pages pass
 * `initialState: { language: "spanish" }` to `useAgent` and annotate it
 * "optionally provide a type-safe initial state". `UseAgentProps` accepts
 * `agentId`, `threadId`, `runtimeAgentId`, `updates` and `throttleMs` — and
 * nothing else (checked against @copilotkit/react-core 1.66.4). Passing it is
 * a type error, and at runtime the state simply stays empty. The effect below
 * seeds it with `agent.setState` instead, which is the API that does exist.
 */

// Define the agent state type to match your Strands agent
//
// Declared by the doc page and applied by nothing: `useAgent` takes no type
// parameter (its published signature is `useAgent(props?): { agent:
// AbstractAgent, ... }`), so `agent.state` stays untyped and this alias is
// decorative. Kept because the page declares it; read through it below.
type AgentState = {
  language: "english" | "spanish";
};

function YourMainContent() {
  const { agent } = useAgent({ agentId: "languageAgent" });

  

  return (
    <div className="h-full overflow-y-auto p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Your main content
      </h1>
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
        Language: {(agent.state as AgentState | undefined)?.language}
      </p>
      
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/in-app-agent-read"
      subtitle="agent: languageAgent"
    >
      <YourMainContent />
      <CopilotSidebar agentId="languageAgent" defaultOpen />
    </DemoFrame>
  );
}
