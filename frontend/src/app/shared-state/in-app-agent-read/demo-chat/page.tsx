"use client";

import { CopilotSidebar, useAgent } from "@copilotkit/react-core/v2";
import { useEffect } from "react";

import { DemoFrame } from "@/components/demo-frame";

type AgentState = {
  language: "english" | "spanish";
};

function YourMainContent() {
const { agent, isReady } = useAgent({
    agentId: "languageAgent",
  });
  const state = (agent.state ?? {}) as Partial<AgentState>;
  useEffect(() => {
if (!isReady || state.language !== undefined) return;
    agent.setState({ ...(agent.state ?? {}), language: "spanish" });
  }, [agent, isReady, state.language]);


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

  