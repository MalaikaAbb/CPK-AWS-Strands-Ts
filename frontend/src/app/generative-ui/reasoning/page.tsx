import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/reasoning/_demo";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/reasoning" />

      <Callout tone="warn" title="Broken: the model setup the agent needs is unpublished">
        <p>
          The page&apos;s agent builds its model with{" "}
          <code>
            createModel(&#123; openaiApi: &quot;responses&quot;, reasoning: true,
            openaiModelId &#125;)
          </code>{" "}
          from <code>./model-factory</code>, which no page publishes. That
          factory is what asks OpenAI&apos;s Responses API for reasoning
          summaries. This repo swaps in its own <code>./model</code> (the
          Quickstart&apos;s construction), which has none of those options, so
          the agent answers normally and never emits{" "}
          <code>REASONING_MESSAGE_*</code> events. Neither the default card nor
          the custom block can appear. Not filled in on purpose.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Reasoning tokens arrive as their own message type, and the chat draws
          them without any setup in the built-in card (a live
          &quot;Thinking…&quot; that collapses into &quot;Thought for N
          seconds&quot;). Passing a component as{" "}
          <code>messageView.reasoningMessage</code> replaces that card; the
          component gets the reasoning message, the message list and{" "}
          <code>isRunning</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain step by step why the sky appears blue during the day but red at sunset.",
            ]}
            expect="As shipped: a normal streamed answer in both variants, with no reasoning card and no amber Reasoning block — the backend never sends reasoning events (see the callout). The default variant shows the page's suggestion pill; the custom one has none."
            fail={
              <>
                The chat errors or nothing streams: check that the backend
                mounts <code>/reasoning/</code> (<code>GET /health</code>). If a
                reasoning card <em>does</em> appear, the model setup changed;
                re-check the status.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="The agent — from the page's Code tab">
        <SourceCode file="backend/src/agents/reasoning-agent.ts" />
      </Panel>

      <Panel title="The two demos — as published">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/reasoning-default/page.tsx` },
            { file: `${DIR}/reasoning-default/suggestions.ts` },
            { file: `${DIR}/reasoning-custom/page.tsx` },
            { file: `${DIR}/reasoning-custom/reasoning-block.tsx` },
          ]}
          note={
            <>
              The page&apos;s <code>route.ts</code> maps both demo names to the
              agent&apos;s dedicated <code>/reasoning/</code> mount. Those two
              entries are added to this repo&apos;s <code>/api/copilotkit</code>{" "}
              runtime instead of copying the showcase&apos;s 40-name route.
            </>
          }
        />
      </Panel>

      <Callout tone="warn" title="Swapped, left out or commented out">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <code>./model-factory</code> is unpublished; the agent imports this
            repo&apos;s <code>createModel</code> from <code>./model</code>. The
            published options are kept on the call under{" "}
            <code>@ts-expect-error</code>; they are ignored.
          </li>
          <li>
            <code>reasoning-custom</code>&apos;s <code>./suggestions</code> is
            unpublished (only the default demo&apos;s is in the Code tab); its
            import and call are commented out.
          </li>
          <li>
            The agent file also defines four mock tools and{" "}
            <code>buildReasoningChainAgent</code> for a different demo
            (tool-rendering-reasoning-chain); they are left out.
          </li>
          <li>
            The page&apos;s prose snippets drop the imports; the Code-tab
            versions mounted here have them.
          </li>
        </ul>
      </Callout>
    </>
  );
}
