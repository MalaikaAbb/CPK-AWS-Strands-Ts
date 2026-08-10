"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc page's `Chat` component:
 *
 *     function Chat() {
 *       useAgenticChatSuggestions();
 *       return <CopilotChat agentId="agentic_chat" />;
 *     }
 *
 * `useAgenticChatSuggestions` is local to CopilotKit's own demo app and is
 * exported by no package. It wraps `useConfigureSuggestions`, which is
 * exported, so this calls that directly and supplies the suggestions inline.
 */
function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "What can you do?", message: "What can you help me with?" },
      { title: "Tell me a joke", message: "Please tell me a short joke." },
    ],
    available: "always",
  });

  return <CopilotChat agentId="agentic_chat" />;
}

export default function Page() {
  return (
    <DemoFrame parentPath="/prebuilt-components/chat" subtitle="agent: agentic_chat">
      <div className="chat-host mx-auto h-full max-w-3xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
