import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PRIMITIVES: [string, string][] = [
  [
    "agent.addMessage(...)",
    "Append a message without running the agent. Pair it with runAgent when the appended message should start a turn.",
  ],
  [
    "copilotkit.runAgent({ agent })",
    "The same entry point <CopilotChat /> calls internally. Orchestrates frontend tools, follow-up runs, and the subscriber lifecycle.",
  ],
  [
    "agent.subscribe(subscriber)",
    "Low-level AG-UI event subscription — onCustomEvent, onRunStartedEvent, onRunFinalized, onRunFailed, and the streaming deltas.",
  ],
];

const ADK_SETUP = `pip install ag-ui-adk

# then, in hitl_in_chat_agent.py
hitl_in_chat_agent = LlmAgent(
    name="HitlInChatAgent",
    model=get_model(),
    instruction=_INSTRUCTION,
    tools=[AGUIToolset()],          # ← the line that opens the tool channel
    after_model_callback=stop_on_terminal_text,
)`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/programmatic-control" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Driving an agent with no chat component anywhere in the tree. Buttons,
          a form, and a reset control push messages and start runs directly.
          This is the layer <code>&lt;CopilotChat&gt;</code> sits on, so
          anything the prebuilt chat can do is reachable from a cron job, a
          keyboard shortcut, or a form submit.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Click one of the canned prompts at the top",
              "Type your own and press Send",
              "Press Stop mid-stream",
            ]}
            expect="Messages appear in hand-rolled bubbles and stream. Stop halts the run mid-sentence; Reset clears the transcript and aborts anything in flight."
            fail="Send does nothing and the console is quiet — check that the programmatic-control agent is registered on the runtime."
          />
        </div>
      </Panel>

       <Panel title="It is an issue - half the code is missing and imports are missing">
        <Callout tone="warn" title="Missing code">
          <p>
           Missing imports and code 
          </p>
        </Callout>
      </Panel>

      <Panel title="The three primitives">
        <dl className="space-y-3 text-sm">
          {PRIMITIVES.map(([name, desc]) => (
            <div key={name} className="flex flex-col gap-0.5">
              <dt className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                {name}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          The page also distinguishes{" "}
          <code>copilotkit.runAgent({"{ agent }"})</code> from{" "}
          <code>agent.runAgent(options)</code>: the second sends the request but
          does <em>not</em> execute frontend tools or chain follow-ups. Use the
          first unless you know why you want the second.
        </p>
      </Panel>

      <Panel
        title="The demo and the helpers it needs"
        description="The send pipeline is the doc's snippet, verbatim. The three helpers it calls are not published anywhere."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/programmatic-control/demo-chat/page.tsx" }
          ]}
        />
      </Panel>

     
    </>
  );
}
