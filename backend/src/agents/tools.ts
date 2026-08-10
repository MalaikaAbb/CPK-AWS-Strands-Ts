/**
 * The backend tools the Tool Call Rendering route needs.
 *
 * `getWeather` below is supplied as-is and reproduced character for character.
 * It is the snippet the doc page's own "The backend tool definition" section
 * promises and then replaces with
 * `<!-- snippet skipped: region 'weather-tool-backend' missing in
 * strands-typescript::tool-rendering -->`. That warning stays on the route: the
 * page still does not publish this, and having the code in hand from elsewhere
 * does not change what the documentation contains.
 *
 * `getWeatherImpl` is the one piece that had to be written. The published
 * `agent.ts` imports the whole family — `get_weather_impl`,
 * `search_flights_impl` and the rest — from a `tools` module that a comment in
 * the Python sibling locates outside anything the docs ship. So the tool body
 * is published and the function it delegates to is not.
 *
 * Its *shape*, though, is not guesswork. The published `tool-rendering/page.tsx`
 * declares exactly what the renderer reads back:
 *
 *     interface WeatherResult {
 *       city?: string;
 *       temperature?: number;
 *       humidity?: number;
 *       wind_speed?: number;      // snake_case, as published
 *       conditions?: string;
 *     }
 *
 * Those five keys are fixed by published code. Only the values are invented,
 * and they are deterministic rather than random: the same city always returns
 * the same reading, so the route is reproducible across reloads and a
 * screenshot taken today matches one taken tomorrow. Nothing here calls a
 * weather service — this is a fixture whose job is to prove the render path,
 * which is what the doc page is about.
 */

import { tool } from "@strands-agents/sdk";
import { z } from "zod";

/** What the published `WeatherResult` interface says a reading looks like. */
export interface WeatherReading {
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  conditions: string;
}

const CONDITIONS = [
  "Clear",
  "Partly cloudy",
  "Overcast",
  "Light rain",
  "Heavy rain",
  "Thunderstorms",
  "Snow",
  "Fog",
] as const;

/**
 * Stable hash of the location string.
 *
 * `Math.random()` would make the card change on every re-render during
 * streaming, which reads as a bug rather than a fixture. This keeps one city
 * pinned to one reading for the life of the repo.
 */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * NOT PUBLISHED. Imported by the tool below from the docs' unpublished `tools`
 * module; written here to the shape the published renderer reads.
 */
export function getWeatherImpl(location: string): WeatherReading {
  const city = location.trim() || "Unknown";
  const seed = hash(city.toLowerCase());

  return {
    city,
    // 24–89 °F, 30–89 % humidity, 2–25 mph — plausible ranges, no real data.
    temperature: 24 + (seed % 66),
    humidity: 30 + ((seed >> 3) % 60),
    wind_speed: 2 + ((seed >> 7) % 24),
    conditions: CONDITIONS[(seed >> 11) % CONDITIONS.length],
  };
}

export const getWeather = tool({
  name: "get_weather",
  description: "Get current weather for a location.",
  inputSchema: z.object({
    location: z.string().describe("The location to get weather for."),
  }),
  callback: ({ location }) => JSON.stringify(getWeatherImpl(location)),
});

/**
 * The tools the tool-rendering agent is built with.
 *
 * One entry, not two. The page wires *two* named renderers — `get_weather` and
 * `search_flights` — and `search_flights` still has no published tool and no
 * `searchFlightsImpl`, so that renderer stays idle. That asymmetry is why the
 * route is Partial rather than Working.
 */
export const TOOL_RENDERING_TOOLS = [getWeather];
