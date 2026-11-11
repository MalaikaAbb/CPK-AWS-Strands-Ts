import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DEMO = "frontend/src/app/shared-state/_demo/shared-state-read-write";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two-way shared state. The UI reads <code>agent.state</code> through{" "}
          <code>useAgent</code> with <code>OnStateChanged</code> and writes back
          with <code>agent.setState</code>. On the page, the agent fills a notes
          list through a tool, a card renders it, and a preferences form feeds
          the agent&apos;s next turn.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Remember that I prefer short answers and I'm learning Spanish."]}
            expect="As shipped: the chat answers, and the Agent Scratch pad stays on its empty placeholder. Nothing can write notes (set_notes is unpublished), and there is no preferences form to call handlePreferencesChange."
            fail="An agent-not-found error: shared-state-read-write is not mounted on the backend (GET /health)."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Broken: no Strands backend, no notes writer, no preferences UI">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            The page&apos;s backend setup is <code>setup skipped:
            shared-state-setup</code> for Strands TypeScript, and the
            streaming section&apos;s snippet is skipped too. The agent&apos;s{" "}
            <code>set_notes</code> tool is named and never printed. It is not
            filled in, so the notes card stays empty.
          </li>
          <li>
            The page prints <code>handlePreferencesChange</code> but not the
            preferences form that calls it, and no handler for{" "}
            <code>NotesCard</code>&apos;s <code>onClear</code>.
          </li>
          <li>
            The write fragment&apos;s comment credits{" "}
            <code>PreferencesInjectorMiddleware</code>, a LangGraph mechanism.
            On Strands, state reaches the model through a{" "}
            <code>stateContextBuilder</code> (see{" "}
            <Link className="underline" href="/shared-state/in-app-agent-write">
              Writing agent state
            </Link>
            ).
          </li>
        </ul>
      </Callout>

      <Callout tone="info" title="What is doc code here">
        The page has no demo. It prints three snippets: the{" "}
        <code>useAgent</code> read and the <code>handlePreferencesChange</code>{" "}
        write from <code>page.tsx</code>, and the <code>NotesCard</code>{" "}
        function. Those are verbatim. The rest of <code>page.tsx</code> is
        minimal glue: the provider, a chat, the types the fragments name, the{" "}
        <code>notes</code> value, mounting <code>NotesCard</code>.{" "}
        <code>notes-card.tsx</code>&apos;s imports and{" "}
        <code>NotesCardProps</code> are added. Card and button are{" "}
        <strong>this repo&apos;s stand-ins</strong> (the useInterrupt
        route&apos;s shadcn-shaped primitives), not from the doc page. The agent
        is this repo&apos;s existing state-mirror agent, which has no{" "}
        <code>set_notes</code>.
      </Callout>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: `${DEMO}/page.tsx` },
            { file: `${DEMO}/notes-card.tsx` },
          ]}
        />
      </Panel>
    </>
  );
}
