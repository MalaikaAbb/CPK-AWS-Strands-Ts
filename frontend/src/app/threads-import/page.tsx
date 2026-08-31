import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const DRY_RUN = `# ADK
npx copilotkit@latest import --source adk --dry-run

# LangGraph
npx copilotkit@latest import --source langgraph --dry-run`;

const DEST = `export INTELLIGENCE_API_URL="https://..."
export INTELLIGENCE_API_KEY="cpk_..."`;

const AGENT_MAP = `{
  "support-agent": "support-agent",
  "sales-agent": "sales-agent"
}`;

const IMPORTED: [string, boolean][] = [
  ["user, assistant, tool, system, and developer messages", true],
  ["tool calls and tool results", true],
  ["reasoning traces, when the source exposes them", true],
  ["media that can be resolved during extraction", true],
  ["original timestamps", true],
  ["import provenance and per-conversation outcomes", true],
  ["agent state snapshots", false],
  ["framework transport noise", false],
  ["LangSmith traces", false],
  ["unsupported source stores", false],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads-import" />

      <Callout tone="warn" title="Neither supported source is Strands">
        <p className="mb-2">
          This page is served under <code>/strands-typescript</code> and its
          Supported sources table has exactly two rows:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Google ADK</strong> — import guide at{" "}
            <code>/google-adk/threads-import</code>
          </li>
          <li>
            <strong>LangGraph</strong> — import guide at{" "}
            <code>/langgraph-python/threads-import</code>
          </li>
        </ul>
        <p className="mt-2">
          There is no Strands importer. A reader who arrives here from the
          Strands sidebar can run the dry run and will discover nothing to
          import, because <code>--source</code> accepts neither{" "}
          <code>strands</code> nor anything equivalent. The page says &quot;more
          sources coming soon&quot; and does not say Strands is absent.
        </p>
      </Callout>

      <Panel title="Why this route has no demo">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Unlike every other route in this harness, there is no application code
          on this page to implement — no component, no hook, no runtime option.
          It is a CLI workflow end to end: select a project, dry-run, map agent
          ids, export destination credentials, import, verify in the drawer.
          The only artefact it publishes is a JSON mapping file. So this route
          is reference material, reproduced below, rather than a surface.
        </p>
      </Panel>

      <Panel title="The flow, as published">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          <strong>1. Confirm the target project.</strong>{" "}
          <code>npx copilotkit@latest project select</code> — updates the
          project selected for the current directory and writes its
          project-scoped runtime key to the app&apos;s generated{" "}
          <code>.env</code>.
        </p>
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
          <strong>2. Run a dry run.</strong> Reads the source, discovers agent
          keys, counts conversations, reports skips, estimates upload size. Needs
          no Intelligence URL or key.
        </p>
        <CodeBlock code={DRY_RUN} language="bash" />
        <p className="mb-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
          <strong>3. Map source agents</strong> to the <code>agentId</code> your
          live runtime uses, so imported history and future traffic do not split
          across different ids.
        </p>
        <CodeBlock code={AGENT_MAP} language="json" filename="agent-map.json" />
        <p className="mb-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
          <strong>4. Prepare the destination.</strong> The importer reads the
          current process environment and does <em>not</em> load{" "}
          <code>.env</code> or <code>.copilotkit/project.json</code>, so the
          values have to be exported by hand.
        </p>
        <CodeBlock code={DEST} language="bash" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <strong>5–7.</strong> Run the source-specific import, verify a
          conversation in the drawer, then keep future runs continuous by
          reopening conversations with the same CopilotKit{" "}
          <code>threadId</code>. Re-running an import is safe — already-imported
          conversations are skipped — and <code>--replace</code> refreshes them
          deliberately.
        </p>
      </Panel>

      <Panel title="What gets imported, and what does not">
        <ul className="space-y-1.5 text-sm">
          {IMPORTED.map(([item, yes]) => (
            <li key={item} className="flex items-baseline gap-2">
              <span
                className={
                  yes
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }
              >
                {yes ? "✓" : "✕"}
              </span>
              <span className="text-slate-700 dark:text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Callout tone="info" title="The one detail worth stealing">
        <p>
          Two credentials are involved and they are easy to conflate. The{" "}
          <code>INTELLIGENCE_API_KEY</code> is project-scoped and belongs on the
          server; the application user is separate and comes from{" "}
          <code>identifyUser</code>. The lifecycle page says it directly: do not
          use the developer who created the key as the application user, or
          every visitor shares one thread scope.
        </p>
      </Callout>
    </>
  );
}
