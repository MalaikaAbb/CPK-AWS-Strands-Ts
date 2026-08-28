import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PUBLISHED_RUNTIME = `const runtime = new CopilotRuntime({
  agents: {
    strands_agent: new HttpAgent({ url: "http://localhost:8000" }),
  },
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env.INTELLIGENCE_API_KEY!,
  }),
  // Threads are per-user. Without this, every visitor shares one history.
  identifyUser: (request) => ({
    id: request.headers.get("x-user-id") ?? "anonymous",
    name: request.headers.get("x-user-name") ?? "Anonymous",
  }),
});`;

const THIS_REPO_RUNTIME = `import { createRuntime } from "@/lib/intelligence";

const runtime = createRuntime({
  agents,   // the whole registry, not one agent
});`;

const FACTORY = `export function createRuntime<T extends CopilotRuntimeOptions>(
  base: T,
): CopilotRuntime {
  if (!INTELLIGENCE_API_KEY) {
    return new CopilotRuntime(base);          // the doc's documented SSE fallback
  }

  return new CopilotRuntime({
    ...base,
    intelligence: new CopilotKitIntelligence({
      apiKey: INTELLIGENCE_API_KEY,
    }),
    // Threads are per-user. Without this, every visitor shares one history.
    identifyUser: (request: Request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
  });
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The bring-your-own-agent path, end to end, and the only page in the
          Strands TypeScript tree whose backend is published in full and
          actually runs. A <code>@strands-agents/sdk</code> <code>Agent</code>{" "}
          is wrapped by <code>StrandsAgent</code> from{" "}
          <code>@ag-ui/aws-strands</code> and turned into an Express app by{" "}
          <code>createStrandsApp</code>; the Next runtime reaches it with an{" "}
          <code>HttpAgent</code>. Two processes, two ports.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Can you tell me a joke?", "What do you think about React?"]}
            expect="Tokens stream in a word at a time and the reply renders as markdown."
            fail="An error banner. Check that the Node server is up on :8000 and that OPENAI_API_KEY is set — and see the model-id gap above if the error mentions an unknown model."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The five files that make it work"
        description="Read from this repo, so they can be diffed against the doc's samples directly."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/model.ts" },
            { file: "backend/src/agents/chat-agents.ts" },
            { file: "backend/src/server.ts" },
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
            { file: "frontend/src/lib/intelligence.ts" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Where CopilotKit Intelligence is actually configured">
        <p className="mb-3">
          Not in <code>route.ts</code>, which is worth saying plainly because
          the published block puts it there. This is what the page shows:
        </p>
        <CodeBlock
          code={PUBLISHED_RUNTIME}
          language="ts"
          filename="app/api/copilotkit/[[...slug]]/route.ts (as published)"
        />
        <p className="mb-3 mt-3">
          and this is what this repo&apos;s route says instead — the two
          Intelligence options have moved one file over, behind a factory:
        </p>
        <CodeBlock code={THIS_REPO_RUNTIME} language="ts" />
        <p className="mb-3 mt-3">
          <code>createRuntime</code> lives in{" "}
          <code>frontend/src/lib/intelligence.ts</code> and is where{" "}
          <code>intelligence</code> and <code>identifyUser</code> are set:
        </p>
        <CodeBlock code={FACTORY} language="ts" filename="frontend/src/lib/intelligence.ts" />
        <p className="mt-3">
          Two reasons for the indirection. The small one: three runtimes in this
          repo (<code>/api/copilotkit</code>,{" "}
          <code>/api/copilotkit-declarative-gen-ui</code>,{" "}
          <code>/api/copilotkit-voice</code>) all call it, so Intelligence is
          configured once rather than three times.
        </p>
        <p className="mt-3">
          The real one: the page&apos;s own no-licence fallback cannot be
          expressed as a spread. Its callout says to &quot;drop the{" "}
          <code>intelligence</code> and <code>identifyUser</code> options&quot;
          and the runtime falls back to SSE — but{" "}
          <code>CopilotRuntime</code>&apos;s constructor is overloaded, and the
          arm that accepts <code>intelligence</code> requires it{" "}
          <em>present and non-optional</em>. Spreading{" "}
          <code>{"{ intelligence?: … }"}</code> widens it to{" "}
          <code>CopilotKitIntelligence | undefined</code>, which matches no
          overload. So the drop has to be a branch around two separate{" "}
          <code>new CopilotRuntime(...)</code> calls, which is exactly what the
          factory is.
        </p>
        <p className="mt-3">
          The cost is that <code>route.ts</code> no longer reads
          line-for-line against the doc. That is a deliberate trade, and it is
          the only reason this harness starts at all for anyone who clones it
          without a licence key.
        </p>
      </Callout>

      <Callout tone="info" title="INTELLIGENCE_API_KEY is read by the frontend process">
        <p>
          It belongs in <code>frontend/.env.local</code>, not{" "}
          <code>backend/.env</code>. The factory reads{" "}
          <code>process.env.INTELLIGENCE_API_KEY</code> inside the Next server,
          so a key set only on the agent server leaves{" "}
          <code>createRuntime</code> taking the no-key branch — Threads and the
          Inspector stay locked, and it looks exactly like a config that was
          never wired.
        </p>
      </Callout>

      <Callout tone="warn" title="What this repo changed, and why">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>The model id is read from an env var.</strong> The page
            hardcodes <code>modelId: &quot;gpt-5.4&quot;</code>, which does not
            resolve; its own callout says GPT-4o and both Shared State pages use{" "}
            <code>gpt-4o</code>. <code>MODEL_ID</code> defaults to{" "}
            <code>gpt-4o</code> here. Set it to <code>gpt-5.4</code> in{" "}
            <code>backend/.env</code> to reproduce the failure.
          </li>
          <li>
            <strong>One app per agent, mounted side by side.</strong> The page
            ends at{" "}
            <code>
              createStrandsApp(aguiAgent, {"{ path: \"/\" }"})
            </code>{" "}
            and <code>app.listen(8000)</code> — one app, one agent, one root.
            Nothing documents serving a second agent from one process, so{" "}
            <code>server.ts</code> calls that same function once per agent and
            mounts each result with Express&apos;s <code>app.use</code>. The
            documented call is untouched; the composition around it is this
            repo&apos;s.
          </li>
          <li>
            <strong>
              The frontend install line names a package that is never imported.
            </strong>{" "}
            The page runs{" "}
            <code>npm install @copilotkit/react-ui …</code> and then imports
            every component from <code>@copilotkit/react-core/v2</code>.{" "}
            <code>@copilotkit/react-ui</code> is the v1 package, so it is not a
            dependency here.
          </li>
        </ul>
      </Callout>

      <Callout tone="info" title="Trailing slashes matter">
        <p>
          Because each agent is a mounted sub-app, its AG-UI root is{" "}
          <code>http://localhost:8000/&lt;agent-id&gt;/</code> — with the slash.{" "}
          <code>lib/agents.ts</code> builds every <code>HttpAgent</code> URL
          that way. The Voice doc page writes its own the same way (
          <code>{"`${AGENT_URL}/voice/`"}</code>), which is the only place the
          docs acknowledge the form.
        </p>
      </Callout>

      <Callout tone="info" title="The MCP dependency you have to install anyway">
        <p>
          The install step carries a comment worth keeping:{" "}
          <code>@modelcontextprotocol/sdk</code> is loaded unconditionally by{" "}
          <code>@strands-agents/sdk</code> and is required at runtime even when
          your agent uses no MCP at all. It is in this repo&apos;s{" "}
          <code>backend/package.json</code> for that reason and no other.
        </p>
      </Callout>
    </>
  );
}
