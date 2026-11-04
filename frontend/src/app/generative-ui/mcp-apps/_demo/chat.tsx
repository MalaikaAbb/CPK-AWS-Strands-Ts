"use client";

/**
 * Repo-authored stand-in — NOT from the docs. The page's `page.tsx` imports
 * `Chat` from "./chat", which is not published. A plain `<CopilotChat>` on the
 * page's agent id: the page says a plain chat is all MCP Apps needs.
 */
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="mcp-apps" className="h-full" />;
}
