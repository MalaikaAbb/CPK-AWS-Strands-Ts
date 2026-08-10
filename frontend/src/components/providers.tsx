"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { rootInspectorSetting } from "@/lib/inspector";

/**
 * One provider for the whole app, so a conversation survives navigation
 * between test routes.
 *
 * Two routes mount a second, nested `<CopilotKit>` of their own rather than
 * using this one — Voice (different runtime, because transcription only exists
 * on the v2 runtime) and A2UI dynamic-schema (it needs its own catalog and the
 * runtime that injects the A2UI tool). Those are the cases where the doc page
 * is specifically about the provider, so an isolated instance is the honest
 * thing to show.
 *
 * Note what this provider does NOT set: `agent`. The Quickstart passes
 * `agent="strands_agent"` here, which makes it the default for every surface
 * below. With 24 registered agents that default would only hide mistakes, so
 * every route names its agent with `agentId` instead.
 */

const RUNTIME_URL = "/api/copilotkit";

export function Providers({ children }: { children: ReactNode }) {
  // The inspector can only watch the core it is attached to, and two of them
  // on one page is fatal — so on routes that bring their own provider, this
  // one yields. `lib/inspector.ts` owns that decision.
  const pathname = usePathname();

  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      showDevConsole={rootInspectorSetting(pathname)}
      // Bottom-left, because the prebuilt Popup and Sidebar launchers both
      // live bottom-right and would sit under the inspector button.
      inspectorDefaultAnchor={{ horizontal: "left", vertical: "bottom" }}
      onError={(event) => {
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
