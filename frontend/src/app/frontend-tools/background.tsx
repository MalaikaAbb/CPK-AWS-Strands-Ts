"use client";

/**
 * The `Background` component and `DEFAULT_BACKGROUND` constant the
 * Frontend Tools page imports from `./background` and never publishes.
 *
 * The published `page.tsx` opens with
 * `import { Background, DEFAULT_BACKGROUND } from "./background";` and uses
 * both: `DEFAULT_BACKGROUND` seeds the `useState`, and the tool's handler
 * calls `setBackground(background)` with "any valid CSS background value —
 * colors, linear or radial gradients". So `Background` takes a CSS background
 * string and paints it. That is the whole contract, and it is all that is
 * recoverable.
 */

import type { ReactNode } from "react";

export const DEFAULT_BACKGROUND =
  "linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 50%, #fae8ff 100%)";

export function Background({
  background,
  children,
}: {
  background: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="h-full w-full transition-[background] duration-500"
      style={{ background }}
    >
      {children}
    </div>
  );
}
