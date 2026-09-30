import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// "Registering a list of tools", verbatim. Shown rather than run: the hook it
// calls is not exported by @copilotkit/react-core 1.73.0, and `reports` and
// `navigate` are never defined on the page.
const REGISTER_LIST = `useFrontendTools(
  reports.map((report) => ({
    name: \`open_\${report.id}\`,
    description: \`Open the \${report.title} report\`,
    handler: async () => navigate(\`/reports/\${report.id}\`),
  })),
  [navigate],
);`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool whose body runs in the browser. The agent calls{" "}
          <code>change_background</code> like any other tool; the handler
          executes in the tab, closes over React state, and returns a value that
          goes back to the model as the tool result. That is the difference from
          a backend tool — the handler has the user&apos;s DOM, their{" "}
          <code>localStorage</code>, and whatever UI library the page already
          loaded.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make the background a warm sunset gradient",
              "Change the background to something calm and blue",
            ]}
            expect="The background transitions to a new CSS gradient within a second, the value under the heading updates, and the agent confirms in text."
            fail="The agent describes a gradient in words but nothing moves. The tool declaration did not reach the model — check the runtime is registering the frontend-tools agent."
          />
        </div>
      </Panel>

      <Panel
        title="The demo and the component it paints into"
        description="The hook call is the doc's, verbatim. Background is not published."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/frontend-tools/demo-chat/page.tsx" },
            { file: "frontend/src/app/frontend-tools/background.tsx" },
          ]}
        />
      </Panel>

      <Panel
        title="Registering a list of tools"
        description="useFrontendTools: the snippet as published. Not wired into the demo."
      >
        <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>useFrontendTool</code> handles one tool per call, so it cannot
          register a list whose length changes. The page presents{" "}
          <code>useFrontendTools</code> for that case. It takes an array plus a
          dependency list and works out which tools were added or removed
          between renders.
        </p>
        <CodeBlock code={REGISTER_LIST} language="tsx" />
        <div className="mt-4">
          <Callout tone="warn" title="Broken: the hook is not in the published package">
            <p>
              <code>@copilotkit/react-core@1.73.0</code> is both the installed
              version and npm <code>latest</code>, and it does not export{" "}
              <code>useFrontendTools</code>, from <code>/v2</code> or anywhere
              else. The snippet also relies on <code>reports</code> and{" "}
              <code>navigate</code>, and the page defines neither. This
              sub-section stays Broken until the hook ships.
            </p>
          </Callout>
        </div>
      </Panel>
    </>
  );
}
