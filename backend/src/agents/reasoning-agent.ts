/**
 * Reasoning agents: emit AG-UI REASONING_MESSAGE_* events.
 *
 * Mirrors the Python siblings `agents/reasoning_agent.py` and
 * `agents/reasoning_chain_agent.py`.
 *
 * Why a reasoning model plus the Responses API: the OpenAI Responses API
 * streams `response.reasoning_summary_text.delta` items only for native
 * reasoning models (gpt-6-luna and friends). The Strands bridge
 * translates those into AG-UI REASONING_MESSAGE_* events with
 * `role: "reasoning"`, which the frontend renders through the
 * `reasoningMessage` slot. gpt-4o emits no reasoning items, so the showcase's
 * default chat-completions model would never light the slot up.
 *
 * `buildReasoningAgent` is tool-free and serves reasoning-default and
 * reasoning-custom. `buildReasoningChainAgent` adds the four mock tools the
 * tool-rendering-reasoning-chain demo paints per-tool renderers for; each pill
 * drives a chained pair of calls, so the agent has to own every tool in the
 * chain to reach the closing narration.
 */

import { Agent, tool } from "@strands-agents/sdk";
import { z } from "zod";
import { StrandsAgent } from "@ag-ui/aws-strands";
// Repo substitution: the published file imports `createModel` from
// "./model-factory", which no page publishes. This repo's `./model` is the
// Quickstart's model construction; it has no `openaiApi` / `reasoning` /
// `openaiModelId` options, so the call below cannot ask for a reasoning model.
import { createModel } from "./model";

export const REASONING_MODEL =
  process.env.OPENAI_REASONING_MODEL ?? "gpt-6-luna";

/** Responses-API model that streams reasoning summaries on every turn. */
function reasoningModel() {
  return createModel({
    // @ts-expect-error -- published options for the unpublished ./model-factory; this repo's ModelOptions has only `api`, so they are ignored and no reasoning summaries are requested (doc gap `reasoning-model-factory-unpublished`).
    openaiApi: "responses",
    reasoning: true,
    openaiModelId: REASONING_MODEL,
  });
}

const REASONING_SYSTEM_PROMPT =
  "You are a helpful assistant. For each user question, first think " +
  "step-by-step about the approach, then give a concise answer.";

/** Tool-free agent backing reasoning-default and reasoning-custom. */
export async function buildReasoningAgent(): Promise<StrandsAgent> {
  return new StrandsAgent({
    agent: new Agent({
      model: await reasoningModel(),
      systemPrompt: REASONING_SYSTEM_PROMPT,
      tools: [],
    }),
    name: "reasoning",
    description:
      "Strands agent that streams reasoning summaries alongside its answer",
  });
}

// The published file continues with `get_weather`, `search_flights`,
// `get_stock_price`, `roll_dice`, `REASONING_CHAIN_SYSTEM_PROMPT` and
// `buildReasoningChainAgent`. They back the tool-rendering-reasoning-chain demo,
// not the Reasoning page, so this repo leaves them out.
