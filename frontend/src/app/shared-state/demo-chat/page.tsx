"use client";

import { DemoFrame } from "@/components/demo-frame";

import SharedStateReadWriteDemo from "../_demo/shared-state-read-write/page";

/**
 * The page's fragments inside minimal glue (see the demo file's header). It
 * brings its own `<CopilotKit>`, so this route is in lib/inspector.ts.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state" subtitle="agent: shared-state-read-write">
      <SharedStateReadWriteDemo />
    </DemoFrame>
  );
}
