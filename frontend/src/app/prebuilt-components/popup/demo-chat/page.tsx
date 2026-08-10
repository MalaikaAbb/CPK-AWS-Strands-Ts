"use client";

import {
  CopilotPopup,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's layout, minus the provider. The `labels` object is the page's own:
 *
 *     <CopilotPopup
 *       agentId="prebuilt-popup"
 *       defaultOpen={true}
 *       labels={{ chatInputPlaceholder: "Ask the popup anything..." }}
 *     />
 *
 * As on the Sidebar page, `MainContent` and `Suggestions` are named but never
 * published.
 */
function MainContent() {
  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Your app content
      </h1>
      <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        The popup floats over this content instead of reflowing it. Close it and
        the launcher bubble stays in the corner.
      </p>
    </main>
  );
}

function Suggestions() {
  useConfigureSuggestions({
    suggestions: [
      { title: "What is this?", message: "What is this popup for?" },
      { title: "Say hello", message: "Say hello in one sentence." },
    ],
    available: "always",
  });
  return null;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/popup"
      subtitle="agent: prebuilt-popup"
    >
      <MainContent />
      <CopilotPopup
        agentId="prebuilt-popup"
        defaultOpen={true}
        labels={{
          chatInputPlaceholder: "Ask the popup anything...",
        }}
      />
      <Suggestions />
    </DemoFrame>
  );
}
