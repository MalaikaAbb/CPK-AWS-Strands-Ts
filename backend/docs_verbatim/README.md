# What the docs actually publish for the Strands TypeScript backend

`agent_ts_published.ts` in this directory is `src/agent/agent.ts` exactly as
`docs.copilotkit.ai/strands-typescript` renders it, captured on the doc-sync
date in `frontend/src/lib/nav-config.ts`. It is **never imported and never
executed** — it does not compile. It is here so the claims below can be checked
against the artifact rather than taken on trust.

## How it was captured

The doc pages carry an interactive demo widget with a tabbed source viewer.
Only the *first* tab of each tab group is server-rendered into the HTML; the
rest render client-side and are absent from the payload. On every page that
carries the widget, the first tab is `src/agent/agent.ts`.

Eighteen pages publish it. All eighteen copies are byte-identical
(`md5 debabacba78ca2705b153fd0c82ea239`), so this is one file, not eighteen
variants.

The markdown export (`<page>.md`) omits the demo widget entirely, so the file
does not appear there at all.

## The headline finding

**Unlike the Python docs, this file is complete.** It opens with its own
docstring and closes with the final brace of `buildA2uiRecoveryAgent`. Nothing
is truncated. Every function it defines, it defines in full.

**And it still cannot run**, because five things it depends on are published
nowhere:

| Missing | Referenced at | What it supplies |
| --- | --- | --- |
| `./model-factory` (`createModel`) | 6 call sites | Every agent's model. Called bare and as `createModel({ openaiApi: "chat" })`. |
| `./tools` (`SHOWCASE_TOOLS`) | `buildShowcaseAgent` | The entire tool list for the main agent. |
| `./state` (`buildStatePrompt`, `salesStateFromArgs`, `notesStateFromArgs`, `stepsStateFromArgs`, `documentStateFromArgs`, `makeSubagentStateFromResult`) | `buildShowcaseAgent` config | Shared-state projection for all six state-bearing demos. |
| `./prompts` (`SYSTEM_PROMPT`, `VOICE_SYSTEM_PROMPT`, `BYOC_HASHBROWN_SYSTEM_PROMPT`, `BYOC_JSON_RENDER_SYSTEM_PROMPT`) | 4 agents | Every system prompt except the two A2UI ones. |
| `./a2ui_schemas/flight_schema.json` | `FLIGHT_SCHEMA` | The pre-authored A2UI component tree for the fixed-schema demo. |

`server.ts` is named in the file's own docstring ("mounted on dedicated
sub-paths by `server.ts`") and is likewise never published, so nothing shows how
more than one agent is served from one process.

Grepping all 27 captured pages for a definition of any of those symbols returns
nothing. `SHOWCASE_TOOLS` appears exactly three times across the whole doc tree,
and all three are the same `import` line in three copies of this file.

## What that leaves

Two of the seven factories in the file depend on **nothing unpublished except
`createModel`**:

- `buildA2uiDynamicAgent` — its catalog id, composition guide and system prompt
  are all defined inline in this same file.
- `buildA2uiRecoveryAgent` — identical, minus the recovery demo's fixtures.

`buildA2uiFixedSchemaAgent` is published in full including its `display_flight`
tool body, and is blocked only by `flight_schema.json`.

The other four (`buildShowcaseAgent`, `buildVoiceAgent`,
`buildByocHashbrownAgent`, `buildByocJsonRenderAgent`) each depend on at least
one unpublished prompt constant, and `buildShowcaseAgent` additionally on the
tool list and the whole state module.

## What this repo runs instead

`backend/src/` does not reconstruct any of the above. It is built only from code
the docs do publish end to end:

- the Quickstart's TypeScript `main.ts` (model → `Agent` → `StrandsAgent` →
  `createStrandsApp`), and
- the Shared State pages' `agent/main.ts` (the same, plus a
  `StrandsAgentConfig` carrying a `stateContextBuilder`).

Every agent in `backend/src/agents/` is therefore **tool-free**, because no page
in the Strands TypeScript tree ever passes a populated `tools=` to a Strands
`Agent`. Where a route needs a backend tool to work, that route is marked Broken
and the reason is named on the page.

Frontend tools are the exception, and not because a doc page says so: the
adapter ships `createProxyTool` / `syncProxyTools` (see
`@ag-ui/aws-strands@0.2.3` `dist/index.d.ts`) and registers CopilotKit's
forwarded tools onto the Strands tool registry automatically. No doc page
mentions this — every page that would is a `setup skipped` placeholder — but it
is what makes the frontend-tool routes in this repo work.

## Cross-framework debris in the published file

Worth flagging because it is visible in the artifact:

- L146 points at `src/agents/a2ui_fixed.py`, a **Python** path, from a
  TypeScript file.
- L273 — "Mirrors the langgraph-python demo's a2ui_dynamic.py SYSTEM_PROMPT."
- L329–331 describe what "the langgraph/ADK siblings" do differently.
- L323–328 reference "aimock fixtures" and "heal / exhaust pills" — an internal
  test harness that appears in no public package.
