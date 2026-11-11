import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

// The only code this page carries for strands-typescript, taken from its
// Markdown export (state-rendering.md), verbatim. The rendered page replaces
// every code block with a "Not supported" note. It is a fragment of the
// showcase's page.tsx, not a whole file, so it is shown and not run.
const USE_AGENT_FRAGMENT = `// src/app/demos/shared-state-streaming/page.tsx
  // Subscribe to BOTH state changes and run-status changes. The former
  // drives the per-token document rerender; the latter toggles the
  // "LIVE" badge when the agent starts / stops.
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/state-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          UI driven by agent state: a component subscribes with{" "}
          <code>useAgent</code> to state and run-status changes and re-renders
          as the backend pushes new values. The page is really about the
          backend half, a mapping that copies a tool argument into state while
          the model is still writing it, so the document fills in token by
          token.
        </p>
      </Panel>

      <Callout tone="warn" title="Reference only: the page says Strands TypeScript is not supported">
        <p>
          Checked 2026-11-11: the rendered page shows &ldquo;Not supported on
          AWS Strands (TypeScript)&rdquo; where its code should be and has no
          Code tab. Its Markdown export prints{" "}
          <code>setup skipped: state-streaming-setup</code> and{" "}
          <code>snippet skipped: region &apos;state-streaming-middleware&apos;</code>{" "}
          for this framework. So no agent, no state-streaming tool, no document
          view and no runtime wiring are published. Nothing runs on this route.
        </p>
        <p className="mt-2">
          Missing: the demo&apos;s <code>page.tsx</code> around the fragment
          below, its document component, the <code>shared-state-streaming</code>{" "}
          agent and the tool whose argument is streamed into state. Not filled
          in. The closest working thing in this repo is{" "}
          <code>/shared-state/rendering-in-app</code>, which renders state but
          does not stream it.
        </p>
      </Callout>

      <Panel title="Published code (Markdown export, verbatim)">
        <CodeBlock code={USE_AGENT_FRAGMENT} language="typescript" filename="state-rendering.md" />
      </Panel>
    </>
  );
}
