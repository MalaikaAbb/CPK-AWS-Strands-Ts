/**
 * The Agent Config page's backend, as published.
 *
 * The page prints two blocks, both reproduced below in their own regions:
 *
 *  - `withStateContext` from `src/agent/state.ts` — copies the run's
 *    `context[]` and appends UI-owned state (preferences, sales todos) to it.
 *  - `ShowcaseStrandsAgent` from `src/agent/agent.ts` — a `StrandsAgent`
 *    subclass whose `run()` passes the rewritten input to `super.run()`.
 *
 * What makes this work at all is the adapter, not either block: since
 * `@ag-ui/aws-strands` 0.3.0, `StrandsAgent.run()` formats `context[]` into a
 * "Context provided by the application:" block, prepends it to the latest user
 * turn for the duration of each model call (a `BeforeModelCallEvent` hook), and
 * removes it again afterwards (`AfterModelCallEvent`). So the
 * `useAgentContext` entry the frontend publishes reaches the model without any
 * `stateContextBuilder`, and without being written into message history. The
 * page now warns against `stateContextBuilder` for exactly that reason.
 *
 * One gap: `withStateContext` calls `formatPreferencesBlock(state.preferences)`,
 * which lives in the unpublished rest of `src/agent/state.ts` — the demo's Code
 * tab ships `agent.ts` but not `state.ts`. Those lines are commented out, not
 * reimplemented. This route never sets `state.preferences` (its config travels
 * on `context`, not state), so nothing it demonstrates depends on them.
 *
 * The agent itself is the Quickstart's shape. `buildShowcaseAgent`'s
 * `SYSTEM_PROMPT` and `SHOWCASE_TOOLS` come from the unpublished `./prompts` and
 * `./tools`, so the prompt is the Quickstart's one-liner and there are no tools.
 * The context entry's own description ("Apply tone, expertise level, and
 * response length to every reply.") is the only instruction the agent gets
 * about the config — which is what the page claims is sufficient.
 */

import { Agent } from "@strands-agents/sdk";
import type { RunAgentInput } from "@ag-ui/core";
import { StrandsAgent } from "@ag-ui/aws-strands";

import { createModel } from "./model";

/** The id the demo Code tab's `page.tsx` and runtime route both use. */
export const AGENT_CONFIG_AGENT_ID = "agent-config-demo";

// #region with-state-context — src/agent/state.ts, as published
export function withStateContext(inputData: RunAgentInput): RunAgentInput {
  const state =
    inputData.state && typeof inputData.state === "object"
      ? (inputData.state as Record<string, unknown>)
      : {};
  const context = [...inputData.context];
  // GAP: `formatPreferencesBlock` is not published anywhere in the Strands
  // TypeScript docs (page prose or demo Code tab). Commented out, not written.
  // const preferences = formatPreferencesBlock(state.preferences);
  // if (preferences) {
  //   context.push({
  //     description: "Current user preferences",
  //     value: preferences,
  //   });
  // }
  if ("todos" in state) {
    context.push({
      description: "Current sales pipeline",
      value: JSON.stringify(state.todos, null, 2),
    });
  }
  return { ...inputData, context };
}
// #endregion

// #region agent-config-context-registration — src/agent/agent.ts, as published
export class ShowcaseStrandsAgent extends StrandsAgent {
  override async *run(inputData: RunAgentInput) {
    // The adapter exposes context during model calls and restores history afterward.
    yield* super.run(withStateContext(inputData));
  }
}
// #endregion

export async function buildAgentConfigAgent(): Promise<StrandsAgent> {
  const agent = new Agent({
    model: createModel(),
    systemPrompt: "You are a helpful AI assistant.",
  });

  await agent.initialize();

  return new ShowcaseStrandsAgent({
    agent,
    name: AGENT_CONFIG_AGENT_ID,
    description:
      "Backs Agent Config. Receives the UI's typed config as run context; " +
      "the adapter shows it to the model per call.",
  });
}
