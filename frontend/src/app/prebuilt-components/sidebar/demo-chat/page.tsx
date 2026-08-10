"use client";

import {
  CopilotSidebar,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's layout, minus the provider:
 *
 *     <CopilotKit runtimeUrl="/api/copilotkit" agent="prebuilt-sidebar">
 *       <MainContent />
 *       <CopilotSidebar agentId="prebuilt-sidebar" defaultOpen={true} />
 *       <Suggestions />
 *     </CopilotKit>
 *
 * `MainContent` and `Suggestions` are named and never published, so the main
 * content here is this repo's and the suggestions go through the exported
 * `useConfigureSuggestions` rather than an unpublished component.
 */
function MainContent() {
  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Your app content
      </h1>
      <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        The sidebar docks beside this column rather than covering it. Collapse
        it with the toggle and the content stays exactly where it was — that is
        the whole difference between this and the Popup.
      </p>
    </main>
  );
}

function Suggestions() {
  useConfigureSuggestions({
    suggestions: [
      { title: "What is this page?", message: "What is this page showing me?" },
      { title: "Sidebar vs popup", message: "When should I use a sidebar instead of a popup?" },
    ],
    available: "always",
  });
  return null;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/sidebar"
      subtitle="agent: prebuilt-sidebar"
    >
      <MainContent />
      <CopilotSidebar agentId="prebuilt-sidebar" defaultOpen={true} />
      <Suggestions />
    </DemoFrame>
  );
}
