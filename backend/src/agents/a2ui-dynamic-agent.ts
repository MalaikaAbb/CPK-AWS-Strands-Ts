/**
 * The one factory from the published `agent.ts` this repo can actually run.
 *
 * `buildA2uiDynamicAgent` is printed in full on 18 doc pages, and unlike its
 * six siblings it depends on nothing outside its own file except `createModel`
 * — the catalog id, the sales dataset, the composition rules and the system
 * prompt are all defined inline in the same published block. Substituting the
 * Quickstart's published model construction for `createModel` is therefore the
 * only change needed to make it executable.
 *
 * Everything below the imports is copied from
 * `backend/docs_verbatim/agent_ts_published.ts` (lines 250–317) character for
 * character. The three departures are:
 *
 *  1. `createModel` resolves to `./model` (the Quickstart's two lines) rather
 *     than the unpublished `./model-factory`, and takes `api` rather than
 *     `openaiApi` — the Strands SDK's own option name.
 *  2. `await strandsAgent.initialize()` is added, because the Quickstart's
 *     `main.ts` calls it and the published `agent.ts` never does — nothing
 *     shows how the showcase's agents get initialised.
 *  3. `buildA2uiRecoveryAgent`, which is byte-identical to this apart from its
 *     name, is not carried over. Its demo depends on "aimock fixtures" that
 *     ship in no public package, and no route in this harness covers it.
 *  4. Nothing else. The prompts are not paraphrased or shortened, and the
 *     `StrandsAgent.name` stays `a2ui_dynamic_schema` as published — the id
 *     the frontend addresses (`declarative-gen-ui`) is the registry key it is
 *     mounted under, which is a separate thing.
 *
 * The composition guide names the catalog the frontend registers at
 * `frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/`. If you change one,
 * change the other or the planner emits components that cannot render.
 */

import { Agent } from "@strands-agents/sdk";
import { StrandsAgent, type StrandsAgentConfig } from "@ag-ui/aws-strands";

import { createModel } from "./model";

// #region published-a2ui-dynamic

const A2UI_DYNAMIC_CATALOG_ID = "declarative-gen-ui-catalog";

const A2UI_DYNAMIC_SALES_DATASET = `Vantage Threads (fictional B2B apparel company) — Q2 sales data. Ground every visual in these numbers; invent only plausible details consistent with them.
- Quarterly revenue: $4.2M (up 12% QoQ). New customers: 186 (up 8%). Win rate: 31% (down 2pts). Avg deal size: $22.6k (up 5%).
- Revenue by region: North America $1.9M, EMEA $1.3M, APAC $720k, LATAM $280k.
- Monthly revenue: Jan $1.21M, Feb $1.34M, Mar $1.65M, Apr $1.38M, May $1.42M, Jun $1.40M.
- Reps (vs quota): Dana Whitfield 124%, Marcus Lee 108%, Priya Sharma 97%, Tom Okafor 88%, Elena Vasquez 71%.
- At-risk: total $615k ARR across 3 accounts — Northwind Retail ($340k renewal, no contact 6 weeks; severity high), Cascadia Outfitters ($180k, champion left; severity medium), Atlas Goods ($95k, stalled legal review; severity medium).
- Biggest account: Meridian Apparel Group — owner Dana Whitfield, region North America, ARR $612k, renewal Sep 30, last contact 3 days ago, health green, 4 open opportunities worth $210k.
- Meridian revenue by product line: Outerwear $260k, Footwear $180k, Accessories $112k, Custom $60k.`;

