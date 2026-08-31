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
import { useEffect } from "react";
type CanvasState = {
  title: string;
  items: { id: string; label: string; done: boolean }[];
};
const INITIAL_CANVAS_STATE: CanvasState = {
  title: "Project launch",
  items: [
    { id: "research", label: "Research user needs", done: true },
    { id: "prototype", label: "Build a prototype", done: false },
  ],
};

const AGENT_ID = "shared-state-read-write";

export function Canvas() {
  // No agentId means the "default" agent. Pass { agentId } to target another.
  const { agent, isReady } = useAgent({agentId: AGENT_ID});
  const state = (agent.state ?? {}) as Partial<CanvasState>;
  
  useEffect(() => {
    if (!isReady) return;
    const current = (agent.state ?? {}) as Partial<CanvasState>;
    const updates: Partial<CanvasState> = {};
    if (current.title === undefined) {
      updates.title = INITIAL_CANVAS_STATE.title;
    }
    if (current.items === undefined) {
      updates.items = INITIAL_CANVAS_STATE.items;
    }
    if (Object.keys(updates).length > 0) {
      agent.setState({ ...(agent.state ?? {}), ...updates });
    }
  }, [agent, isReady, state.title, state.items]);

  function toggleItem(id: string) {
    // One annotation added: `agent.state` is untyped because `useAgent` takes
    // no type parameter, so the printed `(it) =>` is an implicit `any` and the
    // snippet does not compile under `strict`. The cast is the smallest fix
    // that leaves the body identical.
    const current = (agent.state ?? {}) as Partial<CanvasState>;
    agent.setState({
      ...agent.state,
      items: (current.items ?? []).map((it) =>
        it.id === id ? { ...it, done: !it.done } : it,
      ),
    });
}


  return (
    <main className="canvas">
      <h1>{state.title ?? "Untitled"}</h1>
      <ul>
        {(state.items ?? []).map((item) => (
          <li key={item.id} data-done={item.done} onClick={()=> toggleItem(item.id)} className={item.done ? "line-through" : ""}>
            {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
