import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const EVENT_TABLE: [string, string][] = [
  ["Run lifecycle", "onRunStartedEvent, onRunFinishedEvent, onRunErrorEvent"],
  ["Steps", "onStepStartedEvent, onStepFinishedEvent"],
  [
    "Text messages",
    "onTextMessageStartEvent, onTextMessageContentEvent, onTextMessageEndEvent",
  ],
  [
    "Tool calls",
    "onToolCallStartEvent, onToolCallArgsEvent, onToolCallEndEvent, onToolCallResultEvent",
  ],
  ["State", "onStateSnapshotEvent, onStateDeltaEvent"],
  ["Messages", "onMessagesSnapshotEvent"],
  ["Custom", "onCustomEvent, onRawEvent"],
  ["High-level changes", "onMessagesChanged, onStateChanged"],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/ag-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The protocol underneath everything else. <code>useAgent</code> returns
          a standard AG-UI <code>AbstractAgent</code>, so{" "}
          <code>agent.subscribe(...)</code> gives you the raw SSE event stream —
          run lifecycle, text deltas, tool calls, state snapshots. The pane on
          the left is that stream, live, next to an ordinary chat driving it.
          Everything CopilotKit renders is derived from these events.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Tell me a two-sentence story."]}
            expect="RUN_STARTED, then a STATE_SNAPSHOT, then a burst of TEXT_MESSAGE_CONTENT rows with a growing character count, then TEXT_MESSAGE_END, MESSAGES_SNAPSHOT and RUN_FINISHED."
            fail="Only onStateChanged rows and no protocol events — the subscription attached to a different agent than the chat is using."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/ag-ui/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The callbacks, from the page's own table"
        description="Every name maps directly to an AG-UI event type."
      >
        <dl className="space-y-2 text-sm">
          {EVENT_TABLE.map(([group, callbacks]) => (
            <div key={group} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-medium text-slate-900 sm:w-44 dark:text-slate-100">
                {group}
              </dt>
              <dd className="min-w-0 break-words font-mono text-xs text-slate-600 dark:text-slate-400">
                {callbacks}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Callout tone="info" title="What this adapter actually emits">
        <p className="mb-2">
          The page lists the protocol&apos;s full event vocabulary, not what any
          particular adapter sends.{" "}
          <code>@ag-ui/aws-strands</code> answers that question itself: it
          serves a <code>/capabilities</code> endpoint with a per-event
          boolean matrix. Notable entries for this adapter:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>MESSAGES_SNAPSHOT</code> is emitted natively at run
            boundaries, and the config comment says it is &quot;required for
            CopilotKit v2 frontends&quot;.
          </li>
          <li>
            <code>ACTIVITY_SNAPSHOT</code>, <code>ACTIVITY_DELTA</code> and{" "}
            <code>RAW</code> are not emitted unless you supply a{" "}
            <code>customResultHandler</code> that emits them.
          </li>
          <li>
            The <code>*_CHUNK</code> events replace the explicit start/content/end
            triples, and only when <code>emitChunkEvents</code> is on. It is off
            by default, which is why the log shows triples.
          </li>
        </ul>
        <p className="mt-2">
          None of that is on the doc page. <code>curl
          localhost:8000/&lt;agent-id&gt;/capabilities</code> is how you check.
        </p>
      </Callout>

      <Callout tone="warn" title="The page never mentions Strands">
        <p>
          Its examples target an agent id <code>research-agent</code> that
          appears nowhere else in the tree, and nothing connects the proxy
          pattern it describes to the <code>createStrandsApp</code> endpoint the
          Quickstart produces. It is the AG-UI page from every framework&apos;s
          docs, unmodified.
        </p>
      </Callout>
    </>
  );
}
