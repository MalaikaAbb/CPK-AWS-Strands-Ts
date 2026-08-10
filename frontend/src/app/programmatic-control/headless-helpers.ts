"use client";

/**
 * RECONSTRUCTION. Not published by the docs.
 *
 * The Programmatic Control page's send pipeline opens like this:
 *
 *     const {
 *       attachments, fileInputRef, containerRef, handleFileUpload,
 *       handleDragOver, handleDragLeave, handleDrop, dragOver,
 *       removeAttachment, consumeAttachments,
 *     } = useAttachmentsConfig();
 *
 * and goes on to call `useAutoScroll(messages, agent.isRunning)` and
 * `buildContent(trimmed, ready)`. None of the three is printed on any page.
 * `useAttachmentsConfig` is a tab title in the demo source viewer with no body;
 * `useAutoScroll` and `buildContent` are not even that.
 *
 * Their contracts are nonetheless fully determined by the snippet that uses
 * them, which is why they can be rebuilt rather than guessed:
 *
 *   - `consumeAttachments()` returns an array and empties the queue — the
 *     snippet's comment says "consume queued uploads first so they get sent
 *     even if the user didn't type any text alongside them", and it checks
 *     `ready.length === 0` alongside the empty-text check.
 *   - `buildContent(text, ready)` returns a plain string when there are no
 *     attachments and the multimodal `content` array otherwise — the snippet
 *     passes the result straight to `agent.addMessage({ content })`, and AG-UI
 *     accepts either.
 *   - `useAutoScroll` returns `{ listRef, bottomRef, stickRef }`, and
 *     `stickRef.current = true` is set on send and on reset, so it is a
 *     "stick to bottom" flag rather than a scroll position.
 *
 * This module is why /programmatic-control is Partial rather than Working.
 */

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ types */

export interface QueuedAttachment {
  id: string;
  file: File;
  /** Raw base64, with the `data:…;base64,` prefix stripped. */
  base64: string;
  mimeType: string;
  name: string;
  size: number;
}

/**
 * The AG-UI content-part shapes this pipeline can emit.
 *
 * Taken from `@ag-ui/core`'s `InputContentSchema`, not from a doc page — the
 * `source` is a discriminated union (`{ type: "data", value, mimeType }` for
 * inline base64, `{ type: "url", value }` for hosted files), not the bare
 * string a first reading of the Multimodal Attachments page suggests.
 */
export type ContentPart =
  | { type: "text"; text: string }
  | {
      type: "image" | "video" | "document";
      source: { type: "data"; value: string; mimeType: string };
      metadata?: Record<string, unknown>;
    };

/* ------------------------------------------------------- useAutoScroll */

export function useAutoScroll(messages: unknown[], isRunning: boolean) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  /** While true, new content pins the view to the bottom. */
  const stickRef = useRef(true);

  // Reading the scroll position on every scroll event is what lets a user
  // scroll up mid-stream and stay there.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      stickRef.current = distanceFromBottom < 48;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!stickRef.current) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isRunning]);

  return { listRef, bottomRef, stickRef };
}

/* ------------------------------------------------ useAttachmentsConfig */

function partTypeFor(mimeType: string): "image" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export function useAttachmentsConfig() {
  const [attachments, setAttachments] = useState<QueuedAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const queued = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<QueuedAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error);
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                file,
                base64: String(reader.result ?? "").split(",")[1] ?? "",
                mimeType: file.type || "application/octet-stream",
                name: file.name,
                size: file.size,
              });
            reader.readAsDataURL(file);
          }),
      ),
    );
    setAttachments((prev) => [...prev, ...queued]);
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) void addFiles(event.target.files);
      // Reset so selecting the same file twice still fires a change event.
      event.target.value = "";
    },
    [addFiles],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      if (event.dataTransfer?.files?.length) {
        void addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /**
   * Hand back everything queued and clear the queue in one step.
   *
   * Returns the current value synchronously rather than reading state on the
   * next render, because the caller uses the result immediately in the same
   * event handler.
   */
  const consumeAttachments = useCallback((): QueuedAttachment[] => {
    let taken: QueuedAttachment[] = [];
    setAttachments((prev) => {
      taken = prev;
      return [];
    });
    return taken;
  }, []);

  return {
    attachments,
    fileInputRef,
    containerRef,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragOver,
    removeAttachment,
    consumeAttachments,
  };
}

/* --------------------------------------------------------- buildContent */

/**
 * Text alone stays a string; anything with attachments becomes the multimodal
 * parts array. `agent.addMessage` accepts both.
 */
export function buildContent(
  text: string,
  ready: QueuedAttachment[],
): string | ContentPart[] {
  if (ready.length === 0) return text;

  const parts: ContentPart[] = [];
  if (text) parts.push({ type: "text", text });
  for (const a of ready) {
    parts.push({
      type: partTypeFor(a.mimeType),
      source: { type: "data", value: a.base64, mimeType: a.mimeType },
      metadata: { filename: a.name, size: a.size },
    });
  }
  return parts;
}
