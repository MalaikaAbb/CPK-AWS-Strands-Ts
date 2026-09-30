# QA Report — AWS Strands TS · Generative UI · JSON Render

Four issues, one report each. Where a line says *(to confirm in browser)*, the
behaviour is predicted from the library source and has not yet been observed
running. Type-check results were observed with `npx tsc --noEmit`.

---

**Area / surface:** AWS Strands TS - Generative UI - JSON Render (`<Renderer>` call)

- **Problem:** The dashboard never renders. The doc's renderer calls `<Renderer spec={spec} catalog={catalog} />`, but `@json-render/react` has no `catalog` prop and needs `<JSONUIProvider>` around it. The snippet fails type-check, and throws at runtime once a spec arrives.
- **Observed:** After setting up the project with the doc's `page.tsx`, `json-render-renderer.tsx` and `registry.tsx` copied as published (plus the missing code from the second report, so it could compile), the following was observed.
1. `npx tsc --noEmit` was run on the frontend, and the renderer line failed:

```jsx
json-render-renderer.tsx(28,32): error TS2322: Type '{ spec: Spec; catalog: { MetricCard: {...}; BarChart: {...}; PieChart: {...} } }'
is not assignable to type 'IntrinsicAttributes & RendererProps'.
  Property 'catalog' does not exist on type 'IntrinsicAttributes & RendererProps'.
```

2. With a `@ts-expect-error` above the line so the build passes, the agent was prompted 'Show me a sales dashboard.'
3. Once a valid root element streams in, the renderer throws *(to confirm in browser)*:

```jsx
Error: useVisibility must be used within a VisibilityProvider
```

4. If the provider were present, the next failure would be `registry` being `undefined`, because the renderer looks up `registry[element.type]`.

- **Expected / impact:** The expectation is that the agent's `{ root, elements }` reply renders as a dashboard of metric cards and charts. Instead the chat crashes on the first dashboard reply. This is a blocker: the page's central code can't be used as written.

- **Likely cause / fix direction:**
1. The snippet targets a different JSON Render API. In `@json-render/react` 0.21.0, `<Renderer>` takes `registry`, a map of type name → component receiving `{ element, children }`. It can be built from the doc's own catalog:

```jsx
const registry: ComponentRegistry = {
  ...Object.fromEntries(
    Object.entries(catalog).map(([type, entry]) => {
      const Component = entry.component as unknown as ComponentType<Record<string, unknown>>;
      const Rendered: ComponentRegistry[string] = ({ element }) => (
        <Component {...element.props} />
      );
      Rendered.displayName = `JsonRender(${type})`;
      return [type, Rendered];
    }),
  ),
  Stack: ({ children }) => <div className="space-y-3">{children}</div>,
};
```

2. Wrap the renderer in its provider:

```jsx
<JSONUIProvider registry={registry}>
  <Renderer spec={spec} registry={registry} />
</JSONUIProvider>
```

