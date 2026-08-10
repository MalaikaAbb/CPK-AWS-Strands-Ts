import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PUBLISHED_SEND = `  const { agent } = useAgent({ agentId: "headless-simple" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({
      id: generateMessageId(),
      role: "user",
      content: trimmed,
    });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      // ...
      console.error("[langgraph-python:headless-simple] runAgent failed", err);
    });
  };`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/headless-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A chat with no CopilotKit chrome at all. Three hooks do the work:{" "}
          <code>useAgent</code> for the conversation and run state,{" "}
          <code>useCopilotKit</code> for the <code>runAgent</code> entry point,
          and <code>useRenderToolCall</code> to paint any registered tool call
          inline. Everything else on screen — bubbles, avatars, composer,
          scroll behaviour — is ordinary React this repo wrote.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello", "Write me a two-line poem about Express"]}
            expect="Messages appear in hand-rolled bubbles, tokens stream into the assistant bubble, and the list scrolls itself."
            fail="Nothing happens on send. Open the console — the published catch block logs there, which is the one thing that snippet gets right."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx" />
      </Panel>


      <Panel
        title="The bubbles"
        description="This repo's reconstruction. Same exported names, same props, same test ids — but no markdown pipeline, because the page's version needs two packages it never declares."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/bubbles.tsx" />
      </Panel>

      <Callout tone="info" title="The complete example is on another route">
        <p>
          The page&apos;s second half rebuilds the full generative-UI
          composition — reasoning cards, activity messages, before/after custom
          message slots — from <code>headless-complete</code>. Its send pipeline
          is the subject of the{" "}
          <a
            href="/programmatic-control"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Programmatic Control
          </a>{" "}
          route, so it is implemented there rather than twice.
        </p>
      </Callout>
    </>
  );
}
