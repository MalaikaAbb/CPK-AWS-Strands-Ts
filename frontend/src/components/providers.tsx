"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { rootInspectorSetting } from "@/lib/inspector";

/**
 * One provider for the whole app, so a conversation survives navigation
 * between test routes.
 *
 * Some demo routes mount a second, nested `<CopilotKit>` of their own rather
 * than using this one — e.g. Voice (different runtime, because transcription
 * only exists on the v2 runtime), A2UI dynamic-schema (its own catalog and the
 * runtime that injects the A2UI tool), and the Quickstart (its page publishes
 * the provider file itself). Those are the cases where the doc page is
 * specifically about the provider, so an isolated instance is the honest thing
 * to show. `lib/inspector.ts` holds the full list.
 *
 * Note what this provider does NOT set: `agent`. The Quickstart's provider
 * passes `agent="strands_agent"`, which makes it the default for every surface
 * below. With this many registered agents an app-wide default would only hide
 * mistakes, so every route names its agent with `agentId` instead — except the
 * Quickstart demo, which mounts the doc's own provider to show that binding.
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
      // `inspectorDefaultAnchor` used to follow this line, pinning the
      // inspector button bottom-left so it would not cover the prebuilt Popup
      // and Sidebar launchers. 1.69.3 removed the prop with no replacement —
      // the provider exposes no positioning control at all now — so on routes
      // that mount those launchers the button overlaps them again.
      showDevConsole={rootInspectorSetting(pathname)}
      onError={(event) => {
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
