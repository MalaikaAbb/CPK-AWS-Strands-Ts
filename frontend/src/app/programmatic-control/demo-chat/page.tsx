"use client";


import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";


const AGENT_ID = "programmatic-control";


export default function Page() {
  const agentId = AGENT_ID;
  const { agent } = useAgent({ agentId });
  const { copilotkit } = useCopilotKit();
  const run = async () => {
    if (agent.isRunning) return;
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: "Summarize the latest sales data",
    });
    try {
      await copilotkit.runAgent({ agent });
    } catch (error) {
      console.error("CopilotKit runAgent failed:", error);
    }
  };
  return (
    <>
    <CopilotSidebar agentId={AGENT_ID} />
      <button onClick={run} disabled={agent.isRunning}>
        Run agent
      </button>
      <button
        onClick={() => copilotkit.stopAgent({ agent })}
        disabled={!agent.isRunning}
      >
        Stop
      </button>
    </>
  );
}
