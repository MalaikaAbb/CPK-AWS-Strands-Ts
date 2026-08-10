"use client";

/**
 * The Voice page's `sample-audio-button.tsx`, reproduced as published.
 *
 * One addition: `SampleAudioButtonProps`. The published block annotates its
 * parameter with that type and never declares it — the interface is nowhere on
 * the page. Its two fields are read straight off the destructuring, so the
 * declaration below is the only shape the snippet can have had.
 */

interface SampleAudioButtonProps {
  onTranscribed: (text: string) => void;
  sampleText: string;
}

export function SampleAudioButton({
  onTranscribed,
  sampleText,
}: SampleAudioButtonProps) {
  return (
    <button
      type="button"
      data-testid="voice-sample-audio-button"
      onClick={() => onTranscribed(sampleText)}
      title={`Inserts: "${sampleText}"`}
      className="inline-flex w-fit items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/10 dark:bg-black/30 dark:hover:bg-white/10"
    >
      <span aria-hidden>🎙</span>
      <span>Try a sample audio</span>
    </button>
  );
}
