import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const WHOLE_PAGE = `# Interactive

> Create components that your agent can use to interact with the user.
<Interactive components={props.components} framework="aws-strands" />`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/your-components/interactive" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The interactive counterpart to{" "}
          <a
            href="/generative-ui/your-components/display-only"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Display-only
          </a>
          . <code>useComponent</code> registers a component the agent renders
          and walks past; <code>useHumanInTheLoop</code> registers one that
          <em> stops the run</em> until the user answers. Here that is an
          approve/deny gate around a command the agent wants to run — the model
          proposes, the human decides, and <code>respond</code> hands the
          decision back as the tool result so the agent can narrate what
          happened.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Run `rm -rf /tmp/cache` for me",
              "Deploy the app to staging",
            ]}
            expect="The reply stops and an approve/deny gate appears with the proposed command in a <pre>. Either button resumes the run, and the agent's next message reflects which one you pressed."
            fail="The agent claims it ran the command with no gate — the tool was not offered to the model. Or the gate appears and neither button does anything, which means respond never fired."
          />
        </div>
      </Panel>

      <Panel
        title="The demo"
        description="The hook call is the supplied snippet, character for character. Nothing on the doc page contributed to it."
      >
        <SourceCode file="frontend/src/app/generative-ui/your-components/interactive/demo-chat/page.tsx" />
      </Panel>

     
    </>
  );
}
