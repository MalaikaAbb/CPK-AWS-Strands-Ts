"use client";

import {
  useAgent,
  useCopilotKit,
  useRenderToolCall,
} from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { AssistantBubble, UserBubble } from "../bubbles";

/**
 * The page's "minimal example", assembled.
 *
 * The published `send` function is reproduced below character for character,
 * including its five-line comment and its `[langgraph-python:headless-simple]`
 * log prefix — which is the wrong framework, on a page in the Strands
 * TypeScript tree. Left as printed; see the doc gaps on the parent route.
 *
 * One substitution. The published snippet's message id comes from
 * `generateMessageId()`, which is imported by nothing on the page — and is not
 * exported by `@copilotkit/react-core/v2` either (checked against 1.66.4: the
 * v2 entry point exports 24 `use*` hooks and no id helper). The snippet cannot
 * run as printed. Google ADK's copy of the same snippet uses
 * `crypto.randomUUID()`, so that is what stands in here.
 *
 * The `visible` array in the published message-list snippet is likewise never
 * defined. It filters `agent.messages` down to what the list renders; here that
 * is user and assistant roles, since those are the two the snippet branches on.
 */

function Chat() {
  const { agent } = useAgent({ agentId: "headless-simple" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");
  const renderToolCall = useRenderToolCall();

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      // The Headless Simple demo is the canonical "two hooks, your
      // design system" example users copy-paste as a starting point.
      // Silently swallowing errors here would model broken practice;
      // log so a network failure / runtime error / transport disconnect
      // surfaces in the console for the developer.
      console.error("[langgraph-python:headless-simple] runAgent failed", err);
    });
  };

  const visible = agent.messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.messages, agent.isRunning]);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
        {visible.length === 0 && (
          <p className="text-sm text-slate-500">
            No CopilotKit chrome on this page — two hooks and your own markup.
          </p>
        )}

        {visible.map((m) =>
          m.role === "user" ? (
            <UserBubble
              key={m.id}
              content={typeof m.content === "string" ? m.content : ""}
            />
          ) : (
            <AssistantBubble
              key={m.id}
              content={typeof m.content === "string" ? m.content : undefined}
            >
              {("toolCalls" in m && Array.isArray(m.toolCalls)
                ? m.toolCalls
                : []
              ).map((tc) => {
                const node = renderToolCall({ toolCall: tc });
                return node ? <div key={tc.id}>{node}</div> : null;
              })}
            </AssistantBubble>
          ),
        )}

        {agent.isRunning && (
          <p className="text-xs text-slate-400">running…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex shrink-0 gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your own composer…"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={agent.isRunning}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/headless-ui"
      subtitle="agent: headless-simple"
    >
      <Chat />
    </DemoFrame>
  );
}
