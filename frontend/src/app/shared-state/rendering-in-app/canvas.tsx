"use client";

/**
 * `components/Canvas.tsx`, reproduced exactly as the doc page prints it —
 * imports, `CanvasState` type, and the `useAgent()` call with no `agentId`,
 * which the page's own comment explains ("No agentId means the 'default'
 * agent").
 *
 * That default is worth noticing. No Strands page ever registers an agent
 * literally named `default`, so the code as printed targets nothing. The demo
 * route passes an `agentId` for that reason and says so.
 */

import { useAgent } from "@copilotkit/react-core/v2";

type CanvasState = {
  title: string;
  items: { id: string; label: string; done: boolean }[];
};

export function Canvas({ agentId }: { agentId?: string }) {
  // No agentId means the "default" agent. Pass { agentId } to target another.
  const { agent } = useAgent({ agentId });
  const state = (agent.state ?? {}) as Partial<CanvasState>;

  // The page's "Writing back from the main view" snippet.
  //
  // One annotation added: the printed version is `(agent.state?.items ?? [])
  // .map((it) => …)`, and `agent.state` is untyped because `useAgent` takes no
  // type parameter — so `it` is an implicit `any` and the snippet does not
  // compile under `strict`. The cast below is the smallest fix that keeps the
  // body identical.
  function toggleItem(id: string) {
    const current = (agent.state ?? {}) as Partial<CanvasState>;
    agent.setState({
      ...agent.state,
      items: (current.items ?? []).map((it) =>
        it.id === id ? { ...it, done: !it.done } : it,
      ),
    });
  }

  return (
    <main className="canvas h-full overflow-y-auto p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {state.title ?? "Untitled"}
      </h1>
      <ul className="mt-4 space-y-1.5">
        {(state.items ?? []).map((item) => (
          <li key={item.id} data-done={item.done}>
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`text-left text-sm ${
                item.done
                  ? "text-slate-400 line-through"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      {(state.items ?? []).length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          Nothing on the canvas yet. Use the buttons above to write state, then
          ask the chat what it can see.
        </p>
      )}
    </main>
  );
}
