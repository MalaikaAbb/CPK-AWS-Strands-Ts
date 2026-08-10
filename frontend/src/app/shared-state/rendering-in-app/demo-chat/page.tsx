"use client";

import { CopilotSidebar, useAgent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { Canvas } from "../canvas";

/**
 * The page's `app/page.tsx` layout — canvas as primary content, chat docked
 * beside it, both reading the same agent.
 *
 * Two departures from the printed code, both forced by the same omission:
 * the page's `useAgent()` and `<CopilotSidebar />` calls take no `agentId`,
 * which resolves to an agent named `default`. No Strands page registers one.
 * Both are given `shared-state-read-write` here.
 *
 * The seed buttons are this repo's. The page shows `agent.setState` writing
 * back from a click handler but never shows anything putting state there in
 * the first place — and on Strands nothing else can, because a tool with
 * `ToolBehavior.stateFromArgs` is the only agent-side write path and no page
 * publishes one.
 */

const AGENT_ID = "shared-state-read-write";

const SEED = {
  title: "Launch checklist",
  items: [
    { id: "1", label: "Draft the announcement", done: false },
    { id: "2", label: "Freeze the API surface", done: true },
    { id: "3", label: "Write the migration guide", done: false },
  ],
};

export default function Page() {
  const { agent } = useAgent({ agentId: AGENT_ID });

  return (
    <DemoFrame
      parentPath="/shared-state/rendering-in-app"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <div className="app-shell grid h-full grid-cols-1 lg:grid-cols-[1fr_26rem]">
        <div className="flex min-h-0 flex-col">
          <div className="flex shrink-0 gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
            {/* <button
              type="button"
              onClick={() => agent.setState(SEED)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-700"
            >
              Seed the canvas
            </button>
            <button
              type="button"
              onClick={() => agent.setState({ title: "Untitled", items: [] })}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-700"
            >
              Clear
            </button> */}
          </div>
          {/* Your app UI, driven by agent.state */}
          <div className="min-h-0 flex-1">
            <Canvas agentId={AGENT_ID} />
          </div>
        </div>
        {/* Chat is just another consumer of the same agent */}
        <CopilotSidebar agentId={AGENT_ID} defaultOpen />
      </div>
    </DemoFrame>
  );
}
