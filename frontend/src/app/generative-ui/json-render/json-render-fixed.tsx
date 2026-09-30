/**
 * Harness-authored: a working version of the page, for comparison with the
 * published one (./byoc-json-render-demo.tsx + ./json-render-renderer.tsx,
 * which are left as published and throw).
 *
 * Four changes, each fixing one thing the published code gets wrong:
 *
 * 1. `registry`, not `catalog`. @json-render/react 0.21 renders through a map
 *    of type name → component receiving `{ element, children }`. It is built
 *    here from the page's own catalog, so the components and Zod schemas are
 *    still the page's. `Stack`, which the page's example output uses but its
 *    catalog omits, is added as a plain container.
 * 2. `<JSONUIProvider>` around `<Renderer>`. The renderer reads visibility,
 *    action and state contexts, and throws without them.
 * 3. The `markdownRenderer` sub-slot instead of replacing the whole
 *    `assistantMessage`. A component passed there receives the raw `content`;
 *    it type-checks without a cast and keeps the message's toolbar and
 *    tool-call view. (Replacing the whole `assistantMessage` also works, but
 *    needs `props.message.content`, a fallback for prose replies, and an
 *    `as unknown as typeof CopilotChatAssistantMessage` cast — see
 *    JSON_RENDERER_FIX.md at the repo root.)
 * 4. `useConfigureSuggestions` inside `<CopilotKit>`. The page calls it
 *    outside, so its suggestions go to a different provider.
 *
 * Parsing and validation reuse ./spec-helpers.ts unchanged.
 */

import {
  CopilotChat,
  CopilotKit,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import {
  JSONUIProvider,
  Renderer,
  type ComponentRegistry,
} from "@json-render/react";
import type { ComponentType } from "react";

import { catalog } from "./registry";
import {
  stripCodeFencesAndPrelude,
  tolerantJsonParse,
  validateAgainstCatalog,
} from "./spec-helpers";

// Fix 1 — a registry built from the page's catalog.
const registry: ComponentRegistry = {
  ...Object.fromEntries(
    Object.entries(catalog).map(([type, entry]) => {
      // Props were already checked against entry.propsSchema by
      // validateAgainstCatalog, so they can be passed through as-is.
      const Component = entry.component as unknown as ComponentType<
        Record<string, unknown>
      >;
      const Rendered: ComponentRegistry[string] = ({ element }) => (
        <Component {...element.props} />
      );
      Rendered.displayName = `JsonRender(${type})`;
      return [type, Rendered];
    }),
  ),
  Stack: ({ children }) => <div className="space-y-3">{children}</div>,
};

// Fixes 2 and 3 — a markdownRenderer that draws the spec inside the providers.
function JsonRenderMarkdown({ content }: { content: string }) {
  const spec = validateAgainstCatalog(
    tolerantJsonParse(stripCodeFencesAndPrelude(content)),
  );
  if (!spec) return null;
  return (
    <JSONUIProvider registry={registry}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}

// Fix 4 — suggestions registered on the provider the chat actually uses.
function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Sales dashboard", message: "Show me a sales dashboard." },
      { title: "Region breakdown", message: "Break down sales by region." },
    ],
    available: "always",
  });

  return (
    <CopilotChat
      className="h-full"
      messageView={{ assistantMessage: { markdownRenderer: JsonRenderMarkdown } }}
    />
  );
}

export default function ByocJsonRenderFixedDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-byoc-json-render" agent="byoc_json_render">
      <Chat />
    </CopilotKit>
  );
}
