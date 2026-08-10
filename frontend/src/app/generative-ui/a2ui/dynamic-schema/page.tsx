import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PUBLISHED_RENDERERS = `export const myRenderers: CatalogRenderers<MyDefinitions> = {
  Row: ({ props, children }) => {
    const justifyMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      spaceBetween: "space-between",
    };
    const items = Array.isArray(props.children) ? props.children : [];
    return (
      <div
        style={{ /* … */ }}
      >
        {items.map((id, i) => (
          <div key={\`\${id}-\${i}\`} style={{ flex: "1 1 0", minWidth: 0 }}>
            {children(id)}
          </div>
        ))}
      </div>
    );
  },
  // ← the published block ends here, mid-file. Ten renderers follow in the
  //   real file and none of them is shown.`;

const OPT_OUT = `from ag_ui_langgraph import get_a2ui_tools
from langchain_openai import ChatOpenAI

generate_a2ui = get_a2ui_tools({
    "model": ChatOpenAI(model="gpt-4o"),
    "default_catalog_id": "copilotkit://app-dashboard-catalog",
})

tools = [my_other_tool, generate_a2ui]`;

/** Every symbol `renderers.tsx` uses that the published block never imports. */
const MISSING_SYMBOLS: [string, string, string][] = [
  [
    "React",
    "Used as <React.Fragment> to key Column's children.",
    "react — import line only.",
  ],
  [
    "CatalogRenderers",
    "The type the whole map is annotated with.",
    "@copilotkit/a2ui-renderer — import line only.",
  ],
  [
    "MyDefinitions",
    "Type argument to CatalogRenderers. definitions.ts exports the value myDefinitions, never this type.",
    "Added to definitions.ts as `export type MyDefinitions = typeof myDefinitions`.",
  ],
  [
    "TriangleAlert, CircleAlert, CircleCheck, Info",
    "The four icons StatusBadge picks between by variant.",
    "lucide-react — import line only.",
  ],
  [
    "Bar, CartesianGrid, Cell, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, PieChart",
    "The chart primitives, aliased to avoid colliding with the catalog's own BarChart and PieChart names.",
    "recharts — import line only.",
  ],
  [
    "CardShell",
    "The titled container Card, PieChart and BarChart all render into. Takes title, subtitle, testid and (from Card only) cardId.",
    "primitives.tsx — this repo's.",
  ],
  [
    "Badge",
    "The pill StatusBadge renders into. Takes variant, style and a data-testid.",
    "primitives.tsx — this repo's.",
  ],
  [
    "Button",
    "The control PrimaryButton renders into. Takes onClick; the renderer owns the handler because dispatch is in scope there.",
    "primitives.tsx — this repo's.",
  ],
  [
    "c",
    "Colour tokens. Only three are used: c.cardFg, c.muted, c.divider — the last two handed to Recharts as SVG paint.",
    "primitives.tsx — this repo's, mapped onto CopilotKit's v2 shadcn tokens with literal fallbacks.",
  ],
  [
    "CHART_COLORS",
    "Categorical palette PieChart wraps with i % CHART_COLORS.length.",
    "primitives.tsx — this repo's.",
  ],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/dynamic-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Bring-your-own-catalog A2UI. You declare a set of components as Zod
          schemas plus descriptions, supply a React renderer for each, and hand
          the pair to the provider as a catalog. The runtime serialises the
          catalog into the agent&apos;s context, a secondary LLM designs a
          layout out of those components per request, and the middleware paints
          it progressively as the schema and data stream in. The agent writes no
          markup — it picks components.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me the sales dashboard",
              "Which accounts are at risk?",
              "How is the team tracking against quota?",
            ]}
            expect="A composed surface appears above or in place of the text reply — KPI tiles in a row, then a pie and a bar chart for the dashboard; status badges for the risk question; a table for the team question. The chat reply itself is one sentence."
            fail="A markdown answer with no surface, or a surface with empty boxes. Empty boxes mean the planner emitted a component name the catalog does not have — check that definitions.ts and the backend's composition rules still list the same eleven names."
          />
        </div>
      </Panel>

       <Callout tone="warn" title="renderers.tsx has no imports - currently using the ones in ADK demo to make it work">
        <p className="mb-3">This is the published block, in full:</p>
        <CodeBlock
          code={PUBLISHED_RENDERERS}
          language="tsx"
          filename="src/app/demos/declarative-gen-ui/a2ui/renderers.tsx (as published)"
        />
        <p className="mt-3">
          Three problems in one snippet. There is no import line, so{" "}
          <code>CatalogRenderers</code>, <code>MyDefinitions</code> and React are
          used and none is imported. <code>MyDefinitions</code> is not exported
          by the <code>definitions.ts</code> block either — that file exports{" "}
          <code>myDefinitions</code>, the value. And the block ends inside{" "}
          <code>Row</code>, so ten of the eleven renderers the catalog requires
          are never published at all. This repo reproduces{" "}
          <code>Row</code> exactly and writes the other ten from the{" "}
          <code>description</code> strings in <code>definitions.ts</code>, which
          is also what the planner reads.
        </p>
      </Callout>

       <Panel
        title="Everything renderers.tsx needs that the docs never name"
        description="The published block has no import line at all, so every symbol below had to be traced back to the call site that fixes its signature."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Symbol", "What it is", "Where it comes from now"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MISSING_SYMBOLS.map(([symbol, what, where]) => (
                <tr key={symbol} className="align-top">
                  <td className="border-b border-slate-100 px-2 py-2 font-mono text-xs text-slate-900 dark:border-slate-800 dark:text-slate-100">
                    {symbol}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    {what}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    {where}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          The split is deliberate. <code>React</code> and the four lucide icons
          are real, installable packages — the doc block is missing nothing but
          an <code>import</code> line for them. The five in{" "}
          <code>primitives.tsx</code> exist in no package and are described on
          no page; every prop signature there is reverse-engineered from how{" "}
          <code>renderers.tsx</code> calls it, and nothing was given behaviour
          the renderers do not ask for.
        </p>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three-file split"
        description="definitions.ts and catalog.ts are the doc's, verbatim. renderers.tsx is mostly not — see below."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/renderers.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/catalog.ts" },
          ]}
        />
      </Panel>

     

      <Panel
        title="primitives.tsx"
        description="This repo's. Read the docstring first — it records which call site pins each signature."
      >
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/primitives.tsx" />
      </Panel>

      <Panel
        title="The backend"
        description="The one factory in the published agent.ts whose dependencies are all inline, so it is the only one this repo can run."
      >
        <SourceCode file="backend/src/agents/a2ui-dynamic-agent.ts" />
      </Panel>

     

      <Callout tone="warn" title="The opt-out path is LangGraph Python">
        <p className="mb-3">
          The &quot;I opted out of auto-inject, now what?&quot; section&apos;s
          second step is this, under a{" "}
          <code>python title=&quot;agent.py&quot;</code> label, on a page in the
          TypeScript tree:
        </p>
        <CodeBlock code={OPT_OUT} language="python" />
        <p className="mt-3">
          <code>@ag-ui/aws-strands</code> exports its own{" "}
          <code>getA2UITools</code>; no page shows it. The streaming section
          further down has the same problem in prose — it says the secondary
          tool call &quot;streams through LangGraph as{" "}
          <code>TOOL_CALL_ARGS</code> events&quot;, and repeats the claim in the
          how-it-works list at the top.
        </p>
      </Callout>

      <Callout tone="info" title="Two ways in, both wired here">
        <p>
          The page teaches the provider path: pass a catalog and the runtime
          needs no <code>a2ui</code> block. The published{" "}
          <code>agent.ts</code> describes the other one in a comment — it says
          this route&apos;s API handler sets{" "}
          <code>
            a2ui: {"{ injectA2UITool: true, defaultCatalogId: \"declarative-gen-ui-catalog\" }"}
          </code>
          . Both are in place:{" "}
          <code>api/copilotkit-declarative-gen-ui/route.ts</code> carries that
          block and the provider carries the catalog.
        </p>
      </Callout>
    </>
  );
}
