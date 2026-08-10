"use client";

import {
  CopilotChat,
  useComponent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { BarChart, barChartPropsSchema } from "../bar-chart";

/**
 * The page's one published snippet, in a component that can run it.
 *
 * The `useComponent` call below is verbatim:
 *
 *     useComponent({
 *       name: "render_bar_chart",
 *       description: "Display a bar chart with labeled numeric values.",
 *       parameters: barChartPropsSchema,
 *       render: BarChart,
 *     });
 *
 * `barChartPropsSchema` and `BarChart` are named there and published nowhere;
 * `../bar-chart.tsx` supplies both.
 *
 * There is no handler and no user interaction — that is the whole distinction
 * this page draws against tool rendering and human-in-the-loop. The agent
 * decides when to show it and fills the props.
 */
function Chat() {
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Chart quarterly revenue",
        message:
          "Chart this quarterly revenue: Q1 120, Q2 145, Q3 132, Q4 189.",
      },
      {
        title: "Chart something you invent",
        message: "Make up five plausible monthly signup numbers and chart them.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="gen-ui-tool-based" />;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-based"
      subtitle="agent: gen-ui-tool-based"
    >
      <div className="chat-host mx-auto h-full max-w-3xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