const A2UI_DYNAMIC_COMPOSITION_RULES = `Use ONLY these exact component names (the registered catalog — any other name fails to render): Card, Column, Row, Text, Metric, PieChart, BarChart, DataTable, StatusBadge, InfoRow, PrimaryButton. The single-value KPI tile component is named exactly "Metric" (NOT "MetricTile" or "MetricCard").

Pick A2UI components by the shape of the question — never ask which chart the user wants:
1. Overall snapshot / "sales dashboard" → a Column (gap 16) whose first child is a Row (gap 16) of 4 Metric components (each with trend + trendValue), followed by a Row with a PieChart (revenue by region) next to a BarChart (monthly revenue, all six months Jan-Jun). Do NOT wrap the dashboard in a surrounding Card — the charts carry their own card chrome. Do NOT use StatusBadge, DataTable, or InfoRow here.
2. Rep / team performance → a Column (gap 16) with a Card containing a DataTable (columns: rep, attainment, pipeline) next to or above a BarChart of quota attainment % per rep — no StatusBadge or InfoRow.
3. Risk / health checks → a Column (gap 16): first a Row (gap 16) of 3 Metric components (ARR at risk $615k trend down, accounts at risk 3, biggest exposure Northwind $340k), then a Row (gap 16) with one compact Card per at-risk account (title = account name, subtitle = ARR at stake) containing a StatusBadge (error for high severity, warning otherwise) above a one-line Text with the reason and the recommended next action — no DataTable or InfoRow.
4. Single account/entity details → a Row (gap 16) with a Card of InfoRow facts (owner, region, ARR, renewal date, last contact) next to a PieChart of that account's revenue by product line — no DataTable or StatusBadge.
5. Part-of-whole follow-ups → PieChart; trends or comparisons over time/categories → BarChart.
Compose generously — a dashboard should feel like a real analytics product, not a single widget.`;

const A2UI_DYNAMIC_COMPOSITION_GUIDE = `${A2UI_DYNAMIC_SALES_DATASET}\n\n${A2UI_DYNAMIC_COMPOSITION_RULES}`;

// Mirrors the langgraph-python demo's a2ui_dynamic.py SYSTEM_PROMPT.
const A2UI_DYNAMIC_SYSTEM_PROMPT =
  "You are the embedded sales analyst for Vantage Threads, the fictional " +
  "B2B apparel company described in your App Context. Answer every " +
  "business question by calling `generate_a2ui` to draw a rich visual " +
  "surface, and keep the chat reply to one short sentence.\n\n" +
  "Ground every number in the sales dataset from App Context — never " +
  "invent figures that contradict it. Follow the dashboard composition " +
  "rules from App Context when choosing components: pick the component " +
  "by the shape of the question (snapshot → composed KPI dashboard with " +
  "charts; team performance → table; risk → status badges; single " +
  "account → info rows; part-of-whole → pie; trend/comparison → bar). " +
  "Never ask the user which chart they want. `generate_a2ui` takes no " +
  "arguments and handles the rendering automatically. Compose " +
  "generously — a dashboard should feel like a real analytics product, " +
  "not a single widget.";

/**
 * Dedicated agent for the A2UI dynamic-schema demo. Wires NO `generate_a2ui`
 * tool — the runtime's `injectA2UITool: true` makes the adapter auto-inject it
 * and drive a secondary render planner to GENERATE the surface.
 */
export async function buildA2uiDynamicAgent(): Promise<StrandsAgent> {
  const strandsAgent = new Agent({
    // Chat Completions API: the Responses adapter buffers tool-call argument
    // deltas, which would defeat A2UI's progressive surface streaming.
    model: createModel({ api: "chat" }),
    systemPrompt: A2UI_DYNAMIC_SYSTEM_PROMPT,
  });

  await strandsAgent.initialize();

  const config: StrandsAgentConfig = {
    a2ui: {
      defaultCatalogId: A2UI_DYNAMIC_CATALOG_ID,
      guidelines: { compositionGuide: A2UI_DYNAMIC_COMPOSITION_GUIDE },
    },
  };

  return new StrandsAgent({
    agent: strandsAgent,
    name: "a2ui_dynamic_schema",
    description:
      "Dynamic A2UI surfaces generated on the fly (auto-injected tool)",
    config,
  });
}

// #endregion
