import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/in-app-agent-write" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The write half of the same channel. <code>agent.setState</code>{" "}
          updates the agent&apos;s state from your UI and re-renders every
          consumer; the agent picks the new value up on its next turn. What
          makes that last step work on Strands is the{" "}
          <code>stateContextBuilder</code> in the agent&apos;s{" "}
          <code>StrandsAgentConfig</code> — the adapter has no automatic
          state-to-prompt path, so whatever that function does not write into
          the prompt, the model never sees.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press Toggle Language and send another",
              "What language are you speaking?",
            ]}
            expect="The reply language flips between Spanish and English as you toggle. The heading updates immediately; the language changes on the next message."
            fail="The heading changes but the replies stay in one language — setState updated the client and the builder is not folding it into the prompt."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/in-app-agent-write/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend"
        description="The agent/main.ts block both Shared State pages print, verbatim."
      >
        <SourceCode file="backend/src/agents/state-agents.ts" />
      </Panel>
    </>
  );
}
