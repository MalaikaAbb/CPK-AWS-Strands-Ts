/**
 * The Hashbrown page's agent: `buildByocHashbrownAgent` from the published
 * `agent.ts`, with the one thing that file imports and never publishes.
 *
 * The factory below is copied from `backend/docs_verbatim/agent_ts_published.ts`
 * (the `buildByocHashbrownAgent` block). The departures are:
 *
 *  1. `BYOC_HASHBROWN_SYSTEM_PROMPT` is harness-authored. The published file
 *     imports it from `./prompts`, which no page prints, and the Hashbrown
 *     page's backend section says only that it "depends on your framework".
 *  2. The prompt asks for Hashbrown's real envelope,
 *     `{ "ui": [ { "Name": { "props": { … }, "children": [ … ] } } ] }`, not
 *     the `{ "type": …, … }` shape the page's example output shows. A kit
 *     draws nothing from the page's shape (see the `hashbrown-output-shape`
 *     gap in `frontend/src/lib/doc-gaps.ts`).
 *  3. `createModel` resolves to `./model` (the Quickstart's two lines) rather
 *     than the unpublished `./model-factory`.
 *  4. `await strandsAgent.initialize()` is added, as in every other agent here,
 *     because the Quickstart's `main.ts` calls it and `agent.ts` never does.
 *
 * The component names and props in the prompt are the ones
 * `frontend/src/app/generative-ui/hashbrown/hashbrown-fixed.tsx` exposes. If
 * you change one, change the other, or the kit rejects the reply.
 */

import { Agent } from "@strands-agents/sdk";
import { StrandsAgent } from "@ag-ui/aws-strands";

import { createModel } from "./model";

// Harness-authored — the published one lives in the unpublished `./prompts`.
const BYOC_HASHBROWN_SYSTEM_PROMPT = `You are a sales analytics assistant. Every reply is a single JSON object and nothing else — no prose before or after it, no Markdown, no code fences.

The object has one key, "ui", whose value is an array of elements. Each element is an object with exactly one key, the component name, whose value is an object with a "props" object (always present, even when empty) and, for Stack only, a "children" array of further elements.

Components (use only these names):
- Stack — lays out children vertically. props: {}. children: array of elements.
- MetricCard — one headline number. props: { "title": string, "value": number, "delta": number or null } where delta is the change as a ratio (0.07 for +7%), or null when there is no comparison.
- BarChart — compares values across categories. props: { "data": [ { "label": string, "value": number } ] }.
- PieChart — each category's share of a total. props: { "data": [ { "label": string, "value": number } ] }.

Example:
{"ui":[{"Stack":{"props":{},"children":[{"MetricCard":{"props":{"title":"Revenue","value":4200000,"delta":0.12}}},{"BarChart":{"props":{"data":[{"label":"Jan","value":1210000},{"label":"Feb","value":1340000}]}}}]}}]}

For a dashboard, start with two to four MetricCards, then a chart. For a breakdown, use a PieChart for shares and a BarChart for comparisons. Invent plausible figures when the user gives none, and keep them consistent within a reply.`;

/** Tool-free hashbrown UI-kit envelope generator (declarative-hashbrown). */
export async function buildByocHashbrownAgent(): Promise<StrandsAgent> {
  const strandsAgent = new Agent({
    model: await createModel(),
    systemPrompt: BYOC_HASHBROWN_SYSTEM_PROMPT,
    tools: [],
  });

  await strandsAgent.initialize();

  return new StrandsAgent({
    agent: strandsAgent,
    name: "byoc_hashbrown",
    description:
      "Hashbrown UI-kit envelope generator for the declarative-hashbrown demo.",
  });
}
