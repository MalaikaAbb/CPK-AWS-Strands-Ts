"use client";

import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The Display-only page's snippet, verbatim.
 *
 * This is the rare route where the page publishes everything it uses: the Zod
 * schema, the component, and the `useComponent` call, in one block. Nothing
 * here is reconstructed. The only change is the wrapper — the doc's
 * `YourMainContent` returns an empty div holding a placeholder comment, so a
 * `<CopilotChat>` is put in its place to give the agent somewhere to render.
 *
 * Note the tool name: `showWeather`, camelCase, unlike the snake_case
 * `render_bar_chart` the Components-as-Tools page recommends in its own
 * callout. Kept as published.
 */

const weatherSchema = z.object({
  city: z.string().describe("City name"),
  temperature: z.number().describe("Temperature in Fahrenheit"),
  condition: z.string().describe("Weather condition"),
});

function WeatherCard({
  city,
  temperature,
  condition,
}: z.infer<typeof weatherSchema>) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{city}</h3>
      <p className="text-2xl">{temperature}°F</p>
      <p className="text-sm text-gray-500">{condition}</p>
    </div>
  );
}

function YourMainContent() {
  useComponent({
    name: "showWeather",
    description: "Display a weather card for a city.",
    parameters: weatherSchema,
    render: WeatherCard,
  });

  return <CopilotChat agentId="gen-ui-display-only" />;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/your-components/display-only"
      subtitle="agent: gen-ui-display-only"
    >
      <div className="chat-host mx-auto h-full max-w-3xl">
        <YourMainContent />
      </div>
    </DemoFrame>
  );
}
