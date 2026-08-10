import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const TREE = `Card
 └─ Column
     ├─ Title        ("Flight Details")
     ├─ Row          (Airport → Arrow → Airport)
     ├─ Row          (AirlineBadge · PriceTag)
     └─ Button       (Book)`;

const SKIPPED = `<WhenFrameworkHas flag="a2ui_pattern" equals="llm-driven">
<Step>
### Generate the schema dynamically

Mastra and Strands take a different route: the agent tool runs a
*secondary* LLM call with a forced tool choice that produces the
operations container per-request. …

<!-- snippet skipped: region 'backend-render-operations' missing in strands-typescript::a2ui-fixed-schema -->
</Step>
</WhenFrameworkHas>`;

const PUBLISHED_TOOL = `const displayFlight = tool({
  name: "display_flight",
  description: "Show a flight card for the given trip. …",
  inputSchema: z.object({
    origin: z.string().describe('Origin airport code, e.g. "SFO".'),
    destination: z.string().describe('Destination airport code, e.g. "JFK".'),
    airline: z.string().describe('Airline name, e.g. "United".'),
    price: z.string().describe('Price string, e.g. "$289".'),
  }),
  callback: ({ origin, destination, airline, price }) => ({
    [A2UI_OPERATIONS_KEY]: [
      createSurface(A2UI_FIXED_SURFACE_ID, A2UI_FIXED_CATALOG_ID),
      updateComponents(A2UI_FIXED_SURFACE_ID, FLIGHT_SCHEMA),  // ← the missing file
      updateDataModel(A2UI_FIXED_SURFACE_ID, { origin, destination, airline, price }),
    ],
  }),
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Panel title="What it would demonstrate">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The opposite trade from dynamic schema. The component tree is designed
          once, up front, and lives on the agent side; the tool supplies only the
          four data fields. No secondary LLM call, no schema drift, and the
          surface paints on the first frame. The catalog is five domain
          primitives — <code>Title</code>, <code>Airport</code>,{" "}
          <code>Arrow</code>, <code>AirlineBadge</code>,{" "}
          <code>PriceTag</code> — merged with CopilotKit&apos;s built-ins, and
          the tree composes them like this:
        </p>
        <div className="mt-4">
          <CodeBlock code={TREE} />
        </div>
      </Panel>

      <Callout tone="warn" title="Why this route has no demo">
        <p className="mb-3">
          This is the one route in the harness where the missing piece is data,
          not code. The agent tool is published <em>in full</em> — it is the
          most complete backend snippet in the entire Strands TypeScript tree:
        </p>
        <CodeBlock
          code={PUBLISHED_TOOL}
          language="ts"
          filename="src/agent/agent.ts, buildA2uiFixedSchemaAgent (as published)"
        />
        <p className="mt-3">
          <code>FLIGHT_SCHEMA</code> is the component tree, parsed at module
          load from <code>./a2ui_schemas/flight_schema.json</code>. That file is
          on no page. The tree above is drawn as an ASCII diagram in the doc and
          given as data nowhere, so there is a tool with nothing to render and a
          catalog with nothing to receive. Building the JSON here would be
          inventing the exact artefact the page withholds, so the route stops
          at the diagram.
        </p>
      </Callout>

      <Callout tone="warn" title="Every backend step on the page is a skipped snippet">
        <p className="mb-3">
          There are five <code>snippet skipped</code> markers and no backend
          code. Three of them are the same missing region repeated once per
          framework branch — and the branch that applies to Strands is the one
          you were sent to:
        </p>
        <CodeBlock code={SKIPPED} language="text" />
        <p className="mt-3">
          The section names Strands explicitly, describes what the tool should
          do (&quot;a secondary LLM call with a forced tool choice that produces
          the operations container per-request&quot;), and then prints the
          placeholder instead of the code. The other two markers are{" "}
          <code>backend-schema-json-load</code>, in the branches that do not
          apply.
        </p>
      </Callout>

      <Panel
        title="The runtime side, which is documented"
        description="The half of the page that is complete: turn A2UI on, turn injection off, because your agent owns the tool."
      >
        <CodeBlock
          language="ts"
          filename="app/api/copilotkit/route.ts (as published)"
          code={`const runtime = new CopilotRuntime({
  agents: { "a2ui-fixed-schema": agent },
  a2ui: { injectA2UITool: false, agents: ["a2ui-fixed-schema"] },
});`}
        />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          This repo does not register that block. Wiring middleware for an agent
          that cannot exist would make the runtime look configured when nothing
          can reach it; see{" "}
          <code>frontend/src/app/api/copilotkit/route.ts</code>, which says so
          in a comment.
        </p>
      </Panel>

      <Panel title="The runtime route, as this repo actually has it">
        <SourceCode file="frontend/src/app/api/copilotkit/route.ts" />
      </Panel>

      <Callout tone="warn" title="Python references on a TypeScript page">
        <p>
          The <code>Button</code> renderer&apos;s published comment says the
          click handler &quot;is inert until the Python SDK exposes{" "}
          <code>action_handlers=</code> on <code>a2ui.render</code> (see{" "}
          <code>src/agents/a2ui_fixed.py</code>)&quot;, and the action-handlers
          section closes with &quot;the Python tool matches it with a handler
          keyed by the action name&quot;. Neither sentence has a TypeScript
          equivalent anywhere on the page.
        </p>
      </Callout>
    </>
  );
}
