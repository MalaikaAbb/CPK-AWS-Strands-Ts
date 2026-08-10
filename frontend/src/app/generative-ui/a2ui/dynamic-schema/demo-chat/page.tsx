"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { myCatalog } from "../a2ui/catalog";

/**
 * The page's `declarative-gen-ui/page.tsx`, reproduced.
 *
 * The published version wraps `<Chat />` from `./chat`, which is not shown, so
 * a plain `<CopilotChat>` stands in. Everything else is the doc's: the
 * dedicated runtime URL, the agent id, and `a2ui={{ catalog: myCatalog }}` —
 * which is the entire frontend opt-in. Passing a catalog auto-enables A2UI and
 * causes the runtime to inject `generate_a2ui`, which is why the doc says the
 * runtime needs no configuration on this path.
 *
 * Second of the two routes that mounts its own provider, because it needs the
 * separate `/api/copilotkit-declarative-gen-ui` runtime.
 */
export default function DeclarativeGenUIDemo() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/dynamic-schema"
      subtitle="agent: declarative-gen-ui · catalog: declarative-gen-ui-catalog"
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-gen-ui"
        agent="declarative-gen-ui"
        a2ui={{ catalog: myCatalog }}
        enableInspector={nestedInspectorSetting}
      >
        <div className="chat-host mx-auto h-full max-w-4xl">
          <CopilotChat agentId="declarative-gen-ui" />
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
