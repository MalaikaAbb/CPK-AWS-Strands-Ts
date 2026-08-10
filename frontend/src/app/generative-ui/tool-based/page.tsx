import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-based" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>useComponent</code> registers a React component as a tool. The
          runtime exposes it to the agent by name, Zod validates whatever the
          model produces, and CopilotKit renders the component inline with those
          arguments as props. There is no handler and no return value — the
          component <em>is</em> the tool, which is the line this page draws
          against tool rendering (which decorates a real backend tool) and
          human-in-the-loop (which waits for an answer).
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Chart this quarterly revenue: Q1 120, Q2 145, Q3 132, Q4 189.",
              "Make up five plausible monthly signup numbers and chart them.",
            ]}
            expect="A bar chart renders inline in the chat with your labels on the x axis. The agent does not describe the chart in text — it draws it."
            fail="A markdown table or a bulleted list instead of a chart. The tool declaration did not reach the model."
          />
        </div>
      </Panel>

      <Panel
        title="The demo and the component it renders"
        description="One of these two files is published. The other is named twice and shown never."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/tool-based/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/tool-based/bar-chart.tsx" },
          ]}
        />
      </Panel>
    </>
  );
}
