import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// The overview's React snippets, verbatim from the rendered page (2026-11-11).
// The runtime block is shown, not run: it builds a TanStack BuiltInAgent, and
// this harness runs its own Strands agent instead (see the callout).
const INSTALL = `npm install @copilotkit/react-core @copilotkit/runtime @tanstack/ai @tanstack/ai-openai`;

const ROUTE = `import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import {
  BuiltInAgent,
  convertInputToTanStackAI,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  type: "tanstack",
  factory: ({ input, abortController }) => {
    const { messages, systemPrompts, tools } = convertInputToTanStackAI(input);
    return chat({
      adapter: openaiText("gpt-6-luna"),
      messages,
      systemPrompts: [
        "You are a helpful assistant. When a visual answer helps, render it with generative UI.",
        ...systemPrompts,
      ],
      tools,
      abortController,
    });
  },
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit" });

export const GET = handler;
export const POST = handler;`;

const PROVIDERS = `"use client";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import "@copilotkit/react-core/v2/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit" generativeUI={{ ui: standardUI }}>
      {children}
    </CopilotKitProvider>
  );
}`;

const PAGE = `"use client";
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function Page() {
  return <CopilotChat />;
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The entry point to Components and surfaces: give the provider a
          catalog (here the 69-component <code>standardUI</code>) and the
          runtime hands each run a <code>render_ui</code> tool plus a guide to
          the catalog. The agent then answers with real components that fill
          in as it writes, and a follow-up edits them in place. The agent only
          has to pass the run&apos;s tools and context through to its model.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Compare the Starter, Team, and Enterprise plans in a table",
              "Add a column for support",
            ]}
            expect="A table component renders in the reply and fills in while the agent writes. The follow-up changes the same table instead of drawing a new one."
            fail="A markdown table or plain text: render_ui or the guide did not reach the model. Check the Inspector's Generative UI → Prompt tab."
          />
        </div>
      </Panel>

      <Panel title="The page's code">
        <div className="space-y-4">
          <CodeBlock code={INSTALL} language="bash" filename="Install" />
          <CodeBlock code={ROUTE} language="ts" filename="app/api/copilotkit/[[...slug]]/route.ts (shown, not run)" />
          <CodeBlock code={PROVIDERS} language="tsx" filename="app/providers.tsx" />
          <CodeBlock code={PAGE} language="tsx" filename="app/page.tsx" />
        </div>
      </Panel>

      <Panel title="What runs here">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/components/demo-chat/page.tsx" },
            { file: "frontend/src/app/api/copilotkit-genui/[[...slug]]/route.ts" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Swapped: the page's agent is TanStack, this one is Strands">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            The page builds a TanStack <code>BuiltInAgent</code> factory with{" "}
            <code>openaiText(&quot;gpt-6-luna&quot;)</code>. This harness runs
            its own Strands agent, <code>genui-overview</code>, with the
            factory&apos;s prompt verbatim and no tools of its own. The adapter
            passes the run&apos;s <code>render_ui</code> and context entries to
            the model, which is the job <code>convertInputToTanStackAI</code>{" "}
            does on the page. It runs on <code>MODEL_ID</code> (default{" "}
            <code>gpt-4o</code>), not <code>gpt-6-luna</code>.
          </li>
          <li>
            The provider config is the page&apos;s (<code>generativeUI=&#123;&#123; ui: standardUI &#125;&#125;</code>),
            mounted through the shared Components demo harness on{" "}
            <code>/api/copilotkit-genui</code> rather than as the app&apos;s root
            provider.
          </li>
          <li>
            The other Components routes use the <code>genui</code> agent, which
            adds a repo-authored <code>search_products</code>. This overview
            uses an agent without it. See{" "}
            <Link className="underline" href="/generative-ui/components/catalogs">
              Catalogs
            </Link>
            .
          </li>
        </ul>
      </Callout>
    </>
  );
}
