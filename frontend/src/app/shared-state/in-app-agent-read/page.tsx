import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const RENDER_VARIANT = `useAgent({
  agentId: "strands_agent",
  render: ({ state }) => {
    if (!state.language) return null;
    return <div>Language: {state.language}</div>;
  },
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/in-app-agent-read" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Reading the agent&apos;s live state from your own components.{" "}
          <code>agent.state</code> is reactive, so a plain{" "}
          <code>&lt;p&gt;</code> re-renders whenever the agent updates it.{" "}
          <code>initialState</code> seeds it before the first run, which is why
          the value shows <em>spanish</em> before you have said anything.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello, how are you?", "What language are you speaking?"]}
            expect="The heading reads 'Language: spanish' immediately, and the agent replies in Spanish — because the backend's stateContextBuilder put that value in the prompt."
            fail="The agent replies in English. The stateContextBuilder is not reading state.language, or initialState never reached the agent."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/in-app-agent-read/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend both Shared State pages print"
        description="Reproduced verbatim, including the stateContextBuilder that makes any of this work."
      >
        <SourceCode file="backend/src/agents/state-agents.ts" />
      </Panel>

      {/* <Callout tone="warn" title="The page addresses an agent it never defines">
        <p>
          Its snippet is{" "}
          <code>useAgent({"{ agentId: \"strands_agent\", … }"})</code>. The
          backend printed immediately above it names the agent{" "}
          <code>languageAgent</code>, and the write page&apos;s otherwise
          identical frontend uses <code>languageAgent</code>. Copied literally,
          this page targets an agent that does not exist in its own example.
          This route uses the id the backend actually serves.
        </p>
      </Callout>

      <Callout tone="warn" title="The render variant repeats the mistake">
        <p className="mb-3">
          The &quot;Rendering agent state in the chat&quot; section shows:
        </p>
        <CodeBlock code={RENDER_VARIANT} language="tsx" />
        <p className="mt-3">
          Same wrong id. It also declares a <code>type AgentState</code>{" "}
          directly above and never uses it — the <code>useAgent</code> call is
          untyped, so <code>state.language</code> is unchecked.
        </p>
      </Callout>

      <Callout tone="warn" title="It sends you to the wrong docs, twice">
        <p>
          Step 1 says to &quot;follow the instructions in the Getting Started
          guide&quot; and links to <code>/langgraph/quickstart</code>. The live
          example iframe at the top of the page points at{" "}
          <code>
            feature-viewer.copilotkit.ai/aws-strands/feature/shared_state
          </code>{" "}
          — the Python tree — from a page served under{" "}
          <code>/strands-typescript</code>.
        </p>
      </Callout> */}
    </>
  );
}
