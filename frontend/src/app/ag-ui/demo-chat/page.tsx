"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * `agent.subscribe` walking the live event stream.
 *
 * The page's `EventLog` snippet subscribes to three callbacks and
 * `console.log`s them. This does the same thing to a visible pane, and adds
 * the run-lifecycle and tool-call callbacks from the page's own event table so
 * a whole turn is visible end to end rather than three slices of it.
 *
 * The point of the route: the object `useAgent` hands you is a standard AG-UI
 * `AbstractAgent`. Nothing about `subscribe` is chat-specific — the
 * `<CopilotChat>` beside the log is just another consumer of the same agent.
 */

const AGENT_ID = "agentic_chat";
const MAX_ROWS = 300;

type Row = { n: number; event: string; detail?: string };

export default function Page() {
  const { agent } = useAgent({ agentId: AGENT_ID });
  const [rows, setRows] = useState<Row[]>([]);
  const counter = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const push = (event: string, detail?: string) =>
      setRows((prev) => {
        counter.current += 1;
        const next = [...prev, { n: counter.current, event, detail }];
        return next.length > MAX_ROWS ? next.slice(-MAX_ROWS) : next;
      });

    const subscription = agent.subscribe({
      onRunStartedEvent: () => push("RUN_STARTED"),
      onRunFinishedEvent: () => push("RUN_FINISHED"),
      // Every callback receives `{ event } & AgentSubscriberParams` — the
      // payload is on `event`, not spread at the top level. The doc page's
      // own snippet gets this right for its three callbacks and never says it.
      onRunErrorEvent: ({ event }) => push("RUN_ERROR", event.message),
      onTextMessageStartEvent: () => push("TEXT_MESSAGE_START"),
      onTextMessageContentEvent: ({ textMessageBuffer }) =>
        push("TEXT_MESSAGE_CONTENT", `${textMessageBuffer?.length ?? 0} chars`),
      onTextMessageEndEvent: () => push("TEXT_MESSAGE_END"),
      onToolCallEndEvent: ({ toolCallName, toolCallArgs }) =>
        push("TOOL_CALL_END", `${toolCallName} ${JSON.stringify(toolCallArgs)}`),
      onStateSnapshotEvent: () => push("STATE_SNAPSHOT"),
      onMessagesSnapshotEvent: () => push("MESSAGES_SNAPSHOT"),
      onStateChanged: ({ agent: a }) =>
        push("onStateChanged", JSON.stringify(a.state)),
    });
    return () => subscription.unsubscribe();
  }, [agent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [rows]);

  return (
    <DemoFrame parentPath="/ag-ui" subtitle={`agent: ${AGENT_ID}`}>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_28rem]">
        <div className="flex min-h-0 flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <h2 className="text-sm font-semibold">Raw AG-UI events</h2>
            <button
              type="button"
              onClick={() => setRows([])}
              className="rounded-md border border-slate-300 px-2 py-0.5 text-xs dark:border-slate-700"
            >
              Clear
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-[11px]">
            {rows.length === 0 && (
              <p className="text-slate-500">
                Send a message. Every event on the wire lands here.
              </p>
            )}
            {rows.map((r) => (
              <div key={r.n} className="flex gap-2 py-0.5">
                <span className="w-8 shrink-0 text-right text-slate-400">
                  {r.n}
                </span>
                <span className="w-56 shrink-0 font-semibold text-[var(--accent)]">
                  {r.event}
                </span>
                <span className="min-w-0 truncate text-slate-600 dark:text-slate-400">
                  {r.detail}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="chat-host min-h-0">
          <CopilotChat agentId={AGENT_ID} />
        </div>
      </div>
    </DemoFrame>
  );
}
