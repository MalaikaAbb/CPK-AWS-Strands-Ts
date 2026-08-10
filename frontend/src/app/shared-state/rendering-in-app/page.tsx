import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/rendering-in-app" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>agent.state</code> is plain React data, and{" "}
          <code>useAgent</code> works in any component under the provider — not
          just near the chat. So a canvas, dashboard, map or table can subscribe
          to the same state object the chat uses and re-render whenever it
          changes. The sidebar is not special; it is just another consumer.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Add an item with label 'shopping', mark done as true",
              "Tick an item, then ask: what have I finished?",
            ]}
            expect="The agent answers from the canvas contents, and its answer changes after you tick something — proving the same state object reached both surfaces."
            fail="The agent says it cannot see any checklist. The stateContextBuilder is not folding state into the prompt; on Strands nothing else will."
          />
        </div>
      </Panel>

      <Panel
        title="The demo and the canvas"
        description="Canvas.tsx is the doc's, verbatim, including the useAgent() call with no agentId."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/shared-state/rendering-in-app/canvas.tsx" },
            { file: "frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx" },
          ]}
        />
      </Panel>

      
    </>
  );
}
