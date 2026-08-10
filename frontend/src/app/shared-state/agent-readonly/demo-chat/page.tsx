"use client";

import React, { useState } from "react";
import { CopilotPopup, useAgentContext } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ACTIVITIES, DemoLayout } from "../demo-layout";

/**
 * The page's `readonly-state-agent-context/page.tsx`, reproduced.
 *
 * The three `useAgentContext` calls and the three `useState` initialisers are
 * the doc's, verbatim — including `useState("Atai")` and the
 * `[ACTIVITIES[0], ACTIVITIES[2]]` slice. The published block ends immediately
 * after those initialisers with no return statement, so the markup is supplied
 * by `../demo-layout.tsx`.
 *
 * The doc's own `<CopilotKit>` wrapper is dropped — this harness has one root
 * provider — but its `<CopilotPopup>` props are kept exactly.
 */

function DemoContent() {
  const [userName, setUserName] = useState("Atai");
  const [userTimezone, setUserTimezone] = useState("America/Los_Angeles");
  const [recentActivity, setRecentActivity] = useState<string[]>([
    ACTIVITIES[0],
    ACTIVITIES[2],
  ]);

  useAgentContext({
    description: "The currently logged-in user's display name",
    value: userName,
  });
  useAgentContext({
    description: "The user's IANA timezone (used when mentioning times)",
    value: userTimezone,
  });
  useAgentContext({
    description: "The user's recent activity in the app, newest first",
    value: recentActivity,
  });

  return (
    <DemoLayout
      userName={userName}
      setUserName={setUserName}
      userTimezone={userTimezone}
      setUserTimezone={setUserTimezone}
      recentActivity={recentActivity}
      setRecentActivity={setRecentActivity}
    />
  );
}

export default function ReadonlyStateAgentContextDemo() {
  return (
    <DemoFrame
      parentPath="/shared-state/agent-readonly"
      subtitle="agent: readonly-state-agent-context"
    >
      <DemoContent />
      <CopilotPopup
        agentId="readonly-state-agent-context"
        defaultOpen={true}
        labels={{ chatInputPlaceholder: "Ask about your context..." }}
      />
    </DemoFrame>
  );
}
