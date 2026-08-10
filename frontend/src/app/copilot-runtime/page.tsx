import { RouteHeader } from "@/components/route-header";

import { AgentRoster } from "./agent-roster";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PUBLISHED_MINIMAL = `const runtime = new CopilotRuntime({
  agents: {
    // your agents go here
  },
});`;

const DEFAULT_AGENT = `const runtime = new CopilotRuntime({
  agents: {
    // Frontend APIs use this agent when no other agent id is selected.
    default: new HttpAgent({ url: "https://my-agent.example.com" }),
  },
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/copilot-runtime" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The server-side layer between the browser and the agents. It resolves
          an agent by id, clones it for request isolation, supplies messages,
          state and thread context, runs it, and encodes the AG-UI events back
          as SSE. Because it runs on your server, it is also where
          authentication and middleware belong — anything on the client can be
          tampered with.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Open the demo, press Run on the Plain chat tab",
              "Switch to With a backend tool and press Run",
              "Switch to With shared state and press Run",
            ]}
            expect="Three visibly different event streams from one endpoint. Plain chat is text only; the tool tab adds TOOL_CALL_START naming get_weather through to TOOL_CALL_RESULT; the state tab carries a non-empty STATE_SNAPSHOT once you have set a language on the Writing route. Every tab reassembles its reply on the right from the same deltas shown on the left."
            fail="All three tabs produce identical traces, which would mean agentId is not reaching the runtime. Or RUN_FAILED with nothing streamed — check the Node server on :8000 and OPENAI_API_KEY."
          />
        </div>
      </Panel>

      <Panel
        title="The agents this runtime routes to, live"
        description="Fetched from the server's /health and cross-checked against lib/agents.ts, which the runtime route is built from. Two hand-maintained lists drift; this is how you find out."
      >
        <AgentRoster agentUrlBase="http://localhost:8000" />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/copilot-runtime/demo-chat/page.tsx" },
            { file: "frontend/src/app/copilot-runtime/agent-roster.tsx" },
          ]}
          note={
            <>
              The demo drives every run through <code>agent.addMessage</code> +{" "}
              <code>copilotkit.runAgent</code> and reads the wire with{" "}
              <code>agent.subscribe</code> — there is no chat component on the
              page. That is deliberate: this route is about the runtime
              resolving an <code>agentId</code>, not about any chat surface.
            </>
          }
        />
      </Panel>

      <Panel
        title="This repo's two runtimes"
        description="One for everything, and a second for A2UI dynamic schema — because the two need different a2ui configuration on the same endpoint, which is not possible."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit/route.ts" },
            { file: "frontend/src/app/api/copilotkit-declarative-gen-ui/route.ts" },
          ]}
          note={
            <>
              A third exists for Voice at{" "}
              <code>api/copilotkit-voice/[[...slug]]/route.ts</code>, which uses
              the v2 handler rather than the App Router wrapper — the v1 wrapper
              drops <code>transcriptionService</code>.
            </>
          }
        />
      </Panel>

     
    </>
  );
}
