import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const TABLE: [string, string, string][] = [
  [
    "useHumanInTheLoop",
    "The LLM, by calling a registered client-side tool",
    "A frontend-only tool description (Zod schema + render)",
  ],
  [
    "useInterrupt",
    "The graph, by calling interrupt(...) during a node",
    "A server-side interrupt() call in your LangGraph agent",
  ],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A run that stops mid-turn and waits for a person.{" "}
          <code>useHumanInTheLoop</code> registers a client-side tool with a{" "}
          <code>render</code> function instead of a handler; when the model
          calls it, CopilotKit paints the component inline and holds the run
          open until <code>respond(...)</code> is called. The answer arrives at
          the model as that tool&apos;s result, so the agent keeps its context
          and carries on from there.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Please book an intro call with the sales team to discuss pricing.",
              "Schedule a 1:1 with Alice next week to review Q2 goals.",
            ]}
            expect="A time-picker card appears in the chat and the reply stops there. Pick a slot and the run resumes — the agent confirms the specific time you chose, which proves respond() reached it."
            fail="The agent invents a time without showing a card, or the card appears and picking a slot does nothing. The second means respond() is not wired."
          />
        </div>
      </Panel>

      <Panel
        title="The demo and the card it renders"
        description="The hook call is the doc's, verbatim. TimePickerCard is imported by it and published nowhere."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/human-in-the-loop/demo-chat/page.tsx" },
            { file: "frontend/src/app/human-in-the-loop/time-picker-card.tsx" },
          ]}
        />
      </Panel>

      <Panel
        title="The page's own comparison table"
        description="Reproduced because it is the clearest statement of why half this page does not apply here."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Pattern", "Who decides to pause?", "Backend surface"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE.map(([pattern, who, backend]) => (
                <tr key={pattern}>
                  <td className="border-b border-slate-100 px-2 py-2 font-mono text-xs dark:border-slate-800">
                    {pattern}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                    {who}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                    {backend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

     
    </>
  );
}
