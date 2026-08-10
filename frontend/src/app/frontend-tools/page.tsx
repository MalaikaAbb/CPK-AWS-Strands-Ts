import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool whose body runs in the browser. The agent calls{" "}
          <code>change_background</code> like any other tool; the handler
          executes in the tab, closes over React state, and returns a value that
          goes back to the model as the tool result. That is the difference from
          a backend tool — the handler has the user&apos;s DOM, their{" "}
          <code>localStorage</code>, and whatever UI library the page already
          loaded.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make the background a warm sunset gradient",
              "Change the background to something calm and blue",
            ]}
            expect="The background transitions to a new CSS gradient within a second, the value under the heading updates, and the agent confirms in text."
            fail="The agent describes a gradient in words but nothing moves. The tool declaration did not reach the model — check the runtime is registering the frontend-tools agent."
          />
        </div>
      </Panel>

      <Panel
        title="The demo and the component it paints into"
        description="The hook call is the doc's, verbatim. Background is not published."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/frontend-tools/demo-chat/page.tsx" },
            { file: "frontend/src/app/frontend-tools/background.tsx" },
          ]}
        />
      </Panel>

      
    </>
  );
}
