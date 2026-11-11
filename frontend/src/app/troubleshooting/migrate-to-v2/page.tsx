import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

/**
 * Reference route: a migration guide is reference material (CLAUDE.md Step 3,
 * Troubleshooting), so this page shows the guide's snippets verbatim and checks
 * this repo against them instead of running anything.
 */

const HOOKS_BEFORE = `import { CopilotKit } from "@copilotkit/react-core";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";`;

const HOOKS_AFTER = `import { CopilotKit, useAgent } from "@copilotkit/react-core/v2";`;

const UI_BEFORE = `import { CopilotPopup } from "@copilotkit/react-ui";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotChat } from "@copilotkit/react-ui";`;

const UI_AFTER = `import { CopilotPopup } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { CopilotChat } from "@copilotkit/react-core/v2";`;

const STYLES_BEFORE = `import "@copilotkit/react-ui/styles.css";`;

const STYLES_AFTER = `import "@copilotkit/react-core/v2/styles.css";`;

const AGUI_INSTALL = `npm install @ag-ui/client@1.0.2`;

const FULL_BEFORE = `import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <YourApp />
      <CopilotPopup />
    </CopilotKit>
  );
}`;

const FULL_AFTER = `import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

export function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <YourApp />
      <CopilotPopup />
    </CopilotKit>
  );
}`;

const HOOK_MAP: [string, string][] = [
  ["useCopilotAction", "useFrontendTool"],
  ["useCopilotReadable", "useAgentContext"],
  ["useCopilotAdditionalInstructions", "useAgentContext"],
  ["useCoAgent", "useAgent"],
  ["useCopilotChat", "useAgent (headless chat: useCopilotChatHeadless_c)"],
  ["AssistantMessage prop", "messageView.assistantMessage slot"],
  ["markdownTagRenderers prop", "assistantMessage.markdownRenderer slot"],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/troubleshooting/migrate-to-v2" />

      <Panel title="What the guide covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Moving a v1 frontend onto the single v2 entry point: hooks, chat
          components and the stylesheet all come from{" "}
          <code>@copilotkit/react-core/v2</code>, and{" "}
          <code>@copilotkit/react-ui</code> drops out. The runtime and the
          agent are untouched. The one dependency step is aligning a direct{" "}
          <code>@ag-ui/client</code> install with the version the runtime
          depends on, so only one <code>HttpAgent</code> class exists.
        </p>
      </Panel>

      <Panel title="v1 → v2 mapping, as the page lists it">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-1 pr-4 font-medium">v1</th>
              <th className="py-1 font-medium">v2</th>
            </tr>
          </thead>
          <tbody>
            {HOOK_MAP.map(([v1, v2]) => (
              <tr key={v1} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-1 pr-4"><code>{v1}</code></td>
                <td className="py-1"><code>{v2}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="The page's snippets">
        <div className="space-y-4">
          <CodeBlock code={HOOKS_BEFORE} language="tsx" filename="Hooks — before" />
          <CodeBlock code={HOOKS_AFTER} language="tsx" filename="Hooks — after" />
          <CodeBlock code={UI_BEFORE} language="tsx" filename="UI components — before" />
          <CodeBlock code={UI_AFTER} language="tsx" filename="UI components — after" />
          <CodeBlock code={STYLES_BEFORE} language="tsx" filename="Styles — before" />
          <CodeBlock code={STYLES_AFTER} language="tsx" filename="Styles — after" />
          <CodeBlock code={AGUI_INSTALL} language="bash" filename="AG-UI client" />
          <CodeBlock code={FULL_BEFORE} language="tsx" filename="Full example — before" />
          <CodeBlock code={FULL_AFTER} language="tsx" filename="Full example — after" />
        </div>
      </Panel>

      <Callout tone="warn" title="This repo against the guide">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Already on v2: every route imports from{" "}
            <code>@copilotkit/react-core/v2</code> and the v2 stylesheet, and{" "}
            <code>@copilotkit/react-ui</code> is not a dependency. The only v1
            strings left are quoted doc snippets (the Quickstart and CSS
            routes).
          </li>
          <li>
            <strong>The <code>@ag-ui/client</code> step is not met.</strong>{" "}
            <code>frontend/package.json</code> asks for <code>^1.0.3</code>,
            while <code>@copilotkit/runtime</code> 1.84.0 depends on exactly{" "}
            <code>1.0.2</code>. A local install checked on 2026-11-11 had 1.0.3
            at the root and 1.0.2 nested under each <code>@copilotkit/*</code>{" "}
            package: the duplicate-copy situation the guide warns about. Run{" "}
            <code>npm ls @ag-ui/client</code> in <code>frontend/</code> to see
            it. Not changed here; a dependency change belongs in its own PR.
          </li>
          <li>
            <strong>The headless-chat replacement is not on the v2 entry
            point.</strong> The mapping table names{" "}
            <code>useCopilotChatHeadless_c</code> as the low-level stand-in for{" "}
            <code>useCopilotChat</code>. In <code>@copilotkit/react-core</code>{" "}
            1.84.0 that hook is exported from the v1 root only; nothing under{" "}
            <code>dist/v2</code> exports it, so following the guide&apos;s
            &quot;import everything from <code>/v2</code>&quot; rule cannot reach
            it.
          </li>
          <li>
            The guide&apos;s <code>YourApp</code> is a placeholder the page never
            defines, which is fine for a migration diff but means the full
            example does not compile on its own.
          </li>
        </ul>
      </Callout>
    </>
  );
}
