"use client";

/**
 * RECONSTRUCTION. Not published by the docs.
 *
 * The slots page's three code blocks are cumulative prefixes of one file,
 * `slot-overrides.snippet.tsx`, and every one of them opens with the same
 * three lines:
 *
 *     declare const CustomWelcomeScreen: React.ComponentType;
 *     declare const CustomAssistantMessage: React.ComponentType;
 *     declare const CustomDisclaimer: React.ComponentType;
 *
 * `declare const` is a type-level assertion that something exists elsewhere.
 * The docs never say where. The three bodies are not published on this page or
 * any other, and neither is the `<CopilotChat>` that consumes the three locals
 * — the longest snippet ends mid-function with no closing brace and no return.
 *
 * So these three components are this repo's, written to do the one thing the
 * page's prose says each does:
 *
 *   - welcomeScreen: "a gradient card that still renders the default input and
 *     suggestions"
 *   - assistantMessage: "wraps the default component with a tinted card and a
 *     small 'slot' badge so you can see the override is active"
 *   - disclaimer: "a visibly tagged disclaimer so reviewers can tell the
 *     override is still in effect once the welcome screen is gone"
 *
 * They are deliberately loud. The point of the route is to prove a slot was
 * replaced, so each one is unmistakable on screen.
 */

import {
  CopilotChatAssistantMessage,
  CopilotChatView,
} from "@copilotkit/react-core/v2";
import type { ComponentProps } from "react";

function SlotBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-400 bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200">
      {label}
    </span>
  );
}

/**
 * `welcomeScreen` — the empty state before the first message.
 *
 * The page says the replacement "still renders the default input and
 * suggestions", so this composes the default `WelcomeScreen` rather than
 * replacing it wholesale.
 */
export function CustomWelcomeScreen(
  props: ComponentProps<typeof CopilotChatView.WelcomeScreen>,
) {
  return (
    <div className="flex h-full flex-col">
      <div className="m-4 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-6 text-white shadow-lg">
        <SlotBadge label="welcomeScreen slot" />
        <h2 className="mt-3 text-xl font-semibold">A replaced welcome screen</h2>
        <p className="mt-1 text-sm text-white/90">
          This gradient card is not part of CopilotKit. The composer and
          suggestions below it still are.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <CopilotChatView.WelcomeScreen {...props} />
      </div>
    </div>
  );
}

/**
 * `messageView.assistantMessage` — every assistant reply.
 *
 * Wraps the default rather than reimplementing it, so markdown, the copy
 * button, and tool-call rendering all keep working.
 */
export function CustomAssistantMessage(
  props: ComponentProps<typeof CopilotChatAssistantMessage>,
) {
  return (
    <div className="rounded-xl border border-violet-300 bg-violet-50/60 p-3 dark:border-violet-800 dark:bg-violet-950/30">
      <SlotBadge label="assistantMessage slot" />
      <div className="mt-2">
        <CopilotChatAssistantMessage {...props} />
      </div>
    </div>
  );
}

/** `input.disclaimer` — the small print under the composer. */
export function CustomDisclaimer() {
  return (
    <p className="px-3 py-1.5 text-center text-[11px] text-violet-700 dark:text-violet-300">
      <SlotBadge label="disclaimer slot" /> Replaced disclaimer — still in
      effect after the welcome screen is gone.
    </p>
  );
}
