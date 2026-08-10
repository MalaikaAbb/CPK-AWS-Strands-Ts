"use client";

/**
 * RECONSTRUCTION. Not published by the docs.
 *
 * The headless-UI page prints three snippets and strips the import block off
 * every one of them. `headless-simple/chat.tsx` uses `UserBubble` and
 * `AssistantBubble` with no import and no definition; `message-assistant.tsx`
 * — the page's longest block — defines them, but uses `Avatar`,
 * `AvatarFallback`, `Bot`, `User`, `cn`, `ReactMarkdown`, `remarkGfm`,
 * `MultimodalPart`, `Attachment` and `AttachmentChip`, none of which is
 * imported or defined anywhere on the page.
 *
 * Two of those (`Avatar`, `cn`) are shadcn primitives from the demo app's own
 * `components/ui`; two more (`ReactMarkdown`, `remarkGfm`) are third-party
 * packages the page never lists as dependencies; `AttachmentChip` is a
 * component that exists in no snippet.
 *
 * So these bubbles are this repo's: the same two exported names, the same
 * props, the same `data-testid` and `data-message-role` attributes, and the
 * same visual arrangement (avatar, right-aligned user, left-aligned assistant,
 * children slot for tool calls). What they do NOT reproduce is the markdown
 * pipeline — that needs `react-markdown` and `remark-gfm`, which the page uses
 * and never declares, so text renders as pre-wrapped plain text instead.
 */

import type { ReactNode } from "react";

export function AssistantBubble({
  content,
  children,
}: {
  content?: string;
  children?: ReactNode;
}) {
  const hasText = typeof content === "string" && content.trim().length > 0;
  const hasChildren = Boolean(children);
  if (!hasText && !hasChildren) return null;

  return (
    <div
      data-testid="headless-message-assistant"
      data-message-role="assistant"
      className="flex w-full items-start gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-xs dark:border-slate-700 dark:bg-slate-800">
        AI
      </div>
      <div className="flex max-w-[calc(100%-2.75rem)] flex-1 flex-col items-start gap-2">
        {hasText && (
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100">
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
        )}
        {hasChildren && (
          <div className="flex w-full max-w-full flex-col gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}

export function UserBubble({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <div
      data-testid="headless-message-user"
      data-message-role="user"
      className="flex w-full flex-row-reverse items-start gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-medium text-white">
        You
      </div>
      <div className="flex max-w-[80%] flex-col items-end gap-2">
        <div className="rounded-2xl rounded-tr-sm bg-[var(--accent)] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    </div>
  );
}
