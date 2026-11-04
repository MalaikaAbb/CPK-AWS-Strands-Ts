"use client";

import { DemoFrame } from "@/components/demo-frame";

import GenUiInterruptDemo from "../_demo/gen-ui-interrupt/page";

/**
 * The page's `src/app/demos/gen-ui-interrupt/page.tsx`, mounted as published
 * apart from the commented-out suggestions hook. It brings its own
 * `<CopilotKit runtimeUrl="/api/copilotkit" agent="gen-ui-interrupt">`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop/useInterrupt" subtitle="agent: gen-ui-interrupt → /interrupt/">
      <GenUiInterruptDemo />
    </DemoFrame>
  );
}
