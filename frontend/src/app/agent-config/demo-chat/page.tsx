"use client";

import { CopilotChat, useAgentContext } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { ConfigCard } from "../config-card";
import { DEFAULT_CONFIG, type AgentConfig } from "../config-types";

/**
 * `ConfigContextRelay` is the page's snippet, verbatim — the whole published
 * frontend for this feature:
 *
 *     function ConfigContextRelay({ config }: { config: AgentConfig }) {
 *       useAgentContext({
 *         description: "Agent response preferences",
 *         value: { tone, expertise, responseLength },
 *       });
 *       return null;
 *     }
 *
 * A component that renders nothing and exists only to publish state to the
 * agent. Everything around it — the `AgentConfig` type it is annotated with,
 * the state that holds it, the panel that edits it — is not published.
 */

function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}

export default function Page() {
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);

  return (
    <DemoFrame parentPath="/agent-config" subtitle="agent: agent-config">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_26rem]">
        <div className="overflow-y-auto p-6">
          <ConfigCard config={config} setConfig={setConfig} />
          <ConfigContextRelay config={config} />
          <p className="mt-4 max-w-prose text-sm text-slate-500">
            Ask the same question twice with different settings. The answer
            should get shorter, more or less technical, and change register.
          </p>
        </div>
        <div className="chat-host min-h-0 border-l border-slate-200 dark:border-slate-800">
          <CopilotChat agentId="agent-config" />
        </div>
      </div>
    </DemoFrame>
  );
}
