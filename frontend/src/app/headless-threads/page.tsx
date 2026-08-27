import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const RUNTIME = `const runtime = new CopilotRuntime({
  agents: {
    default: agent,
  },
  // Without \`intelligence\` the runtime runs in SSE mode and the thread
  // UI has nothing to list — chat still works, so this fails quietly.
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env.INTELLIGENCE_API_KEY!,
  }),
  // Required alongside \`intelligence\`: threads are scoped per user, so
  // without this every visitor shares one history. Resolve the real
  // signed-in user — see Thread & History Lifecycle.
  identifyUser: async (request) => {
    const session = await verifyAppSession(request);   // ← never defined
    if (!session?.user) throw new Error("Unauthorized");
    return { id: session.user.id, name: session.user.name };
  },
});`;

const LOCKS: [string, string, string, string][] = [
  ["lockTtlSeconds", "20", "3600 (1 hour)", "How long the lock is held before it expires automatically."],
  ["lockHeartbeatIntervalSeconds", "15", "3000 (50 min)", "How often the runtime renews the lock during a run."],
  ["lockKeyPrefix", "—", "—", "Custom Redis key prefix. Useful when multiple apps share a Redis instance."],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/headless-threads" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same thread store as the drawer, with the UI removed.{" "}
          <code>useThreads({"{ agentId }"})</code> returns the list plus{" "}
          <code>renameThread</code>, <code>archiveThread</code>,{" "}
          <code>deleteThread</code>, <code>startNewThread</code> and the
          pagination trio, all synchronised over a WebSocket — a thread created
          in another tab shows up here without a refetch. Selection is yours to
          hold: the page&apos;s pattern is <code>useState</code> for the active
          id, passed to <code>&lt;CopilotChat threadId={"{…}"} /&gt;</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, press New, send another",
              "Press Rename on a row",
              "Open the same route in a second tab",
            ]}
            expect="Press New and the chat clears to the welcome screen; the list does NOT gain a row until you send the first message, which is the documented lazy creation. Rows switch conversations. Rename relabels a row to 'Renamed'. The second tab shows the same list, updating live without a reload."
            fail="Press New and the previous conversation stays on screen — that means the threadId prop is still shadowing the reset. An empty list with an amber error is the other failure: this list is served by CopilotKit Intelligence, so without INTELLIGENCE_API_KEY there is nothing to list."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/headless-threads/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="Why the New button calls two things">
        <p className="mb-2">
          <code>startNewThread()</code> from <code>useThreads</code> resets the
          core&apos;s <em>client-side</em> thread store so the welcome screen
          shows. On its own, on this route, that is invisible — because the
          chat here is driven by an authoritative{" "}
          <code>threadId</code> prop, and Thread &amp; History Lifecycle is
          explicit that a prop-controlled id makes the setters no-op and log a
          warning.
        </p>
        <p className="mb-2">
          So the handler does both: calls <code>startNewThread()</code>, then
          clears the local active id back to <code>undefined</code>, which
          removes the prop from <code>&lt;CopilotChat&gt;</code> entirely and
          lets the freshly minted non-explicit id take effect.
        </p>
        <p>
          Expect the list to stay unchanged until you send. The hook documents
          it as lazy creation: &quot;no row appears in <code>threads</code>{" "}
          until the new thread&apos;s first run persists server-side.&quot; An
          unchanged list right after pressing New is correct, not a failure.
        </p>
      </Callout>

      <Callout tone="warn" title="The two ThreadSidebar snippets cannot both be the file">
        <p>
          The page shows <code>ThreadSidebar.tsx</code> twice. The first
          destructures <code>threads, isLoading, renameThread, archiveThread,
          deleteThread</code>; the second re-destructures the same hook with{" "}
          <code>limit: 20</code> and takes <code>hasMoreThreads,
          isFetchingMoreThreads, fetchMoreThreads</code> instead. They are
          presented as the same file at two stages, but a component with two{" "}
          <code>useThreads</code> calls would open two subscriptions. This route
          merges them into one call, which is the only way to have both sets of
          members at once.
        </p>
        <p className="mt-3">
          <code>deleteThread</code> is destructured in the first snippet and
          used by neither. It is wired to a button here — with a confirm,
          because the page is explicit that delete is permanent and that
          nothing ships a confirmation dialog.
        </p>
      </Callout>

      <Panel title="The runtime half, as published">
        <CodeBlock code={RUNTIME} language="ts" filename="server.ts (as published)" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The comment on <code>intelligence</code> is the sharpest line on the
          page: without it the runtime runs in SSE mode and the thread UI has
          nothing to list — <em>chat still works, so this fails quietly</em>.
          That is exactly the failure mode this route shows when no key is set.
        </p>
      </Panel>

      <Callout tone="warn" title="verifyAppSession is called and never defined">
        <p>
          <code>identifyUser</code> awaits <code>verifyAppSession(request)</code>
          , which is imported from nowhere and defined on no page — it appears
          in this same shape on Thread &amp; History Lifecycle too. The intent
          is clear enough (&quot;your server-side auth&quot;), but the snippet
          does not run as printed. This harness has no auth provider, so{" "}
          <code>frontend/src/lib/intelligence.ts</code> uses the Quickstart&apos;s
          simpler published <code>identifyUser</code> — the one that reads{" "}
          <code>x-user-id</code> / <code>x-user-name</code> headers and falls
          back to <code>&quot;anonymous&quot;</code> — rather than inventing a
          session layer.
        </p>
      </Callout>

      <Panel
        title="Thread lock options"
        description="Documented on this page and nowhere else in the Strands TypeScript tree."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Option", "Default", "Max", "Description"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOCKS.map(([opt, def, max, desc]) => (
                <tr key={opt} className="align-top">
                  <td className="border-b border-slate-100 px-2 py-2 font-mono text-xs dark:border-slate-800">
                    {opt}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 font-mono text-xs dark:border-slate-800">
                    {def}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 font-mono text-xs dark:border-slate-800">
                    {max}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          None is set here — the defaults are the documented behaviour and this
          harness has no reason to move them. Worth knowing that a lock exists
          at all: the runtime takes one per thread when a run starts, so two
          tabs cannot run the same thread concurrently.
        </p>
      </Panel>

      <Callout tone="info" title="Archive is a soft delete">
        <p>
          <code>archiveThread</code> hides the thread from the list but leaves
          it in the database; pass <code>includeArchived: true</code> to{" "}
          <code>useThreads</code> to see it again, and{" "}
          <code>unarchiveThread</code> — on the hook but in none of the page&apos;s
          snippets — to bring it back. <code>deleteThread</code> is permanent.
        </p>
      </Callout>
    </>
  );
}
