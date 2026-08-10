"use client";

import {
  CopilotChat,
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatView,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomAssistantMessage,
  CustomDisclaimer,
  CustomWelcomeScreen,
} from "../slot-components";

/**
 * The three overrides the page discusses, applied to one `<CopilotChat>`.
 *
 * The doc's snippet extracts each into a local (`welcomeScreen`,
 * `messageView`, `input`) and then stops — it never shows them being passed to
 * anything. This is that final step, which is the only part of the pattern the
 * page leaves out.
 *
 * The three components come from `../slot-components`, which is a
 * reconstruction; see its docstring and the doc-gap panel on the parent route.
 *
 * The three `as unknown as` casts are the doc's own — its snippet writes each
 * override as `CustomWelcomeScreen as unknown as typeof
 * CopilotChatView.WelcomeScreen`. They are not decoration: a slot's type is
 * the default component *including its static sub-components*
 * (`CopilotChatAssistantMessage.Toolbar`, `.CopyButton`, and six more), so a
 * plain function component is genuinely not assignable and the double cast is
 * the only way through. The page never says this, which makes the casts look
 * like noise until you try to remove them.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/custom-look-and-feel/slots" subtitle="agent: chat-slots">
      <div className="chat-host mx-auto h-full max-w-3xl">
        <CopilotChat
          agentId="chat-slots"
          welcomeScreen={
            CustomWelcomeScreen as unknown as typeof CopilotChatView.WelcomeScreen
          }
          messageView={{
            assistantMessage:
              CustomAssistantMessage as unknown as typeof CopilotChatAssistantMessage,
          }}
          input={{
            disclaimer:
              CustomDisclaimer as unknown as typeof CopilotChatInput.Disclaimer,
          }}
        />
      </div>
    </DemoFrame>
  );
}
