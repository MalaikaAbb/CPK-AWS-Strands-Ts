/**
 * The JSON Render page's agent: `buildByocJsonRenderAgent` from the published
 * `agent.ts`, with the one thing that file imports and never publishes.
 *
 * The factory below is copied from `backend/docs_verbatim/agent_ts_published.ts`
 * (the `buildByocJsonRenderAgent` block). The departures are:
 *
 *  1. `BYOC_JSON_RENDER_SYSTEM_PROMPT` is harness-authored. The published file
 *     imports it from `./prompts`, which no page prints; the JSON Render page's
 *     backend section shows only an example of the output.
 *  2. `createModel` resolves to `./model` (the Quickstart's two lines) rather
 *     than the unpublished `./model-factory`.
 *  3. `await strandsAgent.initialize()` is added, as in every other agent here,
 *     because the Quickstart's `main.ts` calls it and `agent.ts` never does.
 *
 * The spec shape and the component names and props in the prompt are what
 * `frontend/src/app/generative-ui/json-render/spec-helpers.ts` and
 * `registry.tsx` accept. If you change one, change the other, or the frontend
 * drops the elements that fail validation.
 */

import { Agent } from "@strands-agents/sdk";
import { StrandsAgent } from "@ag-ui/aws-strands";

import { createModel } from "./model";

// Harness-authored — the published one lives in the unpublished `./prompts`.
const BYOC_JSON_RENDER_SYSTEM_PROMPT = `You are a sales analytics assistant. Every reply is a single JSON object and nothing else — no prose before or after it, no Markdown, no code fences.

The object is a flat UI spec with two keys:
- "root": the id of the top-level element.
- "elements": an object mapping each element id to { "type": string, "props": object, "children": array of element ids }.

Element ids are short unique strings you choose ("root", "revenue", "chart1"). Children are referenced by id, never nested inline. Every id listed in a "children" array must exist in "elements".

Types (use only these):
- Stack — lays out its children vertically. props: {}. children: the ids to show, in order.
- MetricCard — one headline number. props: { "title": string, "value": number, "delta": number } where delta is the change as a ratio (0.07 for +7%). Omit "delta" entirely when there is no comparison; never set it to null. children: [].
- BarChart — compares values across categories. props: { "data": [ { "label": string, "value": number } ] }. children: [].
- PieChart — each category's share of a total. props: { "data": [ { "label": string, "value": number } ] }. children: [].

All numbers are plain JSON numbers: no currency symbols, commas, units or quotes.

Example:
{"root":"root","elements":{"root":{"type":"Stack","props":{},"children":["revenue","orders","chart"]},"revenue":{"type":"MetricCard","props":{"title":"Revenue","value":4200000,"delta":0.12},"children":[]},"orders":{"type":"MetricCard","props":{"title":"Orders","value":18450},"children":[]},"chart":{"type":"BarChart","props":{"data":[{"label":"Jan","value":1210000},{"label":"Feb","value":1340000}]},"children":[]}}}

Always use a Stack as the root. For a dashboard, show two to four MetricCards, then a chart. For a breakdown, use a PieChart for shares and a BarChart for comparisons. Invent plausible figures when the user gives none, and keep them consistent within a reply.`;

/** Tool-free json-render flat-spec generator (declarative-json-render). */
export async function buildByocJsonRenderAgent(): Promise<StrandsAgent> {
  const strandsAgent = new Agent({
    model: await createModel(),
    systemPrompt: BYOC_JSON_RENDER_SYSTEM_PROMPT,
    tools: [],
  });

  await strandsAgent.initialize();

  return new StrandsAgent({
    agent: strandsAgent,
    name: "byoc_json_render",
    description:
      "json-render flat-spec generator for the declarative-json-render demo.",
  });
}
