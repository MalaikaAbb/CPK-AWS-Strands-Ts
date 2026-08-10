import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PLACEHOLDERS = `## Setting up sub-agents
<!-- setup skipped: subagents-setup is not bundled for strands-typescript -->
…
<!-- snippet skipped: region 'subagent-setup' missing in strands-typescript::subagents -->

## Exposing sub-agents as tools
…
<!-- snippet skipped: region 'supervisor-delegation-tools' missing in strands-typescript::subagents -->`;

const CONFIG_HALF = `// from the published src/agent/agent.ts — the config is shown…
research_agent: {
  stateFromResult: makeSubagentStateFromResult("research_agent"),
},
writing_agent: {
  stateFromResult: makeSubagentStateFromResult("writing_agent"),
},
critique_agent: {
  stateFromResult: makeSubagentStateFromResult("critique_agent"),
},

// …and the function it points at comes from here:
import { makeSubagentStateFromResult } from "./state";   // ← never published`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/multi-agent/subagents" />

      <Panel title="What it would demonstrate">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A supervisor LLM that exposes each specialist as a tool. It decides
          what to delegate, each sub-agent does its narrow job with its own
          system prompt, and results flow back into the supervisor&apos;s next
          step. Structurally it is tool-calling where every &quot;tool&quot; is
          a full agent — and the delegation log is the payoff: shared state
          turns a long opaque spinner into a live record of who was asked what.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Research the market for reusable water bottles, write a short brief, then critique it.",
            ]}
            expect="Nothing. The three indicator chips stay dimmed and the log stays empty — this route is Broken by design."
            fail="A delegation entry actually appears, which would mean the agent grew the three tools. Update this route's status if so."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Three of the four sections on this page are placeholders">
        <p className="mb-3">
          The page teaches three things — how to set up sub-agents, how to
          define them, and how to expose them as delegation tools. Here is what
          it publishes for all three:
        </p>
        <CodeBlock code={PLACEHOLDERS} language="text" />
        <p className="mt-3">
          The prose around them is detailed and specific. The
          &quot;Exposing sub-agents as tools&quot; section spells out exactly
          what each delegation tool must do — run the sub-agent on the supplied{" "}
          <code>task</code>, record the delegation into a{" "}
          <code>delegations</code> slot in shared state, return the final
          message as the tool result — and then prints a marker where the code
          should be. Only the component that renders the result survives.
        </p>
      </Callout>

      <Callout tone="warn" title="The state binding is visible, its implementation is not">
        <p className="mb-3">
          The published <code>agent.ts</code> does wire all three delegations,
          which makes this the clearest example of the whole doc tree&apos;s
          problem — the configuration is published and the thing it configures
          is not:
        </p>
        <CodeBlock code={CONFIG_HALF} language="ts" />
        <p className="mt-3">
          <code>ToolBehavior.stateFromResult</code> is real and documented in
          the adapter&apos;s types: it derives a{" "}
          <code>StateSnapshotEvent</code> from a tool result. What{" "}
          <code>makeSubagentStateFromResult</code> does with that result — how
          it appends to <code>delegations</code>, what fields it writes — is in{" "}
          <code>./state</code>, which appears on no page.
        </p>
      </Callout>

      <Panel
        title="The one thing the page does publish"
        description="The log component, reproduced verbatim. Its four missing declarations are restored — see the docstring."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/multi-agent/subagents/delegation-log.tsx" },
            { file: "frontend/src/app/multi-agent/subagents/demo-chat/page.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="info" title="Why the demo exists at all">
        <p>
          The log is wired to real agent state and reads the real{" "}
          <code>delegations</code> key, so if the missing tools ever ship, this
          route starts working with no changes. Until then it renders its empty
          state, which is the honest result of following this page.
        </p>
      </Callout>
    </>
  );
}
