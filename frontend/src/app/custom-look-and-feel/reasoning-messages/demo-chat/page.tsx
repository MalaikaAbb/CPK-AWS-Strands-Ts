"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import ReasoningCustomDemo from "../_demo/reasoning-custom/page";
import ReasoningDefaultDemo from "../_demo/reasoning-default/page";
import { RenderPropChat, SlotsChat } from "../_snippets/slot-snippets";

type Variant = "default" | "slots" | "render-prop" | "custom";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "default", label: "Default card" },
  { id: "slots", label: "header + contentView slots" },
  { id: "render-prop", label: "Render-prop layout" },
  { id: "custom", label: "Fully custom (ReasoningBlock)" },
];

/**
 * Every variant the page shows, one mounted at a time (the switch is this
 * repo's). `default` and `custom` are the page's two demo Code-tab pages and
 * bring their own provider. The prose snippets name no agent or provider, so
 * they are mounted under a repo-added `<CopilotKit agent="reasoning-default">`
 * on the same runtime, which is what the page's demos use.
 */
export default function Page() {
  const [variant, setVariant] = useState<Variant>("default");

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/reasoning-messages"
      subtitle="agents: reasoning-default / reasoning-custom → /reasoning/"
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              className={
                v.id === variant
                  ? "rounded bg-slate-900 px-2 py-1 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "rounded px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {variant === "default" && <ReasoningDefaultDemo key="default" />}
          {variant === "custom" && <ReasoningCustomDemo key="custom" />}
          {(variant === "slots" || variant === "render-prop") && (
            <CopilotKit
              key={variant}
              runtimeUrl="/api/copilotkit"
              agent="reasoning-default"
            >
              <div className="h-full">
                {variant === "slots" ? <SlotsChat /> : <RenderPropChat />}
              </div>
            </CopilotKit>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
