"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The page's quick start plus its two error-handling snippets.
 *
 * `attachments={{ enabled: true }}` is the whole feature; `accept` and
 * `maxSize` are the page's configuration example. `onUploadFailed` and
 * `onError` are its error snippets — the page routes the first to
 * `toast.error(...)`, which is not defined anywhere, so both are rendered into
 * a visible list here instead.
 *
 * `accept` deliberately keeps the page's own value including `audio/*`, even
 * though the Strands adapter discards audio parts. Filtering audio out here
 * would hide the defect the doc-gap panel describes.
 */

type Problem = { kind: "upload" | "run"; message: string };

export default function Page() {
  const [problems, setProblems] = useState<Problem[]>([]);

  return (
    <DemoFrame parentPath="/multimodal-attachments" subtitle="agent: multimodal">
      <div className="flex h-full flex-col">
        {problems.length > 0 && (
          <ul className="shrink-0 space-y-1 border-b border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {problems.map((p, i) => (
              <li key={i}>
                <strong>{p.kind}:</strong> {p.message}
              </li>
            ))}
          </ul>
        )}

        <div className="chat-host mx-auto min-h-0 w-full max-w-3xl flex-1">
          <CopilotChat
            agentId="multimodal"
            attachments={{
              enabled: true,
              // The page's own value. Audio is listed here and silently
              // dropped by the adapter — see the doc gaps on this route.
              accept: "image/*,audio/*,video/*,application/pdf",
              maxSize: 10 * 1024 * 1024, // 10MB limit (default: 20MB)
              onUploadFailed: (error) => {
                setProblems((prev) => [
                  ...prev,
                  { kind: "upload", message: `${error.reason} — ${error.message}` },
                ]);
              },
            }}
            // The page's snippet is
            //   onError={(event) => console.error(`[${event.code}]`, event.error.message)}
            // which does not compile: `onError` on <CopilotChat> also matches
            // React's DOM onError, so `event` is a union and neither `code` nor
            // `error` is on both arms. The narrowing below is the smallest fix.
            onError={(event) => {
              if (!("code" in event)) return;
              console.error(`[${event.code}]`, event.error.message);
              setProblems((prev) => [
                ...prev,
                { kind: "run", message: `${event.code} — ${event.error.message}` },
              ]);
            }}
          />
        </div>
      </div>
    </DemoFrame>
  );
}
