"use client";

import {
  CopilotChat,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomCatchallRenderer,
  FlightListCard,
  WeatherCard,
  parseJsonResult,
  type CatchallToolStatus,
  type Flight,
} from "../cards";

/**
 * All three renderers the page documents, on one surface.
 *
 * The two `useRenderTool` calls and the `useDefaultRenderTool` call are the
 * page's snippets verbatim, including their comments and their `[]` dependency
 * arrays. The interfaces the render functions destructure — `WeatherResult`,
 * `FlightSearchResult` — are the page's too.
 *
 * `get_weather` fires: its tool was supplied separately and lives in
 * `backend/src/agents/tools.ts`. The doc page still prints a `snippet skipped`
 * marker where that tool should be — see the parent route.
 *
 * `search_flights` does not fire. No tool of that name exists anywhere in the
 * Strands TypeScript tree, so this renderer is registered and idle, which is
 * what following the page alone produces for both of them.
 *
 * The catch-all covers anything else that reaches the chat.
 */

interface WeatherResult {
  city?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
}

interface FlightSearchResult {
  origin?: string;
  destination?: string;
  flights?: Flight[];
}

function Chat() {
  // Per-tool renderer #1: get_weather → branded WeatherCard.
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({
        location: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const loading = status !== "complete";
        const parsed = parseJsonResult<WeatherResult>(result);
        return (
          <WeatherCard
            loading={loading}
            location={parameters?.location ?? parsed.city ?? ""}
            temperature={parsed.temperature}
            humidity={parsed.humidity}
            windSpeed={parsed.wind_speed}
            conditions={parsed.conditions}
          />
        );
      },
    },
    [],
  );

  // Per-tool renderer #2: search_flights → branded FlightListCard.
  useRenderTool(
    {
      name: "search_flights",
      parameters: z.object({
        origin: z.string(),
        destination: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const loading = status !== "complete";
        const parsed = parseJsonResult<FlightSearchResult>(result);
        return (
          <FlightListCard
            loading={loading}
            origin={parameters?.origin ?? parsed.origin ?? ""}
            destination={parameters?.destination ?? parsed.destination ?? ""}
            flights={parsed.flights ?? []}
          />
        );
      },
    },
    [],
  );

  // Wildcard catch-all for anything that doesn't match a per-tool
  // renderer above.
  useDefaultRenderTool(
    {
      render: ({ name, parameters, status, result }) => (
        <CustomCatchallRenderer
          name={name}
          parameters={parameters}
          status={status as CatchallToolStatus}
          result={result}
        />
      ),
    },
    [],
  );

  return <CopilotChat agentId="tool-rendering" />;
}

export default function ToolRenderingDemo() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-rendering"
      subtitle="agent: tool-rendering — has no tools"
    >
      <div className="chat-host mx-auto h-full max-w-4xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
