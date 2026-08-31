"use client";

import { CopilotSidebar, useAgent } from "@copilotkit/react-core/v2";
import { useEffect } from "react";

import { DemoFrame } from "@/components/demo-frame";

type AgentState = {
  language: "english" | "spanish";
};

function YourMainContent() {
  const { agent } = useAgent({ agentId: "languageAgent" });

      useEffect(() => {
      if (agent.state.language === undefined) {
        agent.setState({ language: "spanish" } satisfies AgentState);
      }
    }, [agent]);

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

  