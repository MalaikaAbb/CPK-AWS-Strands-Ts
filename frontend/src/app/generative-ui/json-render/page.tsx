import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/json-render";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/json-render" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page replaces the assistant message slot with a renderer that
          reads the reply as a <code>{"{ root, elements }"}</code> spec,
          checks each element against a Zod catalog, and draws it with{" "}
          <code>@json-render/react</code>. The page&apos;s{" "}
          <code>&lt;Renderer spec catalog&gt;</code> call doesn&apos;t match
          0.21 and throws on the first valid spec, so the demo runs a fixed
          version. The changes are listed below.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show me a sales dashboard.", "Break down sales by region."]}
            expect="Two suggestion pills above the input. The reply renders as metric cards and a bar or pie chart that fill in as the JSON streams, with no error."
            fail="Raw JSON or nothing. Check in the Inspector that the reply is a { root, elements } object. If a card is missing, its props failed the catalog's Zod schema and were dropped."
          />
        </div>
      </Panel>

      <Panel title="What was fixed">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The demo reuses the page&apos;s catalog, components, Zod schemas and
          helpers, and makes four changes:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            It passes <code>registry</code> instead of <code>catalog</code>,
            built from the page&apos;s catalog as a map from type name to{" "}
            <code>({"{ element }"}) =&gt; &lt;Component {"{...element.props}"} /&gt;</code>
            , plus a <code>Stack</code> container.
          </li>
          <li>
            It wraps <code>&lt;Renderer&gt;</code> in{" "}
            <code>&lt;JSONUIProvider registry&gt;</code>.
          </li>
          <li>
            It plugs in through{" "}
            <code>assistantMessage.markdownRenderer</code>, which gets the raw{" "}
            <code>content</code> and type-checks, instead of replacing the
            whole <code>assistantMessage</code>.
          </li>
          <li>
            It calls <code>useConfigureSuggestions</code> inside{" "}
            <code>&lt;CopilotKit&gt;</code>, so the suggestions show up.
          </li>
        </ol>
        <div className="mt-4">
          <SourceCodeGroup files={[{ file: `${DIR}/json-render-fixed.tsx` }]} />
        </div>
      </Panel>

      <Panel title="Written in — what the page leaves out">
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <code>stripCodeFencesAndPrelude</code>,{" "}
            <code>tolerantJsonParse</code>, <code>validateAgainstCatalog</code>
          </li>
          <li>
            <code>MetricCard</code>, <code>BarChart</code>,{" "}
            <code>PieChart</code>, plus files at the paths the catalog imports
            from
          </li>
          <li>
            The <code>AssistantMessage</code> import and the runtime route
          </li>
          <li>
            The agent&apos;s system prompt. The agent itself is the published{" "}
            <code>buildByocJsonRenderAgent</code> from <code>agent.ts</code>,
            but that file imports its prompt from an unpublished{" "}
            <code>./prompts</code>
          </li>
        </ul>
        <SourceCodeGroup
          files={[
            { file: `${DIR}/spec-helpers.ts` },
            { file: `${DIR}/registry.tsx` },
            { file: "frontend/src/components/byoc-dashboard.tsx" },
            { file: "frontend/src/app/api/copilotkit-byoc-json-render/[[...slug]]/route.ts" },
            { file: "backend/src/agents/byoc-json-render-agent.ts" },
          ]}
        />
      </Panel>

      <Panel title="Other things to know">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s example output uses a <code>Stack</code>, which
            isn&apos;t in its catalog. The validator keeps unknown types only
            when they have <code>children</code>.
          </li>
          <li>
            The page calls <code>useConfigureSuggestions</code> outside the{" "}
            <code>&lt;CopilotKit&gt;</code> it renders. The suggestions
            therefore register on the app&apos;s root provider, so they
            won&apos;t appear in this chat.
          </li>
        </ul>
      </Panel>
    </>
  );
}
