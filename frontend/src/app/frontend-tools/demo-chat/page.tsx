"use client";

import React, { useState } from "react";
import { CopilotChat, useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { Background, DEFAULT_BACKGROUND } from "../background";

/**
 * The Frontend Tools page's `page.tsx`.
 *
 * The `useFrontendTool` call below — name, description, Zod schema, handler —
 * is the page's snippet character for character. The published block ends
 * immediately after the handler, with no closing brace and no return, so the
 * markup around it is this repo's.
 *
 * The doc's imports include `CopilotKit` and `CopilotSidebar` (this harness has
 * one root provider, so no nested `CopilotKit`) and
 * `useFrontendToolsSuggestions` from `./suggestions`, which is not published.
 */
function Chat() {
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);

  useFrontendTool({
    name: "change_background",
    description:
      "Change the page background. Accepts any valid CSS background value — colors, linear or radial gradients, etc.",
    parameters: z.object({
      background: z
        .string()
        .describe("The CSS background value. Prefer gradients."),
    }),
    handler: async ({ background }) => {
      setBackground(background);
      return { status: "success" };
    },
  });

  return (
    <Background background={background}>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_28rem]">
        <div className="hidden flex-col justify-center p-10 lg:flex">
          <h1 className="text-3xl font-semibold text-slate-900/80">
            Frontend Tools
          </h1>
         
          <p className="mt-4 font-mono text-[11px] text-slate-800/60">
            {background}
          </p>
        </div>
        <div className="chat-host h-full border-l border-black/10 bg-white/85 backdrop-blur">
          <CopilotChat agentId="frontend-tools" />
        </div>
      </div>
    </Background>
  );
}

export default function Page() {
  return (
    <DemoFrame parentPath="/frontend-tools" subtitle="agent: frontend-tools">
      <Chat />
    </DemoFrame>
  );
}
