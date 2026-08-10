import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const ZERO_CONFIG = `// Opt in to CopilotKit's built-in default tool-call card. Called with
// no config so the package-provided \`DefaultToolCallRenderer\` is used
// as the wildcard renderer — this is the "out-of-the-box" UI the cell
// is meant to showcase.
useDefaultRenderTool();`;

const BACKEND_SECTION = `## The backend tool definition

The frontend renderer only sees what the agent sends down. Here's the
matching backend definition for \`get_weather\`: expose a tool named
\`get_weather\`, return structured data, and let the frontend renderer with
the same name paint the card.

<!-- snippet skipped: region 'weather-tool-backend' missing in strands-typescript::tool-rendering -->`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Deciding how each tool call looks in the chat. Three levels, all
          registered on this route: <code>useDefaultRenderTool()</code> with no
          arguments for CopilotKit&apos;s built-in status card,{" "}
          <code>useDefaultRenderTool({"{ render }"})</code> for a branded
          catch-all, and <code>useRenderTool({"{ name, parameters, render }"})</code>{" "}
          per tool. Named renderers claim the interesting tools and the wildcard
          handles the rest. Each renderer sees the parsed arguments, a live{" "}
          <code>status</code>, and the <code>result</code> once it arrives —
          which is why the cards below render a &quot;fetching&quot; state as
          well as a finished one.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What's the weather in Berlin?",
              "Find me flights from SFO to JFK",
            ]}
            expect="The weather question draws a branded WeatherCard — city, a large temperature, humidity and wind — with a 'calling weather api…' pill while the call is in flight. The flights question does not: the agent says it has no such tool."
            fail="The weather answer arrives as plain text with no card. The renderer's name and the tool's name have to match exactly for the runtime to route the call."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The page still does not publish either backend tool">
        <p className="mb-3">
          This is the entire backend section of the page, unchanged:
        </p>
        <CodeBlock code={BACKEND_SECTION} language="text" />
        <p className="mt-3">
          The heading promises the tool definition, the paragraph describes what
          it should do, and the code is a marker saying the region is missing.
          Neither <code>get_weather</code> nor <code>search_flights</code>
          appears anywhere in the Strands TypeScript tree — not on this page,
          not in the published <code>agent.ts</code>, not in{" "}
          <code>tools.ts</code>, which is a tab title with no body.
        </p>
        <p className="mt-3">
          <strong>
            The <code>get_weather</code> tool this route runs was supplied
            separately, not taken from the docs.
          </strong>{" "}
          It is reproduced verbatim in{" "}
          <code>backend/src/agents/tools.ts</code>, and the{" "}
          <code>getWeatherImpl</code> it delegates to had to be written — that
          function belongs to the unpublished <code>tools</code> module, and only
          its return shape is recoverable, from the{" "}
          <code>WeatherResult</code> interface the published{" "}
          <code>page.tsx</code> declares. Having the code in hand does not change
          what the documentation contains, which is why this warning stays.
        </p>
        <p className="mt-3">
          <code>search_flights</code> has had no such donation, so its renderer
          is still registered against a tool that does not exist — which is
          exactly what a reader following these docs alone ends up with for
          both.
        </p>
      </Callout>

      <Panel
        title="The backend tool"
        description="Supplied separately — the doc page prints a placeholder here. getWeatherImpl is written to the shape the published renderer reads."
      >
        <SourceCode file="backend/src/agents/tools.ts" />
      </Panel>

      <Panel title="The demo and the cards it draws">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/tool-rendering/cards.tsx" },
          ]}
          note={
            <>
              The three cards and <code>parseJsonResult</code> are imported by
              the page&apos;s own <code>page.tsx</code> and published nowhere.
              Their prop lists are recovered from the call sites, which pass
              every prop by name.
            </>
          }
        />
      </Panel>

      <Panel
        title="Zero-config, for comparison"
        description="The page's first example — the built-in card, with no UI of your own."
      >
        <CodeBlock code={ZERO_CONFIG} language="tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Worth knowing for the failure mode it prevents: without any wildcard
          renderer the runtime has no <code>*</code> entry and tool calls are
          invisible in the DOM entirely. The user sees only the assistant&apos;s
          closing text summary and no evidence a tool ran.
        </p>
      </Panel>
    </>
  );
}
