import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/human-in-the-loop/headless/_demo";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/headless" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same native Strands interrupt as the useInterrupt route, but the
          picker renders outside the chat. <code>useInterrupt</code> runs with{" "}
          <code>renderInChat: false</code> and hands back the element, which
          the page places in its own app panel next to the chat.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Book a call with the design team to review the new onboarding flow."]}
            expect="The chat pauses and a time-slot popup appears in the app panel beside the chat, not in the transcript. Pick a slot: the panel clears and the agent confirms that time."
            fail="The picker shows inside the chat transcript (renderInChat ignored), or nothing appears: check the Inspector for a RUN_FINISHED with an interrupt outcome."
          />
        </div>
      </Panel>

      <Panel title="The page — as published">
        <SourceCodeGroup
          files={[{ file: `${DIR}/interrupt-headless/page.tsx` }]}
          note={
            <>
              The agent is the same published{" "}
              <code>backend/src/agents/interrupt-agent.ts</code>, reached as{" "}
              <code>interrupt-headless</code> on <code>/api/copilotkit</code>.
            </>
          }
        />
      </Panel>

      <Callout tone="warn" title="Written in">
        <ul className="space-y-1.5">
          <li>
            · <code>../_shared/interrupt-fallback-slots</code> (
            <code>generateFallbackSlots</code>, <code>TimeSlot</code>) is
            unpublished. <code>_shared/interrupt-fallback-slots.ts</code>{" "}
            re-exports the useInterrupt route&apos;s labelled version.
          </li>
          <li>
            · <code>./model-factory</code> is unpublished; the agent uses this
            repo&apos;s <code>createModel</code>.
          </li>
        </ul>
      </Callout>
    </>
  );
}
