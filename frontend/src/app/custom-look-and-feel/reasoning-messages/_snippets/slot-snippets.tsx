"use client";

/**
 * The Reasoning Messages page's prose snippets, verbatim.
 *
 * The page prints each `<CopilotChat messageView={...} />` as a bare JSX line
 * after the component it uses. This repo wraps each of those lines, unchanged,
 * in an exported component (`SlotsChat`, `RenderPropChat`) so the demo can
 * mount them; the wrappers are the only code here not on the page. The
 * page's import lines are kept; the second snippet adds none of its own.
 */

import {
  CopilotChatReasoningMessage,
} from "@copilotkit/react-core/v2";
import { CopilotChat } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

// ---- "Custom Header" -------------------------------------------------------

function CustomHeader({
  isOpen,
  label,
  hasContent,
  isStreaming,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  label?: string;
  hasContent?: boolean;
  isStreaming?: boolean;
}) {
  return (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium"
      {...props}
    >
      {isStreaming ? "🧠" : "💡"}
      <span>{label}</span>
      {hasContent && (
        <span className="ml-auto text-xs">{isOpen ? "Hide" : "Show"}</span>
      )}
    </button>
  );
}

// ---- "Custom Content" ------------------------------------------------------

function CustomContent({
  isStreaming,
  hasContent,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean;
  hasContent?: boolean;
}) {
  if (!hasContent && !isStreaming) return null;

  return (
    <div className="px-4 pb-3 text-sm text-gray-500 font-mono" {...props}>
      {children}
      {isStreaming && <span className="animate-pulse ml-1">▊</span>}
    </div>
  );
}

/** Repo wrapper around the page's combined slot-props example. */
export function SlotsChat() {
  return (
<CopilotChat
  messageView={{
    reasoningMessage: {
      header: CustomHeader,
      contentView: CustomContent,
    },
  }}
/>
  );
}

// ---- "Render-Prop Children" ------------------------------------------------

function MyReasoningLayout(props: React.ComponentProps<typeof CopilotChatReasoningMessage>) {
  return (
    <CopilotChatReasoningMessage {...props}>
      {({ header, toggle }) => (
        <div className="rounded-lg border bg-yellow-50 my-2">
          {header}
          {toggle}
        </div>
      )}
    </CopilotChatReasoningMessage>
  );
}

/** Repo wrapper around the page's render-prop example. */
export function RenderPropChat() {
  return (
<CopilotChat
  messageView={{
    reasoningMessage: MyReasoningLayout,
  }}
/>
  );
}
