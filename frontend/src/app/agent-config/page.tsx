import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const LANGGRAPH_BACKEND = `async def my_agent_node(state: AgentState, config: RunnableConfig):
    context_entries = state.get("copilotkit", {}).get("context", [])
    cfg = next(
        (
            value
            for entry in reversed(context_entries)
            if (value := read_config_value(entry)) is not None
        ),
        {},
    )
    tone = cfg.get("tone", "professional")
    expertise = cfg.get("expertise", "intermediate")
    response_length = cfg.get("responseLength", "concise")
    system_prompt = build_system_prompt(tone, expertise, response_length)
    # ...`;

const OTHER_BRANCH = `export const agentConfigFactory = async (input: AgentFactoryInput) => {
  const { tone, expertise, responseLength } = input.forwardedProps ?? {};
  const systemPrompt = buildSystemPrompt(tone, expertise, responseLength);
  return makeAgent({ systemPrompt /* ... */ });
};`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-config" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A typed settings object the UI owns and the agent reads. The
          distinction the page draws is worth keeping: if the values are a{" "}
          <em>channel</em> the user occasionally tunes — tone, expertise,
          length, language — this is the right shape. If they are{" "}
          <em>content</em> the agent should write back to, that is shared state
          instead. Config only ever flows one way.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain what an AG-UI event stream is.",
              "Set expertise to beginner and length to detailed, then ask the same question again.",
            ]}
            expect="The second answer is noticeably longer and less jargon-heavy. Switch tone to playful and the register changes too."
            fail="Identical answers regardless of the selects. The context entry is not reaching the prompt."
          />
        </div>
      </Panel>

      <Panel
        title="The demo, the type, and the panel"
        description="ConfigContextRelay is the page's entire published frontend. The other two files are not published."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/agent-config/demo-chat/page.tsx" },
            { file: "frontend/src/app/agent-config/config-types.ts" },
            { file: "frontend/src/app/agent-config/config-card.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="The backend sample is LangGraph Python">
        <p className="mb-3">
          Under a <code>python title=&quot;backend/agent.py&quot;</code> label,
          on a page in the TypeScript tree:
        </p>
        <CodeBlock code={LANGGRAPH_BACKEND} language="python" />
        <p className="mt-3">
          <code>async def my_agent_node(state: AgentState, config:
          RunnableConfig)</code> is the LangGraph node signature.{" "}
          <code>state[&quot;copilotkit&quot;][&quot;context&quot;]</code> is the
          LangGraph context location. Strands has neither, and this is not even
          the right language. The Strands slot next to it is{" "}
          <code>
            &lt;!-- setup skipped: agent-config-setup is not bundled for
            strands-typescript --&gt;
          </code>
          .
        </p>
      </Callout>

      <Callout tone="warn" title="The alternative branch is a different architecture again">
        <p className="mb-3">
          The page has a second half, gated on{" "}
          <code>agent_config_pattern equals &quot;runtime-properties&quot;</code>,
          which passes the config as <code>properties</code> on{" "}
          <code>&lt;CopilotKit&gt;</code> and reads it in an agent factory:
        </p>
        <CodeBlock code={OTHER_BRANCH} language="ts" />
        <p className="mt-3">
          That path is for runtimes that own the agent in-process.{" "}
          <code>AgentFactoryInput</code> and <code>makeAgent</code> are not
          imported or defined. Strands agents run behind an HTTP endpoint, so
          this route uses the <code>useAgentContext</code> branch — which is
          also the branch the page&apos;s own flag selects for Strands.
        </p>
      </Callout>

      <Callout tone="info" title="How the config actually arrives">
        <p>
          The adapter flattens <code>RunAgentInput.context[]</code> into a
          record keyed by <code>description</code> and passes it to the
          agent&apos;s <code>stateContextBuilder</code> as a third{" "}
          <code>extras</code> argument. This route&apos;s agent takes the
          simpler path — a system prompt instructing it to obey the published
          preferences — because no doc page shows the three-argument builder
          signature at all. See{" "}
          <code>backend/src/agents/chat-agents.ts</code>.
        </p>
      </Callout>
    </>
  );
}
