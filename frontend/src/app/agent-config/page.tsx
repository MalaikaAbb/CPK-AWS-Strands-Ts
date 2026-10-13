import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PROSE_RELAY = `function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-config" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A typed settings object (tone, expertise, response length) that the
          UI owns and the agent reads on every turn. It flows one way only: if
          the agent needs to write values back, use shared state instead. On
          Strands the config travels as an AG-UI <code>context</code> entry.
          The adapter shows it to the model during each call and removes it
          afterwards, so it never ends up in the saved conversation.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain what an AG-UI event stream is.",
              "Set expertise to beginner and length to detailed, then ask the same question again.",
            ]}
            expect="The second answer is noticeably longer and less jargon-heavy. Switch tone to enthusiastic and the register changes too. Reloading the thread does not show the config text inside your messages."
            fail="Identical answers regardless of the selects, meaning the context entry is not reaching the model. Or the config text shows up inside your own message bubbles, meaning something is writing it into history."
          />
        </div>
      </Panel>

      <Panel
        title="Backend — the page's two blocks"
        description="withStateContext (from src/agent/state.ts) and the ShowcaseStrandsAgent subclass (from src/agent/agent.ts), as published. The formatPreferencesBlock call is commented out because it is unpublished."
      >
        <SourceCodeGroup
          files={[
            {
              file: "backend/src/agents/agent-config-agent.ts",
              region: "with-state-context",
            },
            {
              file: "backend/src/agents/agent-config-agent.ts",
              region: "agent-config-context-registration",
            },
          ]}
        />
      </Panel>

      <Panel
        title="Frontend — the demo Code tab, unchanged"
        description="Copied byte-exact from the page's interactive demo. Only the runtime route departs, in its agent URL."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/agent-config/_demo-code/page.tsx" },
            {
              file: "frontend/src/app/agent-config/_demo-code/config-context-relay.tsx",
            },
            { file: "frontend/src/app/agent-config/_demo-code/use-agent-config.ts" },
            { file: "frontend/src/app/agent-config/_demo-code/config-types.ts" },
            { file: "frontend/src/app/agent-config/_demo-code/config-card.tsx" },
            { file: "frontend/src/app/agent-config/_demo-code/demo-layout.tsx" },
            { file: "frontend/src/app/api/copilotkit-agent-config/route.ts" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="formatPreferencesBlock is not published">
        <p>
          The page&apos;s <code>withStateContext</code> calls{" "}
          <code>formatPreferencesBlock(state.preferences)</code>. That helper
          appears nowhere: not in the page text, and not in the demo Code tab,
          which includes <code>agent.ts</code> but not <code>state.ts</code>.
          Those lines are commented out here rather than reimplemented. This
          route still works, because its config is sent as context, not as{" "}
          <code>state.preferences</code>.
        </p>
      </Callout>

      <Callout tone="info" title="The prose relay and the demo relay differ">
        <p className="mb-3">
          The relay printed in the page text uses a shorter description than
          the one in the demo (which this route runs):
        </p>
        <CodeBlock code={PROSE_RELAY} language="tsx" />
        <p className="mt-3">
          The demo&apos;s description adds{" "}
          <em>
            &quot;Apply tone, expertise level, and response length to every
            reply.&quot;
          </em>{" "}
          The adapter passes the description to the model verbatim, and the
          agent&apos;s own prompt is the Quickstart one-liner. So that sentence
          is the only thing telling the model to act on the values. Using the
          prose version gives the model the values without that instruction.
        </p>
      </Callout>

      <Callout tone="info" title="Why no stateContextBuilder any more">
        <p>
          Since <code>@ag-ui/aws-strands</code> 0.3.0, the adapter formats{" "}
          <code>RunAgentInput.context[]</code> into a &quot;Context provided by
          the application&quot; block. It adds that block to the latest user
          turn before each model call and removes it afterwards. The page now
          advises against <code>stateContextBuilder</code> for context, because
          whatever it returns is stored as part of the user&apos;s message. The
          previous version of this route used one, and with 0.3.0 the model
          would have received the config twice.
        </p>
      </Callout>
    </>
  );
}
