/**
 * The agents that carry a `StrandsAgentConfig`.
 *
 * `buildLanguageAgent` is the `agent/main.ts` block printed on BOTH Shared
 * State pages (in-app-agent-read and in-app-agent-write), reproduced as
 * published. Its `stateContextBuilder` is copied verbatim, down to the
 * template literal:
 *
 *     stateContextBuilder: (inputData, userMessage) => {
 *       const state = (inputData.state ?? {}) as { language?: string };
 *       if (state.language) {
 *         return `Current language: ${state.language}\n\nUser request: ${userMessage}`;
 *       }
 *       return userMessage;
 *     }
 *
 * That is what makes shared state work on Strands at all: the adapter has no
 * automatic state → prompt path, so whatever the builder does not fold into
 * the prompt, the model never sees. Both pages say as much in their closing
 * callout ("Shared-state in AWS Strands is prompt-driven").
 *
 * The published block names the agent `languageAgent`, which is the id the
 * *write* page's `useAgent` targets. The *read* page targets `strands_agent`
 * instead — an id it never defines. See the doc gap on
 * /shared-state/in-app-agent-read.
 *
 * `buildStateMirrorAgent` is NOT published. Render-state-in-your-app has no
 * backend section at all — it is framework-neutral prose over `useAgent()` —
 * so its agent is this repo's: the same published shape with a builder that
 * serialises the whole state object instead of one named key. It is a
 * generalisation of the published builder, not a reconstruction of anything
 * the docs omitted, and it is why that route is Partial rather than Working.
 */

import { Agent } from "@strands-agents/sdk";
import { StrandsAgent, type StrandsAgentConfig } from "@ag-ui/aws-strands";

import { createModel } from "./model";

/** The Shared State pages' `agent/main.ts`, as published. */
export async function buildLanguageAgent(): Promise<StrandsAgent> {
  const model = createModel();

  const strandsAgent = new Agent({
    model,
    systemPrompt:
      "Always communicate in the preferred language of the user as defined in your state. Do not communicate in any other language.",
  });

  await strandsAgent.initialize();

const config: StrandsAgentConfig = {
  stateContextBuilder: (inputData, userMessage) => {
    const state = (inputData.state ?? {}) as { language?: string };
    if (state.language) {
      return `Current language: ${state.language}\n\nUser request: ${userMessage}`;
    }
    return userMessage;
  },
};
  return new StrandsAgent({
    agent: strandsAgent,
    name: "languageAgent",
    description: "Always communicate in the preferred language of the user",
    config,
  });
}

/**
 * The same shape with a whole-state builder, for the canvas route.
 *
 * The agent can read anything the UI writes with `agent.setState`. It cannot
 * write back — that needs a tool with a `ToolBehavior.stateFromArgs`, and no
 * Strands TypeScript page publishes one.
 */
export async function buildStateMirrorAgent(): Promise<StrandsAgent> {
  const strandsAgent = new Agent({
    model: createModel(),
    systemPrompt:
      "You are a helpful AI assistant working alongside a canvas the user " +
      "can edit. The canvas contents are given to you as state on every " +
      "turn. Answer questions about them accurately, and say plainly when " +
      "the canvas is empty.",
  });

  await strandsAgent.initialize();

const config: StrandsAgentConfig = {
  stateContextBuilder: (inputData, userMessage) => {
    const state = (inputData.state ?? {}) as { language?: string };
    if (state.language) {
      return `Current language: ${state.language}\n\nUser request: ${userMessage}`;
    }
    return userMessage;
  },
};

  return new StrandsAgent({
    agent: strandsAgent,
    name: "shared-state-read-write",
    description: "Reads the canvas state the UI publishes.",
    config,
  });
}
