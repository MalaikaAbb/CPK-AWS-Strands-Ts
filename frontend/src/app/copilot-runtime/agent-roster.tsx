"use client";

/**
 * Cross-checks the frontend's agent list against the server's.
 *
 * `lib/agents.ts` is a hand-maintained mirror of `REGISTRY` in
 * `backend/src/agents/registry.ts` — it has to be, because the runtime route
 * builds its `HttpAgent` map synchronously at module load and cannot await a
 * fetch. Two hand-maintained lists drift, so this component fetches
 * `GET /health` and reports the difference rather than letting a missing agent
 * show up as a mystery 404 on some unrelated route.
 */

import { useEffect, useState } from "react";

import { AGENT_IDS } from "@/lib/agents";

type Health = {
  status: string;
  modelId: string;
  agents: { id: string; path: string }[];
};

export function AgentRoster({ agentUrlBase }: { agentUrlBase: string }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${agentUrlBase}/health`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Health>;
      })
      .then((h) => !cancelled && setHealth(h))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [agentUrlBase]);

  if (error) {
    return (
      <p className="text-sm text-rose-700 dark:text-rose-300">
        Could not reach the agent server at{" "}
        <code>{agentUrlBase}</code> ({error}). Start it with{" "}
        <code>npm run dev</code> in <code>backend/</code>.
      </p>
    );
  }

  if (!health) {
    return <p className="text-sm text-slate-500">Checking the agent server…</p>;
  }

  const served = new Set(health.agents.map((a) => a.id));
  const known = new Set<string>(AGENT_IDS);
  const missingOnServer = [...known].filter((id) => !served.has(id));
  const missingInFrontend = health.agents
    .map((a) => a.id)
    .filter((id) => !known.has(id));
  const inSync = missingOnServer.length === 0 && missingInFrontend.length === 0;

  return (
    <div className="space-y-4 text-sm">
      <p className="text-slate-600 dark:text-slate-400">
        Server up · model <code>{health.modelId}</code> ·{" "}
        {health.agents.length} agents mounted
      </p>

      {inSync ? (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          Frontend and backend agent lists agree.
        </p>
      ) : (
        <div className="space-y-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {missingOnServer.length > 0 && (
            <p>
              In <code>lib/agents.ts</code> but not served:{" "}
              <code>{missingOnServer.join(", ")}</code>
            </p>
          )}
          {missingInFrontend.length > 0 && (
            <p>
              Served but missing from <code>lib/agents.ts</code>:{" "}
              <code>{missingInFrontend.join(", ")}</code>
            </p>
          )}
        </div>
      )}

      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {health.agents.map((a) => (
          <li key={a.id} className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {a.id}
            <span className="text-slate-400"> → {a.path}/</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
