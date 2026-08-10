import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/popup" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotPopup&gt;</code> is the same chat again, this time
          behind a floating launcher that overlays the page. It is the
          lowest-footprint way to add a copilot to an app you do not want to
          re-layout. This route also exercises <code>labels</code>, which the
          doc&apos;s snippet uses to change the composer placeholder.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What is this popup for?", "Say hello in one sentence."]}
            expect={'The popup starts open, the composer placeholder reads "Ask the popup anything...", and closing it leaves a bubble in the corner.'}
            fail="The default placeholder text — labels did not reach the input slot."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/popup/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="Where the inspector button went">
        <p>
          The popup and sidebar launchers both live bottom-right, which is also
          where the CopilotKit inspector puts its button. The root provider in{" "}
          <code>components/providers.tsx</code> anchors the inspector
          bottom-left for exactly this reason.
        </p>
      </Callout>
    </>
  );
}
