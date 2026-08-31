"use client";

import { CopilotKit, CopilotChat, useThreads } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

/**
 * `useThreads` as a data layer, behind a UI this repo wrote.
 *
 * Three of the page's four snippets are assembled here, and the parts that
 * come from `useThreads` are the page's verbatim:
 *
 *   - the destructure: `threads, isLoading, renameThread, archiveThread,
 *     deleteThread` from `useThreads({ agentId })`
 *   - the row body: `thread.name ?? "New conversation"` with Rename and
 *     Archive buttons
 *   - the pagination block: `hasMoreThreads, isFetchingMoreThreads,
 *     fetchMoreThreads` with `limit`, and the "Load more" button gated on
 *     `hasMoreThreads` and disabled while `isFetchingMoreThreads`
 *   - the switch: `const [activeThreadId, setActiveThreadId] = useState<string
 *     | undefined>()` feeding `<CopilotChat threadId={activeThreadId} />`
 *
 * The page shows the list snippet and the pagination snippet as two separate
 * `ThreadSidebar.tsx` blocks that cannot both be the whole file — the second
 * re-destructures the same hook with `limit` added. They are one hook call
 * here, which is the only way to have both sets of members at once.
 *
 * `deleteThread` is destructured by the page and used by none of its snippets;
 * it is wired to a button here so the third mutation is actually exercised.
 * The page is explicit that neither archive nor delete has a confirmation
 * dialog and that delete is irreversible — hence the confirm on that one only.
 *
 * On the New button: `startNewThread` is documented as "reset to a fresh,
 * non-explicit client-side thread so the welcome screen shows. Lazy creation:
 * no row appears in `threads` until the new thread's first run persists
 * server-side." So the correct behaviour after pressing it is a cleared chat
 * and an unchanged list — the row arrives once you send the first message.
 */

/**
 * Wrapped in its own provider pointed at `/api/copilotkit-threads`.
 *
 * The app-wide provider talks to `/api/copilotkit`, which registers 25 agents
 * and runs in SSE mode. Intelligence must sit on a runtime advertising as few
 * agents as possible, because the client opens a realtime thread channel per
 * advertised agent — see the threads endpoint for the full story.
 */
const AGENT_ID = "threads-demo";

function ThreadSidebar({
  onSelectThread,
  onNewThread,
  activeThreadId,
}: {
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  activeThreadId?: string;
}) {
  const {
    threads,
    isLoading,
    renameThread,
    archiveThread,
    deleteThread,
    hasMoreThreads,
    isFetchingMoreThreads,
    fetchMoreThreads,
    startNewThread,
    listError,
  } = useThreads({ agentId: AGENT_ID, limit: 20 });

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading...</div>;

  return (
    <div className="flex h-full flex-col border-r border-slate-200 dark:border-slate-800">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <button
          onClick={() => {
            // Both halves are needed. `startNewThread()` resets the core's
            // client-side thread store so the welcome screen shows — but this
            // route drives the chat with an authoritative `threadId` prop, and
            // the lifecycle page is explicit that a prop-controlled id shadows
            // the setters. Releasing the prop is what lets the reset land.
            startNewThread();
            onNewThread();
          }}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
        >
          New
        </button>
      </div>

      {listError && (
        <p className="border-b border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {listError.message}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {threads.length === 0 && !listError && (
          <p className="p-2 text-xs text-slate-500">
            No threads yet. Send a message, then reload — or check that
            INTELLIGENCE_API_KEY is set, since this list is served by CopilotKit
            Intelligence.
          </p>
        )}

        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`mb-1 rounded-lg border p-2 text-sm ${
              thread.id === activeThreadId
                ? "border-[var(--accent)] bg-slate-50 dark:bg-slate-800/60"
                : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <button
              onClick={() => onSelectThread(thread.id)}
              className="block w-full truncate text-left"
            >
              <span>{thread.name ?? "New conversation"}</span>
            </button>
            <div className="mt-1 flex gap-2 text-[11px] text-slate-500">
              <button onClick={() => renameThread(thread.id, "Renamed")}>
                Rename
              </button>
              <button onClick={() => archiveThread(thread.id)}>Archive</button>
              <button
                onClick={() => {
                  if (confirm("Delete this thread permanently?")) {
                    void deleteThread(thread.id);
                  }
                }}
                className="text-rose-600 dark:text-rose-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {hasMoreThreads && (
          <button
            onClick={fetchMoreThreads}
            disabled={isFetchingMoreThreads}
            className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-slate-700"
          >
            {isFetchingMoreThreads ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();

  return (
    <DemoFrame parentPath="/headless-threads" subtitle={`agent: ${AGENT_ID}`}>
      <CopilotKit
        runtimeUrl="/api/copilotkit-threads"
        agent={AGENT_ID}
        enableInspector={nestedInspectorSetting}
      >
        <div className="grid h-full grid-cols-1 lg:grid-cols-[18rem_1fr]">
          <ThreadSidebar
            onSelectThread={setActiveThreadId}
            // Dropping back to `undefined` removes the `threadId` prop from the
            // chat entirely, so the id falls through to the core's freshly minted
            // non-explicit one and the welcome screen renders.
            onNewThread={() => setActiveThreadId(undefined)}
            activeThreadId={activeThreadId}
          />
          <div className="chat-host min-w-0">
            <CopilotChat agentId={AGENT_ID} threadId={activeThreadId} />
          </div>
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
