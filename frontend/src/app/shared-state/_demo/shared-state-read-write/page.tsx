"use client";

// The page prints two fragments of this file (the `useAgent` read and the
// `handlePreferencesChange` write), verbatim below. Everything around them is
// harness glue, not from the doc page: the provider and chat, the
// `Preferences` / `RWAgentState` types the fragments name, the `notes` value
// they read, and mounting the printed `NotesCard`. The page prints no
// preferences UI, so nothing calls `handlePreferencesChange`, and no Strands
// backend (setup skipped), so nothing writes `notes`. The agent behind
// `shared-state-read-write` is this repo's state-mirror agent (it already
// backs /shared-state/rendering-in-app); it has no `set_notes` tool.

import {
  CopilotChat,
  CopilotKit,
  useAgent,
  UseAgentUpdate,
} from "@copilotkit/react-core/v2";

import { NotesCard } from "./notes-card";

// Harness glue: types the printed fragments name but the page never defines.
interface Preferences {
  name: string;
  tone: "formal" | "casual" | "playful";
  language: string;
  interests: string[];
}

interface RWAgentState {
  preferences: Preferences;
  notes: string[];
}

export default function SharedStateReadWriteDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="shared-state-read-write">
      <div className="flex h-full">
        <div className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 p-4 dark:border-slate-800">
          <DemoContent />
        </div>
        <div className="min-w-0 flex-1">
          <CopilotChat agentId="shared-state-read-write" className="h-full" />
        </div>
      </div>
    </CopilotKit>
  );
}

function DemoContent() {
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state (e.g. via its `set_notes` tool) this hook fires,
  // we re-render, and the sidebar panels reflect the new values.
  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  // Harness glue: the value the fragments read.
  const notes = (agent.state as RWAgentState | undefined)?.notes ?? [];

  // WRITE: every edit in the sidebar goes straight into agent state.
  // On the agent's next turn, `PreferencesInjectorMiddleware` reads this
  // back out of state and adds it to the system prompt — so the UI's
  // writes visibly steer the model.
  const handlePreferencesChange = (next: Preferences) => {
    agent.setState({
      preferences: next,
      notes, // preserve what the agent has written
    } as RWAgentState);
  };
  void handlePreferencesChange; // nothing on the page calls it

  // Harness glue: the page prints no clear handler, so Clear does nothing.
  return <NotesCard notes={notes} onClear={() => {}} />;
}
