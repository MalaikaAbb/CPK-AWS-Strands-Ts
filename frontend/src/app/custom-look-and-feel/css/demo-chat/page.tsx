"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

// The page's own scoping step, verbatim: import the sibling stylesheet from the
// page module and Next bundles it with the route.
import "../theme.css";

/**
 * The CSS route's live surface.
 *
 * Everything visual here comes from `theme.css`, which contains only the two
 * blocks the doc page publishes plus the v2 token block from its reference
 * section. The `.chat-css-demo-scope` wrapper is the page's own scoping
 * technique — every selector in the stylesheet is nested under it so the
 * overrides cannot leak into the rest of the harness.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/css"
      subtitle="agent: chat-customization-css"
    >
      <div className="chat-css-demo-scope chat-host h-full bg-[var(--halcyon-paper)]">
        <CopilotChat agentId="chat-customization-css" />
      </div>
    </DemoFrame>
  );
}
