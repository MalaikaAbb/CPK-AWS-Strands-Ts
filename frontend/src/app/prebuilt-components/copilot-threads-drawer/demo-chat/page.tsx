"use client";

import {
  CopilotChat,
  CopilotKit,
  CopilotChatConfigurationProvider,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

/**
 * The drawer beside the chat, in the structure the page publishes.
 *
 * The published `app/page.tsx` is:
 *
 *     <CopilotKitProvider runtimeUrl="/api/copilotkit" publicLicenseKey="ck_pub_...">
 *       <CopilotChatConfigurationProvider>
 *         <div style={{ display: "flex", height: "100dvh" }}>
 *           <CopilotThreadsDrawer />
 *           <CopilotChat />
 *         </div>
 *       </CopilotChatConfigurationProvider>
 *     </CopilotKitProvider>
 *
 * Two departures, both this harness's usual ones:
 *
 *  - No nested `<CopilotKitProvider>`. The app has one at the root; adding a
 *    second here would fork the core and blind the inspector.
 *  - `agentId` is named explicitly on both children rather than inherited from
 *    a provider-level `agent`, because 25 agents share one provider.
 *
 * The `<CopilotChatConfigurationProvider>` wrapper is NOT a departure — it is
 * the load-bearing part. It is the shared state that lets selecting a row in
 * the drawer connect the chat to that thread and replay its history, with no
 * active-thread wiring of your own. Drop it and the two components stop
 * talking to each other.
 *
 * The page's `slot="header"` customization example is NOT here, and that is a
 * finding rather than a choice: `CopilotThreadsDrawerProps` declares eleven
 * members and `children` is not one of them, so
 *
 *     <CopilotThreadsDrawer>
 *       <span slot="header">My conversations</span>
 *     </CopilotThreadsDrawer>
 *
 * is a type error against @copilotkit/react-core 1.69.0 — "Property 'children'
 * does not exist on type ... CopilotThreadsDrawerProps". The underlying
 * `copilotkit-threads-drawer` web component does accept slotted light-DOM
 * children; the React wrapper's typing simply does not expose them. See the
 * parent route.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/copilot-threads-drawer"
      subtitle="agent: threads-demo"
    >
      {/*
        * Its own provider on `/api/copilotkit-threads`: the app-wide one talks
        * to `/api/copilotkit`, which registers 25 agents and runs in SSE mode.
        * Intelligence has to sit on a runtime advertising as few agents as
        * possible — the client opens a realtime thread channel per advertised
        * agent. See the threads endpoint.
        */}
      <CopilotKit
        runtimeUrl="/api/copilotkit-threads"
        agent="threads-demo"
        enableInspector={nestedInspectorSetting}
      >
        <CopilotChatConfigurationProvider agentId="threads-demo">
          <div style={{ display: "flex", height: "100%" }}>
            <CopilotThreadsDrawer agentId="threads-demo" />
            <div className="chat-host min-w-0 flex-1">
              <CopilotChat agentId="threads-demo" />
            </div>
          </div>
        </CopilotChatConfigurationProvider>
      </CopilotKit>
    </DemoFrame>
  );
}
