"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DelegationLog, type Delegation } from "../delegation-log";

/**
 * The delegation log, wired to real agent state.
 *
 * The page describes this wiring in prose and never shows it: "Subscribe with
 * `useAgent({ updates: [UseAgentUpdate.OnStateChanged,
 * UseAgentUpdate.OnRunStatusChanged] })`, read `agent.state.delegations`, and
 * render one card per entry." `UseAgentUpdate` is named there and imported
 * nowhere, so this uses a plain `useAgent` — which re-renders on state change
 * anyway; the `updates` option narrows what it listens to, it does not enable
 * it.
 *
 * The log will stay empty. `delegations` is only ever written by the three
 * delegation tools, and the snippet that would define them is a `snippet
 * skipped` marker. The supervisor agent this talks to has no tools at all.
 */

const AGENT_ID = "subagents";

export default function Page() {
  const { agent } = useAgent({ agentId: AGENT_ID });
  const delegations = ((agent.state as { delegations?: Delegation[] } | undefined)
    ?.delegations ?? []) as Delegation[];

  return (
    <DemoFrame parentPath="/multi-agent/subagents" subtitle={`agent: ${AGENT_ID}`}>
      <div className="grid h-full grid-cols-1 gap-4 bg-[#FAFAFC] p-4 lg:grid-cols-[1fr_26rem]">
        <DelegationLog delegations={delegations} isRunning={agent.isRunning} />
        <div className="chat-host min-h-0 rounded-2xl border border-[#DBDBE5] bg-white">
          <CopilotChat agentId={AGENT_ID} />
        </div>
      </div>
    </DemoFrame>
  );
}
