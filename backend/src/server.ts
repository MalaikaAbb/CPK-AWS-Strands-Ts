/**
 * One process, many agents.
 *
 * Every published example ends at `createStrandsApp(aguiAgent, { path: "/" })`
 * followed by `app.listen(8000)` — one app, one agent, one root. Nothing in the
 * Strands TypeScript tree documents serving a second agent from the same
 * process; the published `agent.ts` docstring says `server.ts` does it, and
 * `server.ts` is never shown.
 *
 * So the composition here is this repo's, and it is deliberately the thinnest
 * one that leaves the documented call untouched: build one
 * `createStrandsApp(...)` per registry entry exactly as published, then mount
 * each returned Express app under its id on an outer Express app. The AG-UI
 * root for agent `tool-rendering` is therefore `/tool-rendering/` — which is
 * why `frontend/src/lib/agents.ts` adds a trailing slash. The Voice doc page
 * writes its own `HttpAgent` URL the same way (`${AGENT_URL}/voice/`).
 *
 * Two endpoints beyond the agents:
 *   GET /health  — liveness plus the agent roster.
 *   GET /gaps    — the backend half of the doc-gap ledger, so it can be
 *                  diffed against `frontend/src/lib/doc-gaps.ts`.
 */

import express from "express";
import cors from "cors";
import { createStrandsApp } from "@ag-ui/aws-strands/server";

import { REGISTRY, UNSERVED } from "./agents/registry";
import { MODEL_ID } from "./agents/model";

const PORT = Number(process.env.PORT ?? 8000);

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[aws-strands-ts] OPENAI_API_KEY is not set. Agents will start but " +
        "every run will fail at the model call.",
    );
  }

  const app = express();
  app.use(cors({ origin: "*" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      modelId: MODEL_ID,
      agents: REGISTRY.map((e) => ({ id: e.id, path: e.mountPath })),
    });
  });

  app.get("/gaps", (_req, res) => {
    res.json({
      note: "What docs.copilotkit.ai/strands-typescript does not publish. Mirrors frontend/src/lib/doc-gaps.ts.",
      agents: REGISTRY.map((e) => ({ id: e.id, gaps: e.gaps })),
      unserved: UNSERVED,
    });
  });

  for (const entry of REGISTRY) {
    const aguiAgent = await entry.build();
    // The published call, untouched.
    const agentApp = await createStrandsApp(aguiAgent, { path: "/" });
    app.use(entry.mountPath, agentApp);
  }

  app.listen(PORT, () => {
    console.log(`Agent server listening on http://localhost:${PORT}`);
    console.log(`  model: ${MODEL_ID}`);
    console.log(`  agents: ${REGISTRY.length}`);
    for (const entry of REGISTRY) {
      console.log(`    ${entry.mountPath}/`);
    }
  });
}

main().catch((error) => {
  console.error("[aws-strands-ts] failed to start", error);
  process.exit(1);
});
