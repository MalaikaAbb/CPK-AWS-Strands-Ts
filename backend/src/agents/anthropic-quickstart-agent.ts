/**
 * The Quickstart agent on Anthropic instead of OpenAI.
 *
 * The Quickstart's "Using Anthropic instead" callout (TypeScript tab) says to
 * set ANTHROPIC_API_KEY, `npm install @anthropic-ai/sdk`, and swap this model
 * into `main.ts`. The model block below is that snippet verbatim — the
 * `modelId` included, unlike `model.ts`, which lifts the OpenAI id into
 * `MODEL_ID`. Everything else is the Quickstart agent from `chat-agents.ts`,
 * mounted under its own id so both providers can run side by side.
 */

import { Agent } from "@strands-agents/sdk";
import { AnthropicModel } from "@strands-agents/sdk/models/anthropic";
import { StrandsAgent } from "@ag-ui/aws-strands";

export const ANTHROPIC_QUICKSTART_AGENT_ID = "strands_agent_anthropic";

export async function buildAnthropicQuickstartAgent(): Promise<StrandsAgent> {
  const model = new AnthropicModel({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelId: "claude-sonnet-4-6",
    maxTokens: 8192,
  });

  const agent = new Agent({
    model,
    systemPrompt: "You are a helpful AI assistant.",
  });

  await agent.initialize();

  return new StrandsAgent({
    agent,
    name: ANTHROPIC_QUICKSTART_AGENT_ID,
    description: "The Quickstart agent, on the doc's Anthropic model.",
  });
}