3. Applied in `frontend/src/app/generative-ui/json-render/json-render-fixed.tsx` (the demo's **fixed** mode). It type-checks with no suppression; browser verification is pending. Please update the doc snippet, and state the `@json-render/react` version it targets.

- **Tested context:**

Docs URL: AWS Strands TS - Generative UI - JSON Render (https://docs.copilotkit.ai/strands-typescript/generative-ui/json-render)

Framework: AWS Strands TS

OS: Ubuntu 24.04.4 LTS

Package Manager and versions: npm 12.0.1, Node v24.16.0

```json
BACKEND
    "@ag-ui/a2ui-toolkit": "^0.0.4",
    "@ag-ui/aws-strands": "^0.3.0",
    "@strands-agents/sdk": "^1.19.0",

FRONTEND
    "@ag-ui/client": "^0.0.59",
    "@ag-ui/core": "^0.0.59",
    "@copilotkit/a2ui-renderer": "^1.74.0",
    "@copilotkit/react-core": "^1.74.0",
    "@copilotkit/runtime": "^1.74.0",
    "@json-render/react": "^0.21.0",
    "next": "16.3.4",
    "react": "19.2.8",
    "zod": "^3.25.76",
```

- **Loom Video:** *[add link]*

---

**Area / surface:** AWS Strands TS - Generative UI - JSON Render (unpublished code)

- **Problem:** The example can't be assembled from the page. Several things the published code calls, imports or points at are never shown.
- **Observed:** After copying every code block on the page into the project, the following was observed.
1. `parseSpec` calls `stripCodeFencesAndPrelude`, `tolerantJsonParse` and `validateAgainstCatalog`. None of them is defined on the page.
2. The renderer uses the `AssistantMessage` type but never imports it.
3. `registry.tsx` imports `MetricCard`, `BarChart` and `PieChart` from `./metric-card`, `./charts/bar-chart` and `./charts/pie-chart`. None of these files is published.
4. The page's example agent output uses a `Stack` element, which the catalog does not register, so the example can't be validated against its own catalog:

```jsx
"dashboard": {
  "type": "Stack",
  "children": ["revenue-card", "by-region"]
}
```

5. The frontend points at `runtimeUrl="/api/copilotkit-byoc-json-render"`, which the page never shows.
6. The published `agent.ts` (printed on another page) includes `buildByocJsonRenderAgent`, but imports its system prompt from an unpublished module:

```jsx
systemPrompt: BYOC_JSON_RENDER_SYSTEM_PROMPT,   // from "./prompts" — never published
```

- **Expected / impact:** The expectation is that a reader can build a working example from the page. Currently they have to write the parse and validation helpers, the chart components, the runtime route and the agent prompt themselves: most of the working code. This is a major issue: the page reads as complete but can't be run.

- **Likely cause / fix direction:**
1. The snippets appear to be excerpts from a larger demo app, published without their dependencies.
2. The harness wrote the missing pieces and labelled them as not from the docs:
   - `spec-helpers.ts`: the three helpers
   - `components/byoc-dashboard.tsx`: the three components, re-exported at the doc's import paths
   - `app/api/copilotkit-byoc-json-render/[[...slug]]/route.ts`: the runtime route
   - `backend/src/agents/byoc-json-render-agent.ts`: the published factory, verbatim, with a harness-written prompt
3. Please publish these (or link the full example source), add `Stack` to the catalog, and publish `BYOC_JSON_RENDER_SYSTEM_PROMPT`.

- **Tested context:** Same as the first report.

- **Loom Video:** *[add link]*

---

**Area / surface:** AWS Strands TS - Generative UI - JSON Render (`messageView.assistantMessage` slot)

- **Problem:** The doc passes a plain component as `messageView.assistantMessage`, but CopilotKit types that slot as `typeof CopilotChatAssistantMessage`, including its static sub-components. The documented line fails type-check.
- **Observed:** After copying the doc's `page.tsx` as published, the following was observed.
1. The published line is:

```jsx
<CopilotChat messageView={{ assistantMessage: JsonRenderAssistantMessage }} />
```

2. `npx tsc --noEmit` was run on `@copilotkit/react-core` 1.74.0:

```jsx
byoc-json-render-demo.tsx(21,24): error TS2322: Type '({ message }: { message: {...} }) => Element | null'
is not assignable to type 'SlotValue<typeof CopilotChatAssistantMessage>'.
  ... is missing the following properties from type 'typeof CopilotChatAssistantMessage': MarkdownRenderer, Toolbar, ...
```

3. `next dev` doesn't type-check, so this only shows at `next build`.
4. A related trap: the two message slots pass different props. `assistantMessage.markdownRenderer` receives `{ content }`. `assistantMessage` receives `{ message, messages, isRunning, … }` and no `content`. A component written for one and plugged into the other gets `undefined`, and fails *(to confirm in browser)* with:

```jsx
TypeError: Cannot read properties of undefined (reading 'match')
```

- **Expected / impact:** The expectation is that a custom component can be used as the slot value, as the doc shows. Currently `next build` fails for anyone who copies the snippet. This is a major issue for deployment.

- **Likely cause / fix direction:**
1. The slot's type demands the default component's full static shape. Widening it in `@copilotkit/react-core` to accept any `ComponentType<CopilotChatAssistantMessageProps>` would fix the doc as written.
2. Until then, use the `markdownRenderer` sub-slot. It accepts a plain `({ content })` component, type-checks, and keeps the message's toolbar and tool-call view:

```jsx
messageView={{ assistantMessage: { markdownRenderer: JsonRenderMarkdown } }}
```

3. If replacing the whole message is intended, read `props.message.content`, fall back to `<CopilotChatAssistantMessage {...props} />` for non-spec replies, and cast with `as unknown as typeof CopilotChatAssistantMessage`. Please mention that this removes the toolbar and tool-call view.
4. The harness's fixed mode uses option 2.

- **Tested context:** Same as the first report.

- **Loom Video:** *[add link]*

---

**Area / surface:** AWS Strands TS - Generative UI - JSON Render (suggestions)

- **Problem:** The page's two suggestions ("Sales dashboard", "Region breakdown") never appear in its chat.
- **Observed:** After copying the doc's `page.tsx` as published, the following was observed.
1. The component calls `useConfigureSuggestions(...)`, then renders its own provider:

```jsx
export default function ByocJsonRenderDemo() {
  useConfigureSuggestions({ suggestions: [...], available: "always" });
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-byoc-json-render" agent="byoc_json_render">
      <CopilotChat ... />
    </CopilotKit>
  );
}
```

2. The hook runs outside that `<CopilotKit>`, so the suggestions register on the app's root provider and the page's chat shows no suggestion pills *(to confirm in browser)*. In an app with no outer provider, the hook has no provider at all.
3. Nothing errors, so it goes unnoticed.

- **Expected / impact:** The expectation is that the two documented suggestions show above the chat input. Currently they are silently lost. This is minor, but the snippet is misleading.

- **Likely cause / fix direction:**
1. Move the hook into a child rendered inside `<CopilotKit>`:

```jsx
function Chat() {
  useConfigureSuggestions({ suggestions: [...], available: "always" });
  return <CopilotChat messageView={...} />;
}

export default function Demo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-byoc-json-render" agent="byoc_json_render">
      <Chat />
    </CopilotKit>
  );
}
```

2. Applied in the harness's fixed mode; browser verification is pending. Please update the doc snippet.

- **Tested context:** Same as the first report.

- **Loom Video:** *[add link]*
