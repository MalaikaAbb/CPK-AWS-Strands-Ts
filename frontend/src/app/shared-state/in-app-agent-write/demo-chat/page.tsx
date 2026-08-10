"use client";

import { CopilotSidebar, useAgent } from "@copilotkit/react-core/v2";
import { useEffect } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The write page's `ui/app/page.tsx`, reproduced verbatim.
 *
 * Unlike its sibling, this page's `agentId` is `languageAgent` — which matches
 * the backend both pages print. Nothing here needed correcting.
 *
 * `agent.setState` is the whole feature: it updates the agent's state and
 * triggers a re-render, and the agent sees the new value on its next turn
 * because the backend's `stateContextBuilder` folds it into the prompt. The
 * page's closing callout is the important part — shared state on Strands is
 * prompt-driven, so the agent knows exactly as much as that builder tells it.
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

  // Stands in for the page's `initialState` option, which the hook does not
  // have. Runs once, and only while the agent still has no state of its own.
  useEffect(() => {
    if (agent.state === undefined) {
      agent.setState({ language: "spanish" } satisfies AgentState);
    }
  }, [agent]);

  const toggleLanguage = () => {
    agent.setState({
      language: (agent.state as AgentState | undefined)?.language === "english" ? "spanish" : "english",
    });
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Your main content
      </h1>
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
        Language: {(agent.state as AgentState | undefined)?.language}
      </p>
      <button
        onClick={toggleLanguage}
        className="mt-4 rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
      >
        Toggle Language
      </button>
      <p className="mt-6 max-w-prose text-sm text-slate-500">
        Toggle, then send a message. The reply should switch language, which is
        the only proof that <code>setState</code> reached the prompt.
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/in-app-agent-write"
      subtitle="agent: languageAgent"
    >
      <YourMainContent />
      <CopilotSidebar agentId="languageAgent" defaultOpen />
    </DemoFrame>
  );
}
