import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PUBLISHED_SNIPPET = `import type {
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatView,
} from "@copilotkit/react-core/v2";

declare const CustomWelcomeScreen: React.ComponentType;
declare const CustomAssistantMessage: React.ComponentType;
declare const CustomDisclaimer: React.ComponentType;

export function ChatSlotsTeachingExtracts() {
  const welcomeScreen =
    CustomWelcomeScreen as unknown as typeof CopilotChatView.WelcomeScreen;

  const messageView = {
    assistantMessage:
      CustomAssistantMessage as unknown as typeof CopilotChatAssistantMessage,
  };

  const input = {
    disclaimer:
      CustomDisclaimer as unknown as typeof CopilotChatInput.Disclaimer,
  };`;

const LEVELS = `// 1. Tailwind classes — merged into the default component's classes
<CopilotChat
  messageView="bg-gray-50 dark:bg-gray-900 p-4"
  input="border-2 border-blue-400 rounded-xl"
/>

// 2. Props override — merged into the default component's props
<CopilotChat
  messageView={{ className: "my-custom-messages", "data-testid": "message-view" }}
  input={{ autoFocus: true }}
/>

// 3. Custom component — replaces the default outright
<CopilotChat messageView={CustomMessageView} />

// …and slots nest, to any depth
<CopilotChat
  messageView={{
    assistantMessage: {
      copyButton: ({ onClick }) => <button onClick={onClick}>Copy</button>,
    },
  }}
/>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/slots" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every prebuilt chat is assembled from named sub-components, and each
          one is a prop. A slot accepts three shapes — a class string, a props
          object, or a whole component — and the object form recurses, so{" "}
          <code>messageView.assistantMessage.copyButton</code> is a reachable
          override point. This route replaces three of them at once:{" "}
          <code>welcomeScreen</code>, <code>messageView.assistantMessage</code>,
          and <code>input.disclaimer</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Say hello"]}
            expect="Before you send: a gradient card with a violet 'welcomeScreen slot' badge, with the real composer under it. After: every assistant reply sits in a violet card, and the disclaimer under the composer is tagged."
            fail="A default chat. The overrides did not reach the component — check that the props are on <CopilotChat> and not on the provider."
          />
        </div>
      </Panel>

      <Panel title="The three levels, from the page's own examples">
        <CodeBlock code={LEVELS} language="tsx" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx" />
      </Panel>


      <Panel
        title="The reconstruction"
        description="This repo's, written from the page's prose descriptions of what each slot should do. Read the docstring first."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/slot-components.tsx" />
      </Panel>
    </>
  );
}
