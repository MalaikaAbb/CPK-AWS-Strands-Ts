import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/voice" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The mic button is not a prop. It appears because the runtime this
          surface talks to advertises{" "}
          <code>audioFileTranscriptionEnabled: true</code> on its{" "}
          <code>/info</code> endpoint, which happens when a{" "}
          <code>TranscriptionService</code> is set on the runtime. That forces
          two things the other routes do not need: a second API route using the
          v2 handler (the v1 wrapper drops the option), and a second{" "}
          <code>&lt;CopilotKit&gt;</code> pointed at it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Click the mic, say: what can you help me with?"]}
            expect="Recording stops, the transcript lands in the composer, and it auto-sends. The reply streams back."
            fail="No mic button at all — the runtime is not advertising transcription. Check that /api/copilotkit-voice is the v2 handler and that transcriptionService is set."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/voice/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The runtime route"
        description="Published in full by the doc page, @ts-ignore and all. Reproduced with one URL change — see below."
      >
        <SourceCode file="frontend/src/app/api/copilotkit-voice/[[...slug]]/route.ts" />
      </Panel>

      <Panel
        title="The two frontend files"
        description="One published, one not."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/voice/sample-audio-button.tsx" },
            { file: "frontend/src/app/voice/voice-chat.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="What the page leaves out, and what it gets wrong">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>
              <code>VoiceChat</code> is imported and never shown.
            </strong>{" "}
            The page describes what it does in a sentence — write the transcript
            into the textarea matched by{" "}
            <code>data-testid=&quot;copilot-chat-textarea&quot;</code> using the
            native value setter and a synthetic <code>input</code> event — and
            leaves you to write it. <code>voice-chat.tsx</code> here is that
            sentence, implemented.
          </li>
          <li>
            <strong>
              <code>SampleAudioButtonProps</code> is annotated and never
              declared.
            </strong>{" "}
            Added here, with the only shape the destructuring allows.
          </li>
          <li>
            <strong>The agent id and the agent URL disagree.</strong> The route
            registers the agent as <code>voice-demo</code> and points its{" "}
            <code>HttpAgent</code> at{" "}
            <code>{"`${AGENT_URL}/voice/`"}</code>. This harness mounts every
            agent at its own id, so the URL here is{" "}
            <code>/voice-demo/</code>.
          </li>
          <li>
            <strong>The page carries another framework&apos;s note.</strong> A{" "}
            <code>&lt;WhenFrameworkHas flag=&quot;voice_backend_pattern&quot;&gt;</code>{" "}
            block explains Google ADK&apos;s{" "}
            <code>add_adk_fastapi_endpoint</code> hop. Nothing equivalent is
            written for Strands.
          </li>
          <li>
            <strong>The published comments describe a test harness.</strong>{" "}
            &quot;so aimock returns a direct text response&quot;, &quot;dev/D5
            probe runs&quot;, &quot;voice is D5 in prod and D4 locally&quot;.
            None of that vocabulary is defined anywhere public. Kept verbatim.
          </li>
        </ul>
      </Callout>

      <Callout tone="info" title="Without an OpenAI key">
        <p>
          The <code>GuardedOpenAITranscriptionService</code> the page publishes
          is built for exactly this: with no <code>OPENAI_API_KEY</code> it
          throws a readable error instead of a 500 from the OpenAI SDK. The mic
          still renders, because <code>/info</code> only knows a service is
          configured, not whether it can authenticate. The sample-audio button
          works either way.
        </p>
      </Callout>
    </>
  );
}
