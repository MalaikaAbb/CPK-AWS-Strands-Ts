/**
 * The one place a model is constructed.
 *
 * This is the Quickstart's TypeScript block, factored out so 25 agents don't
 * repeat it. The published code is:
 *
 *     const model = new OpenAIModel({
 *       apiKey: process.env.OPENAI_API_KEY ?? "",
 *       modelId: "gpt-5.4",
 *     });
 *
 * Two departures, both deliberate and both visible on the routes that care:
 *
 *  1. `modelId` defaults to `gpt-4o`, not the published `gpt-5.4`. The callout
 *     directly under that code block says the example "uses OpenAI's GPT-4o",
 *     and both Shared State pages build the same model with
 *     `modelId: "gpt-4o"`. `gpt-5.4` is not a model OpenAI serves. `MODEL_ID`
 *     lets you set it back to the literal published value and watch the run
 *     fail — see the doc gap on /quickstart.
 *
 *  2. `api` is exposed. `agent.ts` builds both A2UI agents with
 *     `createModel({ openaiApi: "chat" })` and explains why (the Responses
 *     adapter buffers tool-call argument deltas, which defeats A2UI's
 *     progressive streaming). `createModel` is one of the four modules the
 *     docs never publish; `api: "chat"` is the Strands SDK option underneath
 *     it — see `@strands-agents/sdk` `models/openai/types.d.ts`.
 *
 * This file is NOT a reconstruction of the docs' `model-factory.ts`. It is the
 * Quickstart's two published lines with the model id lifted into an env var.
 */

import { OpenAIModel } from "@strands-agents/sdk/models/openai";

export const MODEL_ID = process.env.MODEL_ID ?? "gpt-4o";

export interface ModelOptions {
  /** `"chat"` selects the Chat Completions adapter. Omit for the default. */
  api?: "chat" | "responses";
}

export function createModel(options: ModelOptions = {}): OpenAIModel {
  const apiKey = process.env.OPENAI_API_KEY ?? "";

  // `OpenAIModelOptions` is a union discriminated on `api`, so the two arms
  // have to be written out — spreading `api` in conditionally does not narrow.
  if (options.api === "chat") {
    return new OpenAIModel({ api: "chat", apiKey, modelId: MODEL_ID });
  }
  return new OpenAIModel({ apiKey, modelId: MODEL_ID });
}
