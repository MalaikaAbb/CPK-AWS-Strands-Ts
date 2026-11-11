"use client";

import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";

import { GenUIDemo } from "../_shared/genui-demo";

/**
 * The overview's step 3: a provider given `generativeUI={{ ui: standardUI }}`
 * and a plain chat. Mounted through the shared Components harness (one
 * `CopilotKitProvider` per variant) on `/api/copilotkit-genui-overview`, talking
 * to the `genui-overview` Strands agent, which stands in for the page's TanStack
 * `BuiltInAgent` with the same prompt.
 */
export default function DemoPage() {
  return (
    <DemoFrame parentPath="/generative-ui/components" subtitle="standardUI · agent: genui-overview">
      <GenUIDemo
        variants={[
          {
            id: "overview",
            label: "standardUI",
            generativeUI: { ui: standardUI },
            runtimeUrl: "/api/copilotkit-genui-overview",
            welcome: "Try: Compare the Starter, Team, and Enterprise plans in a table",
          },
        ]}
      />
    </DemoFrame>
  );
}
