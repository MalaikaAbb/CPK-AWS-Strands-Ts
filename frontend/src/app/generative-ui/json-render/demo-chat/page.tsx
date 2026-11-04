"use client";

import { DemoFrame } from "@/components/demo-frame";

import ByocJsonRenderFixedDemo from "../json-render-fixed";

/**
 * The working version of the page (../json-render-fixed.tsx), with its own
 * `<CopilotKit>` against /api/copilotkit-byoc-json-render.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/json-render" subtitle="agent: byoc_json_render">
      <ByocJsonRenderFixedDemo />
    </DemoFrame>
  );
}
