"use client";

import { DemoFrame } from "@/components/demo-frame";

import InterruptHeadlessDemo from "../_demo/interrupt-headless/page";

/**
 * The page's `src/app/demos/interrupt-headless/page.tsx`, mounted unchanged.
 * It brings its own
 * `<CopilotKit runtimeUrl="/api/copilotkit" agent="interrupt-headless">`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop/headless" subtitle="agent: interrupt-headless → /interrupt/">
      <InterruptHeadlessDemo />
    </DemoFrame>
  );
}
