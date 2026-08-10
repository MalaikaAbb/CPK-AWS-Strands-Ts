"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { VoiceChat } from "../voice-chat";

/**
 * The Voice page's `page.tsx`, reproduced as published — including its
 * `enableInspector={false}` and the eight-line comment explaining it.
 *
 * This is one of two routes in the harness that mounts its own
 * `<CopilotKit>`, because voice needs a different runtime: transcription only
 * exists on the v2 runtime handler, which the root provider's
 * `/api/copilotkit` endpoint does not use. `lib/inspector.ts` knows this route
 * brings its own provider and stands the root inspector down.
 */
export default function VoiceDemoPage() {
  return (
    <DemoFrame parentPath="/voice" subtitle="agent: voice-demo · runtime: /api/copilotkit-voice">
      <CopilotKit
        runtimeUrl="/api/copilotkit-voice"
        agent="voice-demo"
        useSingleEndpoint={false}
        // The dev-only `<cpk-web-inspector>` overlay (auto-enabled on
        // localhost via shouldShowDevConsole) intercepts pointer events
        // on top of the voice sample-audio button, so dev/D5 probe runs
        // can't click it through Playwright. Production isn't localhost
        // so the inspector never mounts there — voice is D5 in prod and
        // D4 locally for this reason alone. Disable explicitly here so
        // the demo behaves the same in both environments.
        enableInspector={false}
      >
        <VoiceChat />
      </CopilotKit>
    </DemoFrame>
  );
}
