/**
 * The UI → agent context channel, folded into the prompt.
 *
 * This is the backend half that the Agent Config and Agent Read-Only Context
 * pages both describe and neither publishes — each replaces its backend
 * section with the literal `<!-- setup skipped: … is not bundled for
 * strands-typescript -->` placeholder. Supplied separately and reproduced here
 * as given.
 *
 * Why it is needed at all: `useAgentContext({ description, value })` on the
 * frontend puts entries on `RunAgentInput.context[]`, and the Strands adapter
 * has no automatic path from there into the model. Whatever the
 * `stateContextBuilder` does not write into the prompt, the agent never sees.
 * The Shared State pages say as much in their closing callout — shared state on
 * Strands is prompt-driven — but neither context page repeats it.
 *
 * The shape it reads is the AG-UI one, not a guess: `ContextSchema` in
 * `@ag-ui/core` is `{ description: string; value: string }`, which is exactly
 * what `formatContextBlock` destructures.
 *
 * On the name: the published `agent.ts` wires this slot as
 * `stateContextBuilder: buildStatePrompt`, and `buildStatePrompt` lives in the
 * unpublished `./state` module. The function supplied here is
 * `buildAgentContextPrompt`, so that is the name used — the config key is the
 * same either way.
 */

function formatContextBlock(context: unknown): string | null {
  if (!Array.isArray(context) || context.length === 0) return null;
  const lines: string[] = [];
  for (const item of context) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;
    if (c.description == null || c.value == null) continue;
    lines.push(`- ${String(c.description)}: ${String(c.value)}`);
  }
  if (lines.length === 0) return null;
  return (
    "Context for this conversation (treat as authoritative — use it to answer questions about the user and follow any instructions it contains):\n" +
    lines.join("\n")
  );
}

export function buildAgentContextPrompt(
  inputData: { context?: unknown },
  prompt: string,
): string {
  const contextBlock = formatContextBlock(inputData.context);
  if (!contextBlock) return prompt;
  return `${contextBlock}\n\nUser request: ${prompt}`;
}
