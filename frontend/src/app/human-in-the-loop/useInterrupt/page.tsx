import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/human-in-the-loop/useInterrupt/_demo";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/useInterrupt" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A backend tool pauses itself with Strands&apos; native{" "}
          <code>context.interrupt(...)</code>. The adapter ends the run with{" "}
          <code>RUN_FINISHED</code> whose outcome is an interrupt;{" "}
          <code>useInterrupt</code> renders a time picker inline in the chat,
          and <code>resolve(...)</code> resumes the run on the same thread, so
          the tool continues with the user&apos;s choice as the interrupt&apos;s
          return value.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Book an intro call with the sales team to discuss pricing.",
              "Schedule a 1:1 with Alice next week to review Q2 goals.",
            ]}
            expect="A time-picker card appears in the chat and the run stops. Pick a slot: the run resumes and the agent confirms that exact time (the tool's 'Meeting scheduled for …'). Cancel instead: the agent says the meeting was not scheduled."
            fail={
              <>
                The agent answers without a card: check the Inspector for a{" "}
                <code>RUN_FINISHED</code> with <code>outcome.type</code>{" "}
                <code>&quot;interrupt&quot;</code>. If the card appears but the
                agent says no time was picked, the resume payload shape did not
                match <code>readResume</code>.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="The agent — as published">
        <SourceCode
          file="backend/src/agents/interrupt-agent.ts"
        />
      </Panel>

      <Panel title="The page — as published">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/gen-ui-interrupt/page.tsx` },
            { file: `${DIR}/gen-ui-interrupt/_components/time-picker-card.tsx` },
          ]}
          note={
            <>
              The page&apos;s <code>route.ts</code> maps{" "}
              <code>gen-ui-interrupt</code> to the agent&apos;s dedicated{" "}
              <code>/interrupt/</code> mount. Those two entries are added to this
              repo&apos;s <code>/api/copilotkit</code> runtime rather than
              replacing it with the showcase&apos;s 40-name route.
            </>
          }
        />
      </Panel>

      <Callout tone="warn" title="Written in or commented out">
        <ul className="space-y-1.5">
          <li>
            · <code>./card</code>, <code>./button</code> and{" "}
            <code>./badge</code> (shadcn primitives the time picker imports) are
            unpublished. Minimal, labelled versions sit next to it.
          </li>
          <li>
            · <code>../_shared/interrupt-fallback-slots</code> is unpublished.{" "}
            <code>generateFallbackSlots</code> returns four fixed slots; the
            published agent never sends slots, so these are always the ones
            shown.
          </li>
          <li>
            · <code>./suggestions</code> (<code>useGenUiInterruptSuggestions</code>)
            is unpublished; its import and call are commented out, so there are
            no suggestion pills.
          </li>
          <li>
            · <code>./model-factory</code> is unpublished; the agent imports
            this repo&apos;s <code>createModel</code> from <code>./model</code>.
          </li>
          <li>
            · The page says the pinned <code>@ag-ui/aws-strands</code> is 0.2.3.
            This repo runs 1.0.1; <code>readResume</code> accepts both payload
            shapes the page describes.
          </li>
        </ul>
      </Callout>
    </>
  );
}
