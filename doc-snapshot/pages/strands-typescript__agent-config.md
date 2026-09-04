# Agent Config

> Forward typed configuration from your UI into the agent's reasoning loop.


<!-- interactive demo: agent-config -->


You have a working agent and want the user to be able to tune how it behaves: tone, expertise level, response length, language, persona. By the end of this guide, your UI will own a typed config object that the agent reads on every run and rebuilds its system prompt from.

## When to use this

Reach for agent config whenever the agent's behaviour depends on user-controllable settings that don't fit naturally as chat input:

- **Tone, voice, persona**: "playful", "formal", "casual"
- **Expertise level**: "beginner", "intermediate", "expert"
- **Response shape**: short / medium / long, structured / prose, language
- **Domain switches**: which knowledge base to consult, which tool subset to enable

If the values are a *channel* the user occasionally tunes (a settings panel, a toolbar of selects), agent config is the right shape. If the values are *content* the agent should write back to (notes, a document, a plan), use [Shared State](/strands-typescript/shared-state) instead.

How agent config flows from the UI into the agent's reasoning loop depends on your runtime architecture. Agents living behind a runtime read it from agent state on every run, while in-process agents receive the same object as forwarded properties on the provider — same UX, slightly different wiring on each side.



## How it works

<Steps>
  <Step>
    ### Turn frontend context into model input

    `useAgentContext` adds the typed configuration to the current AG-UI run.
    The Strands adapter does not add arbitrary context to the model prompt, so
    format the current run's context. This showcase composes the helper into
    its shared `stateContextBuilder`:

    
~~~~typescript title="src/agent/state.ts"
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
~~~~


  </Step>
  <Step>
    ### Register the context builder

    Add the builder to your `StrandsAgentConfig`. It runs again for every
    request, so a changed frontend configuration applies to the next turn.

    
~~~~typescript title="src/agent/agent.ts"
    stateContextBuilder: buildStatePrompt,
~~~~


  </Step>
</Steps>

Agent config is a typed object the frontend owns and publishes to the agent as
runtime context. The backend reads that context entry and turns it into a
system prompt.


Hold the typed config in React state, then mirror every change into the agent
through `useAgentContext`:

```tsx title="frontend/src/app/page.tsx — UI publishes the typed config"
function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}
```




The framework setup above shows the exact backend bridge for the selected
agent. In every framework, the flow is the same: read the latest valid context
from the current run and use it to build the system prompt for that turn.

```text title="Backend flow"
config = latestValidConfig(currentRun.context)
systemPrompt = buildSystemPrompt(config)
model.invoke(systemPrompt, currentUserRequest)
```

The agent reads the latest typed config at the start of every turn, rebuilds the system prompt, runs the turn. This is the same shape as the [shared-state write-side pattern](/strands-typescript/shared-state#writing-to-agent-state); agent config is just a specific use of that pattern with a UI-owned typed object on top.





<IntegrationGrid path="agent-config" />
