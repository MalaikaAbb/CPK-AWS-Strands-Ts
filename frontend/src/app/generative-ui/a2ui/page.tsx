import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

/**
 * Reference route: the A2UI overview teaches no feature of its own. Its two
 * setup paths run on /generative-ui/a2ui/dynamic-schema (catalog on the
 * provider) and /generative-ui/a2ui/fixed-schema (runtime `a2ui` block). The
 * snippets below are the rendered page's, verbatim, shown and not compiled:
 * they use `myCatalog`, `myAgent` and `children` without defining them.
 */

const PYTHON_HELPERS = `from copilotkit import a2ui

a2ui.create_surface(surface_id, catalog_id=...)
a2ui.update_components(surface_id, components)
a2ui.update_data_model(surface_id, {"items": data})
a2ui.render(operations=[...])  # wraps in a2ui_operations and serializes`;

const PROVIDER = `import { CopilotKit } from "@copilotkit/react-core/v2";

<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{ catalog: myCatalog }}>
  {children}
</CopilotKit>;`;

const RUNTIME = `import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";

const runtime = new CopilotRuntime({
  agents: { default: myAgent },
  a2ui: { injectA2UITool: true },
  runner: new InMemoryAgentRunner(),
});`;

const COLORS = `.a2ui-surface {
  --a2ui-color-surface: #fafafa; /* card, modal, chip and button backgrounds */
  --a2ui-color-border: #e5e5e5; /* borders, tab rule, divider */
  --a2ui-color-muted: #737373; /* captions and secondary text */
  --a2ui-color-error: #dc2626; /* validation errors */
  --a2ui-primary-color: #2563eb; /* primary buttons, selected chips, active tab */
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui" />

      <Panel title="What the overview covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          An A2UI surface is built from three operations, in order:{" "}
          <code>createSurface</code>, <code>updateComponents</code> (the tree)
          and <code>updateDataModel</code> (the values, addressed by JSON
          Pointer). There are two ways to get them: let an injected{" "}
          <code>generate_a2ui</code> subagent design the whole surface (Dynamic
          Schema), or author the tree up front and have the agent stream only
          data (Fixed Schema). A2UI switches on either with a catalog on the
          provider, which also injects the tool, or with an <code>a2ui</code>{" "}
          block on the runtime. <code>injectA2UITool: false</code> always wins.
          Surface colors come from CSS variables on <code>.a2ui-surface</code>.
        </p>
      </Panel>

      <Panel title="Where each setup path runs in this repo">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            Catalog on the provider (auto-inject):{" "}
            <Link className="underline" href="/generative-ui/a2ui/dynamic-schema">
              /generative-ui/a2ui/dynamic-schema
            </Link>
            , on its own runtime.
          </li>
          <li>
            Runtime <code>a2ui</code> block with <code>injectA2UITool: false</code>{" "}
            and an agent-owned tool:{" "}
            <Link className="underline" href="/generative-ui/a2ui/fixed-schema">
              /generative-ui/a2ui/fixed-schema
            </Link>
            .
          </li>
          <li>
            The overview&apos;s own <code>injectA2UITool: true</code> runtime
            block is not mounted separately; it differs from the dynamic-schema
            route only in where injection is switched on.
          </li>
        </ul>
      </Panel>

      <Panel title="The page's snippets">
        <div className="space-y-4">
          <CodeBlock code={PYTHON_HELPERS} language="python" filename="(Python SDK helpers, as printed)" />
          <CodeBlock code={PROVIDER} language="tsx" filename="app/page.tsx" />
          <CodeBlock code={RUNTIME} language="ts" filename="app/api/copilotkit/[[...slug]]/route.ts" />
          <CodeBlock code={COLORS} language="css" filename="Colors and dark mode" />
        </div>
      </Panel>

      <Callout tone="warn" title="What reading it against this framework turns up">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            The &ldquo;How it works&rdquo; helpers are the CopilotKit{" "}
            <strong>Python</strong> SDK (<code>from copilotkit import a2ui</code>)
            on a Strands TypeScript page. The TypeScript side has no{" "}
            <code>a2ui.render</code>; this repo&apos;s fixed-schema agent uses{" "}
            <code>@ag-ui/a2ui-toolkit</code>.
          </li>
          <li>
            <code>myCatalog</code>, <code>myAgent</code> and{" "}
            <code>children</code> are used and never defined, so the two setup
            snippets are fragments.
          </li>
          <li>
            The opt-out section names <code>getA2UITools()</code> for
            TypeScript but shows no TypeScript call.
          </li>
        </ul>
      </Callout>
    </>
  );
}
