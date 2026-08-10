"use client";

/**
 * RECONSTRUCTION. Not published by the docs.
 *
 * The Voice page's `page.tsx` renders `<VoiceChat />` imported from
 * `./voice-chat`, and that file appears on no page. The prose describes it
 * instead of showing it:
 *
 *   "The parent chat component can then drop that text into the composer's
 *    textarea (matched via `data-testid="copilot-chat-textarea"`) using the
 *    native value setter and a synthetic `input` event so React's managed
 *    state updates correctly."
 *
 * That paragraph is the whole specification, and `insertIntoComposer` below is
 * it, implemented literally — the native `HTMLTextAreaElement.prototype.value`
 * setter, then an `input` event with `bubbles: true`, which is the standard way
 * to write into a React-controlled input from outside React.
 *
 * Everything else here is chrome: a `<CopilotChat>` and the published
 * `SampleAudioButton` above it.
 */

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useCallback } from "react";

import { SampleAudioButton } from "./sample-audio-button";

const SAMPLE_TEXT = "What can you help me with today?";

function insertIntoComposer(text: string): boolean {
  const textarea = document.querySelector<HTMLTextAreaElement>(
    '[data-testid="copilot-chat-textarea"]',
  );
  if (!textarea) return false;

  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(textarea, text);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
  return true;
}

export function VoiceChat() {
  const handleTranscribed = useCallback((text: string) => {
    if (!insertIntoComposer(text)) {
      console.warn(
        "[voice] composer textarea not found — the data-testid the doc names may have changed",
      );
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-slate-200 p-3 dark:border-slate-800">
        <SampleAudioButton
          onTranscribed={handleTranscribed}
          sampleText={SAMPLE_TEXT}
        />
        <p className="mt-2 text-xs text-slate-500">
          The mic button to the right of the composer appears only because the
          runtime advertises <code>audioFileTranscriptionEnabled</code>. Without
          an <code>OPENAI_API_KEY</code> it renders and fails on click; the
          sample button above bypasses transcription entirely.
        </p>
      </div>
      <div className="chat-host min-h-0 flex-1">
        <CopilotChat agentId="voice-demo" />
      </div>
    </div>
  );
}
