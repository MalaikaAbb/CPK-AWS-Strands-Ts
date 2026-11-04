import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/open-generative-ui/_demo";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/open-generative-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          With <code>openGenerativeUI</code> on the runtime, the agent gets a{" "}
          <code>generateSandboxedUi</code> frontend tool. The middleware turns
          its streamed arguments (CSS, then HTML, then JS) into activity events,
          and the built-in renderer builds the UI live in a sandboxed iframe.
          The advanced demo also passes sandbox functions that the generated
          page can call back into the host.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "(Minimal) Build me a simple greeting card.",
              "(Advanced) Build a calculator whose = button calls evaluateExpression.",
            ]}
            expect="Minimal: a preview appears in the chat and fills in as the HTML streams. Advanced: a working calculator; pressing = logs `[open-gen-ui/advanced] evaluateExpression` in the browser console and shows the result."
            fail={
              <>
                A plain-text reply means the model never saw{" "}
                <code>generateSandboxedUi</code>. The Strands adapter forwards
                frontend tools per run, so check the Inspector for the tool on
                the run. On the minimal demo the design skill is the
                provider&apos;s default (the page&apos;s own is unpublished), and
                that default never tells the model to call the tool, so a text
                reply is possible there.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="The runtime — as published">
        <SourceCodeGroup files={[{ file: "frontend/src/app/api/copilotkit-ogui/route.ts" }]} />
      </Panel>

      <Panel title="Minimal demo">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/open-gen-ui/page.tsx` },
            { file: `${DIR}/open-gen-ui/chat.tsx` },
          ]}
        />
      </Panel>

      <Panel title="Advanced demo — sandbox functions">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/open-gen-ui-advanced/page.tsx` },
            { file: `${DIR}/open-gen-ui-advanced/sandbox-functions.ts` },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Written in or commented out">
        <ul className="space-y-1.5">
          <li>
            · <code>./chat</code> (minimal demo) is unpublished;{" "}
            <code>chat.tsx</code> is a plain{" "}
            <code>&lt;CopilotChat agentId=&quot;open-gen-ui&quot;&gt;</code>.
          </li>
          <li>
            · <code>./design-skill</code> (<code>VISUALIZATION_DESIGN_SKILL</code>)
            is unpublished. Its import and the{" "}
            <code>openGenerativeUI={"{{ designSkill }}"}</code> prop are commented
            out, so the minimal demo runs on the default design skill.
          </li>
          <li>
            · <code>./suggestions</code> (<code>openGenUiSuggestions</code>) is
            unpublished. Its import and the <code>useConfigureSuggestions</code>{" "}
            call are commented out, so the advanced demo shows no suggestion
            pills.
          </li>
          <li>
            · Both agent names point at <code>{"${AGENT_URL}/"}</code>, the
            unpublished showcase agent. A Quickstart-shaped stand-in is mounted
            at <code>/</code> instead.
          </li>
        </ul>
      </Callout>
    </>
  );
}
