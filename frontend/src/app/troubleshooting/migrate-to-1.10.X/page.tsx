import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

/**
 * Reference route: a v1-era migration guide (CopilotKit 1.10.X). Its snippets
 * use the v1 message classes and `@copilotkit/react-ui`, neither of which this
 * v2 harness installs, so they are shown verbatim and not compiled.
 */

const MSG_BEFORE = `const message = new TextMessage({
  role: MessageRole.Assistant,
  content: "Hello, how are you?",
});`;

const MSG_AFTER = `const message = {
  role: "assistant",
  content: "Hello, how are you?",
};`;

const CHECK_BEFORE = `if (message.isTextMessage()) {
  if (message.role === "assistant") {
    console.log(message.content);
  }
  if (message.role === "user") {
    console.log(message.content);
  }
}

if (message.isImageMessage()) {
  console.log(message.image);
}

if (message.isActionExecutionMessage()) {
  console.log(message.toolCalls);
}

// etc...`;

const CHECK_AFTER = `if (message.role === "assistant") {
  console.log(message.content, message.toolCalls, message.image);
}

if (message.role === "user") {
  console.log(message.content, message.image);
}`;

const ASSISTANT_BEFORE = `import { AssistantMessageProps } from "@copilotkit/react-ui";

export const AssistantMessage = (props: AssistantMessageProps) => {
  const { message, subComponent } = props;

  return <div style={{ marginBottom: "0.5rem" }}>{subComponent}</div>;
};`;

const ASSISTANT_AFTER = `import { AssistantMessageProps } from "@copilotkit/react-ui";

export const AssistantMessage = (props: AssistantMessageProps) => {
  const { message } = props;

  return <div style={{ marginBottom: "0.5rem" }}>{message.generativeUI}</div>;
};`;

const HEADLESS = `const { messages, suggestions, interrupt } = useCopilotChatHeadless_c();

return (
  <div>
    {suggestions.map((suggestion) => (
      <div key={suggestion.id}>{suggestion.title}</div>
    ))}

    {interrupt}

    {messages.map((message) => {
      switch (message.role) {
        case "assistant":
          if (message.generativeUI) return message.generativeUI;
          return <div key={message.id}>{message.content}</div>;
        case "user":
          return <div key={message.id}>{message.content}</div>;
      }
    })}
  </div>
);`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/troubleshooting/migrate-to-1.10.X" />

      <Panel title="What the guide covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A v1-era release note. Messages became plain objects keyed by{" "}
          <code>role</code> instead of class instances with{" "}
          <code>isTextMessage()</code>-style checks; a custom assistant message
          reads <code>message.generativeUI</code> instead of the{" "}
          <code>subComponent</code> prop (both still work); and{" "}
          <code>useCopilotChatHeadless_c</code> arrived as the headless chat
          hook, with <code>useCopilotChat</code> put into maintenance.
        </p>
      </Panel>

      <Panel title="The page's snippets">
        <div className="space-y-4">
          <CodeBlock code={MSG_BEFORE} language="tsx" filename="Message format — before" />
          <CodeBlock code={MSG_AFTER} language="tsx" filename="Message format — after" />
          <CodeBlock code={CHECK_BEFORE} language="tsx" filename="Type checking — before" />
          <CodeBlock code={CHECK_AFTER} language="tsx" filename="Type checking — after" />
          <CodeBlock code={ASSISTANT_BEFORE} language="tsx" filename="Custom assistant message — before" />
          <CodeBlock code={ASSISTANT_AFTER} language="tsx" filename="Custom assistant message — after" />
          <CodeBlock code={HEADLESS} language="tsx" filename="useCopilotChatHeadless_c" />
        </div>
      </Panel>

      <Callout tone="warn" title="This repo against the guide">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Nothing here applies to a v2 app as written. Both assistant-message
            snippets import <code>AssistantMessageProps</code> from{" "}
            <code>@copilotkit/react-ui</code>, the v1 package this repo does not
            install; v2 customises the assistant message through slots (see{" "}
            <Link className="underline" href="/custom-look-and-feel/slots">
              /custom-look-and-feel/slots
            </Link>
            ).
          </li>
          <li>
            The snippets use <code>TextMessage</code>,{" "}
            <code>MessageRole</code>, <code>message</code> and{" "}
            <code>useCopilotChatHeadless_c</code> without importing any of them.
            In <code>@copilotkit/react-core</code> 1.84.0 the headless hook is
            exported from the v1 root only, not from <code>/v2</code>.
          </li>
          <li>
            The page links its headless hook to{" "}
            <code>/strands-typescript/intelligence/headless-ui</code>, which
            resolves (checked 2026-11-11). This repo&apos;s v2 headless chat is
            at{" "}
            <Link className="underline" href="/custom-look-and-feel/headless-ui">
              /custom-look-and-feel/headless-ui
            </Link>
            .
          </li>
        </ul>
      </Callout>
    </>
  );
}
