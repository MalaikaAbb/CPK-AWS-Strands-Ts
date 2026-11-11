import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

const DIR = "backend/docs_verbatim/deploy-agentcore";

/**
 * Reference route. Running anything on Bedrock AgentCore needs an AWS account
 * (CDK bootstrap, Cognito, an AgentCore Runtime), which a local harness does
 * not have. The page's code is kept byte-exact under
 * backend/docs_verbatim/deploy-agentcore/ and rendered from disk here; it is
 * not compiled or mounted as a runtime.
 */
export default function Page() {
  return (
    <>
      <RouteHeader path="/deploy-agentcore" />

      <Callout tone="premium" title="Needs an AWS account — not testable locally">
        <p>
          Both paths on the page end on AWS: the CLI template deploys CDK
          stacks, Cognito and an AgentCore Runtime, and the &quot;existing
          agent&quot; path points a runtime at an AgentCore{" "}
          <code>/invocations</code> URL with a bearer token. This repo has
          neither, so the code below is shown, not run. Nothing here talks to
          this repo&apos;s Strands backend.
        </p>
      </Callout>

      <Panel title="What the page teaches">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The browser never calls AgentCore. A CopilotKit runtime sits in
          between and holds the credentials. For an agent that is already
          deployed, the runtime registers an <code>HttpAgent</code> aimed at
          the AgentCore endpoint with an <code>Authorization</code> header, and
          swaps the default runner for an <code>AgentCoreRunner</code>. That
          runner answers <code>connect</code> for a thread it has never seen
          with an empty snapshot, and on reconnect it adds an empty tool result
          for every tool call in the replayed history, so a refreshed page does
          not hang on a tool call with no result. The page also explains the
          AWS-side 401 &quot;Missing Authentication Token&quot;: a missing or
          expired token, or a URL without <code>/invocations</code>.
        </p>
      </Panel>

      <Panel title="Start from scratch: scaffold, configure, deploy, tear down">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/create-strands.sh` },
            { file: `${DIR}/config.yaml` },
            { file: `${DIR}/deploy-strands.sh` },
            { file: `${DIR}/local-docker.sh` },
            { file: `${DIR}/destroy.sh` },
          ]}
          note="The page's CLI toggle also offers agentcore-langgraph; only the Strands variant is kept."
        />
      </Panel>

      <Panel title="I already have an agent: runtime, runner, provider, page">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/install-existing-agent.sh` },
            { file: `${DIR}/route.ts` },
            { file: `${DIR}/agent-core-runner.ts` },
            { file: `${DIR}/providers.tsx` },
            { file: `${DIR}/layout.tsx` },
            { file: `${DIR}/page.tsx` },
            { file: `${DIR}/env.local` },
            { file: `${DIR}/dev.sh` },
          ]}
        />
      </Panel>

      <Panel title="Troubleshooting: the 401 the page describes">
        <SourceCodeGroup files={[{ file: `${DIR}/401-error.txt` }]} />
      </Panel>

      <Callout tone="warn" title="What reading the code against this repo turns up">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <code>route.ts</code> imports <code>InMemoryAgentRunner</code> and
            never uses it; the runner it passes is <code>AgentCoreRunner</code>.
          </li>
          <li>
            The route exports only <code>GET</code> and <code>POST</code>, the
            same as the Quickstart. Thread rename/delete (PATCH/DELETE) would
            get a 405; see README §9.
          </li>
          <li>
            The install line pins <code>@ag-ui/client@1.0.2</code>. That is
            what <code>@copilotkit/runtime</code> 1.84.0 depends on, so it
            matches the runtime; this repo&apos;s frontend asks for{" "}
            <code>^1.0.3</code> instead.
          </li>
          <li>
            The &quot;full-stack example&quot; link points to{" "}
            <code>/agentcore/full-stack-example</code>, which did not resolve
            when this route was added (2026-11-11).
          </li>
        </ul>
      </Callout>
    </>
  );
}
