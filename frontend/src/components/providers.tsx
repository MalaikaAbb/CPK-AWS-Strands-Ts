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
 *
 * Threads and the Inspector are served by CopilotKit Intelligence, which is
 * configured on the runtime rather than here — see `lib/intelligence.ts`. With
 * no `INTELLIGENCE_API_KEY` the runtime drops those options and falls back to
 * SSE with an in-memory runner, exactly as the Quickstart's callout describes:
 * chat still works, Threads and the Inspector stay locked.
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
      // The Quickstart's provider now passes this, and it is the client half
      // of the runtime becoming a catch-all: with it false the client calls the
      // runtime's own sub-paths (/info, /agent/:id/run) under `basePath`
      // instead of posting everything to one URL. The Voice route has always
      // needed it for the same reason.
      useSingleEndpoint={false}
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
