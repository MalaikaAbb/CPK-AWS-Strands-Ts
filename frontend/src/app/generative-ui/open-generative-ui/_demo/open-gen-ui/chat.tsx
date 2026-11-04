"use client";

/**
 * Repo-authored stand-in — NOT from the docs. The minimal demo's `page.tsx`
 * imports `Chat` from "./chat", which is not published. A plain
 * `<CopilotChat>` on the page's agent id; the page says no extra props are
 * needed. (The advanced demo defines its own `Chat` inline.)
 */
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="open-gen-ui" className="flex-1 rounded-2xl" />;
}
