/**
 * The A2UI fixed-schema agent, from the published `agent.ts`.
 *
 * `buildA2uiFixedSchemaAgent` is printed in full on 18 doc pages — the
 * `display_flight` tool, its Zod input schema, and the
 * createSurface → updateComponents → updateDataModel envelope. Everything
 * below the imports is that block character for character, including its
 * comments and the long system prompt.
 *
 * What the docs never published is the one thing it reads: the component tree
 * at `./a2ui_schemas/flight_schema.json`. That file is carried over from the
 * Google ADK harness, whose backend ships the identical schema for the
 * identical demo — same twelve nodes, same `Card > Column > [Title, Row,
 * Row, Button]` shape the Strands page draws as an ASCII diagram, and the same
 * four data paths (`/origin`, `/destination`, `/airline`, `/price`) that this
 * tool supplies. It is not a reconstruction: it is the same artefact from a
 * sibling repo. The doc gap stands — the Strands tree still publishes no
 * schema — but the route is no longer blocked by it.
 *
 * Three departures, all forced:
 *
 *  1. `createModel({ openaiApi: "chat" })` becomes `createModel({ api: "chat" })`.
 *     `openaiApi` is the unpublished `model-factory`'s parameter name; `api`
 *     is the Strands SDK option underneath it. The intent — Chat Completions,
 *     so the Responses adapter cannot buffer tool-call argument deltas and
 *     defeat A2UI's progressive streaming — is preserved exactly.
 *  2. `await strandsAgent.initialize()` is added, because the Quickstart's
 *     `main.ts` calls it and the published `agent.ts` never does.
 *  3. The import block is written here; the published excerpt shares one with
 *     six other factories.
 *
 * The catalog id must match the frontend's — see
 * `frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts`.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Agent, tool } from "@strands-agents/sdk";
import { z } from "zod";
import { StrandsAgent } from "@ag-ui/aws-strands";
import {
  A2UI_OPERATIONS_KEY,
  createSurface,
  updateComponents,
  updateDataModel,
} from "@ag-ui/a2ui-toolkit";

import { createModel } from "./model";

// #region published-a2ui-fixed

const _A2UI_DIR = dirname(fileURLToPath(import.meta.url));

const A2UI_FIXED_CATALOG_ID = "copilotkit://flight-fixed-catalog";
const A2UI_FIXED_SURFACE_ID = "flight-fixed-schema";

// Fixed, pre-authored component layout. Loaded from JSON so it can be authored
// and reviewed independently of the agent code.
const FLIGHT_SCHEMA: Array<Record<string, unknown>> = JSON.parse(
  readFileSync(join(_A2UI_DIR, "a2ui_schemas", "flight_schema.json"), "utf-8"),
);

const A2UI_FIXED_SYSTEM_PROMPT =
  "You help users find flights. When asked about a flight, call " +
  "`display_flight` exactly ONCE with origin, destination, airline, and " +
  'price. Use short airport codes (e.g. "SFO", "JFK") for ' +
  'origin/destination and a price string like "$289". The tool\'s return ' +
  "value is an A2UI surface descriptor — the flight card is already rendered " +
  "to the user; do NOT call `display_flight` again for the same trip and do " +
  "NOT repeat the flight details in text. After the tool returns, reply with " +
  "one short confirmation sentence and stop.";

/**
 * Dedicated agent for the A2UI fixed-schema demo. Returns the envelope as a
 * plain OBJECT (not a JSON string): the Strands TS SDK wraps an object
 * tool-return in a `json` content block the adapter reads and re-stringifies
 * into the TOOL_CALL_RESULT the client A2UIMiddleware scans for
 * `a2ui_operations`. (A bare string return lands in no content block and the
 * result comes through empty — unlike the Python SDK, which wraps strings.)
 */
export async function buildA2uiFixedSchemaAgent(): Promise<StrandsAgent> {
  const displayFlight = tool({
    name: "display_flight",
    description:
      "Show a flight card for the given trip. Use short airport codes " +
      '(e.g. "SFO", "JFK") for origin/destination and a price string like ' +
      '"$289". After this tool returns, the flight card is already rendered ' +
      "to the user via the A2UI surface — do NOT call it again for the same " +
      "flight; reply with one short confirmation sentence and stop.",
    inputSchema: z.object({
      origin: z.string().describe('Origin airport code, e.g. "SFO".'),
      destination: z.string().describe('Destination airport code, e.g. "JFK".'),
      airline: z.string().describe('Airline name, e.g. "United".'),
      price: z.string().describe('Price string, e.g. "$289".'),
    }),
    callback: ({ origin, destination, airline, price }) => ({
      [A2UI_OPERATIONS_KEY]: [
        createSurface(A2UI_FIXED_SURFACE_ID, A2UI_FIXED_CATALOG_ID),
        updateComponents(A2UI_FIXED_SURFACE_ID, FLIGHT_SCHEMA),
        updateDataModel(A2UI_FIXED_SURFACE_ID, {
          origin,
          destination,
          airline,
          price,
        }),
      ],
    }),
  });

  const strandsAgent = new Agent({
    // Chat Completions API: the Responses adapter buffers tool-call argument
    // deltas, which would defeat A2UI's progressive surface streaming.
    model: createModel({ api: "chat" }),
    systemPrompt: A2UI_FIXED_SYSTEM_PROMPT,
    tools: [displayFlight],
  });

  await strandsAgent.initialize();

  return new StrandsAgent({
    agent: strandsAgent,
    name: "a2ui_fixed_schema",
    description:
      "A2UI surface from a fixed, pre-authored schema (direct backend tool)",
  });
}

// #endregion
