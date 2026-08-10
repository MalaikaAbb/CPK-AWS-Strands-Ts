import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/sidebar" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotSidebar&gt;</code> is <code>&lt;CopilotChat&gt;</code>{" "}
          in a docked shell. It renders as a sibling of your content rather than
          a wrapper around it, so opening and closing it never reflows the page.
          The two props it adds beyond the base component are{" "}
          <code>defaultOpen</code> and the <code>header</code> /{" "}
          <code>toggleButton</code> slots.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What is this page showing me?", "Close yourself"]}
            expect="The sidebar starts open (defaultOpen), the toggle collapses it, and the main column does not move."
            fail="The content jumps when you toggle — that means the sidebar is wrapping your layout rather than sitting beside it."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/sidebar/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="warn" title="Two of the three components in the doc's snippet are not published">
        <p>
          The page&apos;s basic-setup block is{" "}
          <code>
            &lt;MainContent /&gt; &lt;CopilotSidebar … /&gt; &lt;Suggestions /&gt;
          </code>
          . Only the middle one exists in a package. <code>MainContent</code>{" "}
          and <code>Suggestions</code> are local to CopilotKit&apos;s demo app
          and neither body is shown, so the main content here is this
          repo&apos;s and the suggestions go through the exported{" "}
          <code>useConfigureSuggestions</code>.
        </p>
      </Callout>
    </>
  );
}
