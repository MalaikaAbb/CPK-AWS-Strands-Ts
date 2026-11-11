import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

// The only code this page carries for strands-typescript, from its Markdown
// export (shared-state/streaming.md), verbatim. The rendered page shows a
// "Not supported on AWS Strands (TypeScript)" notice in place of its code.
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
      <RouteHeader path="/shared-state/streaming" />

      <Panel title="What it covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          State streaming: the backend maps one streaming tool argument (the
          page&apos;s example is <code>write_document.document</code>) to one
          state key and emits it while the model is still generating, so the
          UI, subscribed with <code>useAgent</code>, re-renders as the text
          grows. When the tool finishes, its return value overwrites the same
          key.
        </p>
      </Panel>

      <Callout tone="warn" title="Reference only: the page says Strands TypeScript is not supported">
        <p>
          Checked 2026-11-11: the rendered page shows &ldquo;Not supported on
          AWS Strands (TypeScript)&rdquo; and embeds no demo. Its{" "}
          <code>.md</code> skips <code>state-streaming-setup</code> and the{" "}
          <code>state-streaming-middleware</code> snippet for this framework.
          The prose says direct SDK adapters emit <code>STATE_SNAPSHOT</code>{" "}
          from their streaming loop, but shows no Strands code for it. No
          agent, no <code>write_document</code> tool, no document view.
          Nothing is filled in; there is no demo here.
        </p>
        <p className="mt-2">
          Same gap as{" "}
          <Link className="underline" href="/generative-ui/state-rendering">
            State Rendering
          </Link>
          , which shows the same fragment.
        </p>
      </Callout>

      <Panel title="Published code (Markdown export, verbatim)">
        <CodeBlock code={USE_AGENT_FRAGMENT} language="typescript" filename="shared-state/streaming.md" />
      </Panel>
    </>
  );
}
