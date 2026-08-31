import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const TREE = `Card
 └─ Column
     ├─ Title        ("Flight Details")
     ├─ Row          (Airport → Arrow → Airport)
     ├─ Row          (AirlineBadge · PriceTag)
     └─ Button       (Book)`;

const SKIPPED = `### Generate the schema dynamically

Mastra and Strands take a different route: the agent tool runs a
*secondary* LLM call with a forced tool choice that produces the
operations container per-request. …

Neither SDK ships an \`a2ui.render(...)\` equivalent here, so the tool
assembles the \`a2ui_operations\` envelope itself — the operation builder
below is part of what you copy. Note the operations are *nested*
(\`{ createSurface: {...} }\`): a consumer dispatches on the operation
key, so a flat \`{ type: "create_surface" }\` shape is ignored and the
surface never paints.

<!-- snippet skipped: region 'backend-render-operations' missing in strands-typescript::a2ui-fixed-schema -->`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Panel title="What it demonstrates">
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

      <Panel title="Try it">
        <TryIt
          prompts={[
            "Find me a flight from SFO to JFK",
            "What about Boston to Seattle on Alaska?",
          ]}
          expect="A flight card paints in the chat — 'Flight Details' with an Itinerary label, the two airport codes either side of an arrow, an airline pill and a total, and a Book flight button. The agent's own reply is one short sentence and does not repeat the numbers."
          fail="A plain text answer with no card. Check that the catalog id agrees in all three places, and that the runtime scopes `injectA2UITool: false` to this agent — if it injects `generate_a2ui` instead, the agent has two ways to draw and will use the wrong one."
        />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="warn" title="The schema this runs on is not from these docs">
        <p className="mb-3">
          The agent below is <code>buildA2uiFixedSchemaAgent</code> from the
          published <code>agent.ts</code>, verbatim. It reads its component tree
          from <code>./a2ui_schemas/flight_schema.json</code> — and no Strands
          page publishes that file. The page draws the tree as an ASCII diagram
          and gives it as data nowhere.
        </p>
        <p className="mb-3">
          That file here is carried over from the Google ADK harness, whose
          backend ships the identical schema for the identical demo: the same
          twelve nodes, the same{" "}
          <code>Card &gt; Column &gt; [Title, Row, Row, Button]</code> shape the
          diagram describes, and the same four data paths —{" "}
          <code>/origin</code>, <code>/destination</code>,{" "}
          <code>/airline</code>, <code>/price</code> — that{" "}
          <code>display_flight</code> supplies. It is the same artefact from a
          sibling repo, not a reconstruction.
        </p>
        <p>
          So the route runs, and the finding is unchanged: the Strands
          TypeScript tree still publishes no schema, and a reader following it
          alone still cannot build this. That is why the status is Partial
          rather than Working.
        </p>
      </Callout>

      <Callout tone="warn" title="The one backend step the Strands path needs is still missing">
        <p className="mb-3">
          Re-fetched 2026-08-31: the page has been restructured since this
          repo&apos;s first sync. The framework-branched schema-loading and
          schema-inline steps are gone, replaced by a single{" "}
          <strong>Generate the schema dynamically</strong> step — the
          Mastra/Strands path — and the five <code>snippet skipped</code>{" "}
          markers are down to one. That one is the step that matters:
        </p>
        <CodeBlock code={SKIPPED} language="text" />
        <p className="mt-3">
          The surrounding prose now says more than it used to, and all of it is
          worth having: that neither SDK ships an{" "}
          <code>a2ui.render(...)</code> equivalent, that the tool assembles the{" "}
          <code>a2ui_operations</code> envelope itself, and that the operations
          are <em>nested</em> — a flat{" "}
          <code>{"{ type: \"create_surface\" }"}</code> is ignored and the
          surface silently never paints. This route uses the toolkit&apos;s{" "}
          <code>createSurface</code> / <code>updateComponents</code> /{" "}
          <code>updateDataModel</code> helpers, which emit the nested form —
          verified as{" "}
          <code>{"{\"version\":\"v0.9\",\"createSurface\":{…}}"}</code>.
          Every word of that describes code the page still does not print.
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
          This repo now registers exactly that, scoped with{" "}
          <code>agents: [&quot;a2ui-fixed-schema&quot;]</code> so the other 23
          agents on the runtime are untouched.{" "}
          <code>injectA2UITool: false</code> is the load-bearing half: the agent
          owns its own <code>display_flight</code> and must not also be handed a{" "}
          <code>generate_a2ui</code>, or it has two ways to draw the same
          surface.
        </p>
      </Panel>

      <Panel
        title="The three files that have to agree"
        description="The catalog id appears in all of them. A mismatch renders nothing, with no error."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/a2ui-fixed-agent.ts" },
            { file: "backend/src/agents/a2ui_schemas/flight_schema.json" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts" },
          ]}
        />
      </Panel>

      <Panel
        title="The catalog"
        description="definitions.ts and catalog.ts are the doc's. renderers.tsx is published with no imports, and its four primitives come from a file the page never shows."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/renderers.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/_components/primitives.tsx" },
          ]}
        />
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
