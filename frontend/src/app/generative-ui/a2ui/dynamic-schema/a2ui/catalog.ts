/**
 * The catalog, as published. This block the page does print in full.
 *
 * `createCatalog(definitions, renderers, { includeBasicCatalog: true })` merges
 * the eleven custom components with CopilotKit's built-ins, so the planner can
 * compose custom and basic components interchangeably.
 *
 * `catalogId` must equal `A2UI_DYNAMIC_CATALOG_ID` in
 * `backend/src/agents/a2ui-dynamic-agent.ts` — that is the id the adapter
 * stamps into every generated surface, and a mismatch renders nothing.
 */

import { createCatalog } from "@copilotkit/a2ui-renderer";

import { myDefinitions } from "./definitions";
import { myRenderers } from "./renderers";

export const myCatalog = createCatalog(myDefinitions, myRenderers, {
  catalogId: "declarative-gen-ui-catalog",
  includeBasicCatalog: true,
});
