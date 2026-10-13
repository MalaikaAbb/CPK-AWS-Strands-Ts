"use client";

import { DemoFrame } from "@/components/demo-frame";

import AgentConfigDemoPage from "../_demo-code/page";

/**
 * The page's `strands-typescript::agent-config` demo Code tab, copied
 * unchanged into `../_demo-code/`. It brings its own
 * `<CopilotKit runtimeUrl="/api/copilotkit-agent-config" agent="agent-config-demo">`,
 * so this route is listed in `NESTED_PROVIDER_ROUTES` and the root provider
 * hands the inspector to it.
 *
 * The one piece of harness glue is the wrapper class: the demo's
 * `DemoLayout` is `h-screen`, which inside `DemoFrame`'s header-less remainder
 * would push the chat input below the clipped edge. The arbitrary variant
 * resizes it to the frame without editing the published file.
 *
 * The demo also styles with `var(--border)`, `var(--bg-surface)`,
 * `var(--text-muted)` and `var(--bg-muted)` — tokens from the showcase app's
 * stylesheet, which is not part of the bundle. They are left undefined here,
 * so the card renders with default borders and no fill.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/agent-config" subtitle="agent: agent-config-demo">
      <div className="h-full [&_.h-screen]:h-full">
        <AgentConfigDemoPage />
      </div>
    </DemoFrame>
  );
}
