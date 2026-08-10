import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const V1_INLINE = `import { CopilotKitCSSProperties } from "@copilotkit/react-ui";

<div
  style={
    {
      "--copilot-kit-primary-color": "#222222",
    } as CopilotKitCSSProperties
  }
>
  <CopilotSidebar />
</div>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/css" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Re-skinning the chat without touching a component. The page covers
          three mechanisms and this route exercises all three: the{" "}
          <code>.copilotKit*</code> class hooks, the v2 shadcn design tokens
          on <code>[data-copilotkit]</code>, and the scoping trick that keeps
          both from leaking — every selector nested under one wrapper class,
          with the stylesheet imported from the page module.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Send anything at all"]}
            expect="Your message renders in JetBrains Mono on a parchment card with a copper left rule and a → prefix. The send button and focus ring pick up the ember primary token."
            fail="A default-looking chat. The stylesheet did not load, or the .chat-css-demo-scope wrapper is missing from the tree."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/css/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="theme.css"
        description="Exactly the blocks the doc publishes — see the note below about what it doesn't."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/css/theme.css" />
      </Panel>

     
    </>
  );
}
