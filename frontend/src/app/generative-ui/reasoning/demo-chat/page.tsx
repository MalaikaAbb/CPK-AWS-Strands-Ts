"use client";

import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import ReasoningCustomDemo from "../_demo/reasoning-custom/page";
import ReasoningDefaultDemo from "../_demo/reasoning-default/page";

/**
 * The page's two demos, `reasoning-default` and `reasoning-custom`, mounted as
 * published (custom: suggestions hook commented out, it is unpublished). Each
 * brings its own `<CopilotKit runtimeUrl="/api/copilotkit">`; only one is
 * mounted at a time. The switch is this repo's.
 */
export default function Page() {
  const [variant, setVariant] = useState<"default" | "custom">("default");

  return (
    <DemoFrame
      parentPath="/generative-ui/reasoning"
      subtitle={`agent: reasoning-${variant} → /reasoning/`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 gap-2 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
          {(["default", "custom"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={
                v === variant
                  ? "rounded bg-slate-900 px-2 py-1 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "rounded px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }
            >
              {v === "default" ? "Default card" : "Custom ReasoningBlock"}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {variant === "default" ? (
            <ReasoningDefaultDemo key="default" />
          ) : (
            <ReasoningCustomDemo key="custom" />
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
