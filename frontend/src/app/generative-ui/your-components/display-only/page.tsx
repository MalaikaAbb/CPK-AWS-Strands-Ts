import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const NO_PARAMS = `useComponent({
  name: "showGreeting",
  render: ({ message }: { message: string }) => (
    <div className="rounded border p-3 bg-blue-50">
      <p>{message}</p>
    </div>
  ),
});`;

const SCOPED = `useComponent({
  name: "renderProfile",
  parameters: z.object({ userId: z.string() }),
  render: ProfileCard,
  agentId: "support-agent",
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/your-components/display-only" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same <code>useComponent</code> primitive as Components-as-Tools,
          from the page that actually shows the component. No handler, no
          interaction, no server-side execution — the agent decides when to show
          it and supplies the props, Zod validates them on the way in, and
          CopilotKit renders it inline.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What's the weather in Denver?",
              "Show me the weather for Lisbon and Oslo.",
            ]}
            expect="A small bordered card with the city, a large temperature and a grey condition line. Ask for two cities and you get two cards."
            fail="A plain sentence describing the weather. The component was registered but the model did not call it — the tool name showWeather is camelCase and less verb-like than the docs' own advice suggests."
          />
        </div>
      </Panel>

      <Panel
        title="The demo"
        description="Unusually, this page publishes every symbol its example uses. Nothing below is reconstructed."
      >
        <SourceCode file="frontend/src/app/generative-ui/your-components/display-only/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The two variants the page also documents">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Without a schema, when the props are simple enough not to need one:
        </p>
        <CodeBlock code={NO_PARAMS} language="tsx" />
        <p className="mb-3 mt-4 text-sm text-slate-600 dark:text-slate-400">
          And scoped to one agent, for multi-agent setups:
        </p>
        <CodeBlock code={SCOPED} language="tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The second is worth noting against this harness: every route here
          names its agent with <code>agentId</code> for exactly this reason,
          since one provider serves 24 of them.
        </p>
      </Panel>

      <Callout tone="success" title="Why it works with no backend section">
        <p>
          This page has no backend half at all — not even a placeholder. It
          works because <code>@ag-ui/aws-strands</code> syncs the runtime&apos;s
          forwarded tool declarations onto the Strands tool registry per run, so
          a component registered here arrives at the model as a callable tool
          with no agent-side wiring. That is a fact about the adapter, taken
          from its type definitions, not from any doc page.
        </p>
      </Callout>
    </>
  );
}
