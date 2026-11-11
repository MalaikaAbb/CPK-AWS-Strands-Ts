import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/custom-look-and-feel/reasoning-messages";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/reasoning-messages" />

      <Callout tone="warn" title="Broken: the agent never sends reasoning">
        <p>
          Every variant on this page restyles a reasoning message, and none can
          be seen: the demos&apos; Strands agent gets its model from the
          unpublished <code>./model-factory</code>, the module that asks
          OpenAI&apos;s Responses API for reasoning summaries. This repo&apos;s{" "}
          <code>./model</code> stands in and requests none, so no{" "}
          <code>REASONING_MESSAGE_*</code> event arrives. Same agent and same
          gap as <code>/generative-ui/reasoning</code>.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Four ways to restyle the reasoning card: leave it alone; replace just
          its <code>header</code> and <code>contentView</code> sub-slots and
          keep the built-in collapse behaviour; keep the built-in parts but
          rearrange them through <code>CopilotChatReasoningMessage</code>&apos;s
          render-prop children; or swap the whole component for your own. The
          demo has a switch for each.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain step by step why the sky appears blue during the day but red at sunset.",
            ]}
            expect="As shipped: in every variant the answer streams as plain text with no reasoning card, header, render-prop box or amber block (the agent sends no reasoning events). The Default variant shows the page's suggestion pill."
            fail={
              <>
                An error or no stream: check that <code>/reasoning/</code> is
                mounted (<code>GET /health</code>). A reasoning card appearing
                means the model setup changed; re-check the status.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="Sub-slots and render-prop — the page's snippets">
        <SourceCode file={`${DIR}/_snippets/slot-snippets.tsx`} />
      </Panel>

      <Panel title="Default and fully custom — the page's demo Code tab">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/_demo/reasoning-default/page.tsx` },
            { file: `${DIR}/_demo/reasoning-default/suggestions.ts` },
            { file: `${DIR}/_demo/reasoning-custom/page.tsx` },
            { file: `${DIR}/_demo/reasoning-custom/reasoning-block.tsx` },
            { file: "backend/src/agents/reasoning-agent.ts" },
          ]}
          note={
            <>
              The Code tab&apos;s <code>route.ts</code> maps both demo names to{" "}
              <code>/reasoning/</code>; those two entries are added to this
              repo&apos;s <code>/api/copilotkit</code>.
            </>
          }
        />
      </Panel>

      <Callout tone="warn" title="Swapped, added or commented out">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <code>./model-factory</code> is unpublished; the agent imports this
            repo&apos;s <code>createModel</code>. The published options stay on
            the call under <code>@ts-expect-error</code> and are ignored.
          </li>
          <li>
            The snippets&apos; bare <code>&lt;CopilotChat messageView=… /&gt;</code>{" "}
            lines name no agent or provider. They are wrapped unchanged in{" "}
            <code>SlotsChat</code> / <code>RenderPropChat</code> and mounted
            under a repo-added <code>&lt;CopilotKit agent=&quot;reasoning-default&quot;&gt;</code>.
          </li>
          <li>
            <code>reasoning-custom</code>&apos;s <code>./suggestions</code> is
            unpublished; commented out.
          </li>
          <li>
            The Custom Header snippet spreads every other prop onto its{" "}
            <code>&lt;button&gt;</code>, including <code>elapsedSeconds</code>,
            which the page&apos;s own prop table says the header receives.
            React would warn about it on a DOM element if a header ever
            rendered. Kept as published.
          </li>
        </ul>
      </Callout>
    </>
  );
}
