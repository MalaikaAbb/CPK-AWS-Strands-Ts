import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PUBLISHED = `import {
  CopilotKitProvider,
  CopilotChatConfigurationProvider,
  CopilotChat,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

export default function Page() {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit" publicLicenseKey="ck_pub_...">
      <CopilotChatConfigurationProvider>
        <div style={{ display: "flex", height: "100dvh" }}>
          <CopilotThreadsDrawer />
          <CopilotChat />
        </div>
      </CopilotChatConfigurationProvider>
    </CopilotKitProvider>
  );
}`;

const SLOT = `<CopilotThreadsDrawer>
  <span slot="header">My conversations</span>
</CopilotThreadsDrawer>`;

const PROPS: [string, string][] = [
  ["agentId", "Agent whose threads to list. Defaults to the chat configuration's agent."],
  ["label", 'Accessible name for the drawer region and thread listbox. Defaults to "Threads".'],
  ["recentLabel", 'Section heading above the list. Defaults to "Recent Conversations".'],
  ["onThreadSelect", "Escape hatch to take over thread selection yourself."],
  ["onNewThread", 'Escape hatch to handle the "New Conversation" row yourself.'],
  ["renderRow", "Render custom content per row, keeping the row chrome around it."],
  ["limit", 'Page size. Shows a "Load more" control while more threads remain.'],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/copilot-threads-drawer" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A conversation sidebar with no active-thread state of your own. The
          load-bearing part is not the drawer — it is the{" "}
          <code>&lt;CopilotChatConfigurationProvider&gt;</code> wrapping both it
          and the chat. That shared configuration is what lets a row click
          connect the chat to that thread and replay its history, and what makes
          the &quot;New Conversation&quot; row reset to a fresh welcome screen.
          Take the provider away and the two components stop talking.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, press New Conversation, send another",
              "Click back to the first row",
            ]}
            expect="Two rows in the drawer, auto-named after the first message of each. Clicking a row replays that conversation into the chat."
            fail="A locked panel where the list should be — that is the no-licence state, not a bug. Set INTELLIGENCE_API_KEY and restart."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/copilot-threads-drawer/demo-chat/page.tsx" />
      </Panel>

      <Panel title="What the page publishes">
        <CodeBlock code={PUBLISHED} language="tsx" filename="app/page.tsx (as published)" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Reproduced structurally, with this harness&apos;s two usual
          departures: no nested <code>CopilotKitProvider</code> (the app has one
          at the root) and <code>agentId</code> named explicitly rather than
          inherited, because 25 agents share that provider.
        </p>
      </Panel>

      <Callout tone="warn" title="The customization example does not typecheck">
        <p className="mb-3">
          The Customization section lists slots — <code>header</code>,{" "}
          <code>empty</code>, <code>footer</code>, <code>memories</code>,{" "}
          <code>launcher-icon</code> — and shows this:
        </p>
        <CodeBlock code={SLOT} language="tsx" />
        <p className="mt-3">
          Against <code>@copilotkit/react-core@1.69.0</code> that is a type
          error: <em>Property &apos;children&apos; does not exist on type
          &apos;IntrinsicAttributes &amp; CopilotThreadsDrawerProps&apos;</em>.
          The interface declares eleven members — <code>agentId</code>,{" "}
          <code>onThreadSelect</code>, <code>onNewThread</code>,{" "}
          <code>onLicensed</code>, <code>licenseUrl</code>,{" "}
          <code>renderRow</code>, <code>label</code>, <code>recentLabel</code>,{" "}
          <code>limit</code>, <code>collapsible</code>,{" "}
          <code>onCollapseChange</code> — and <code>children</code> is not among
          them.
        </p>
        <p className="mt-3">
          The underlying <code>copilotkit-threads-drawer</code> web component
          genuinely does accept slotted light-DOM children; it is the React
          wrapper&apos;s typing that does not expose them. So the feature is
          probably real and the published example is unusable as written. This
          route omits it rather than casting around the error.
        </p>
      </Callout>

      <Panel title="The props the page documents">
        <dl className="space-y-2 text-sm">
          {PROPS.map(([name, desc]) => (
            <div key={name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-36 dark:text-slate-100">
                {name}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Two more exist on the type and appear in no table:{" "}
          <code>collapsible</code> and <code>onCollapseChange</code>.
        </p>
      </Panel>

      <Callout tone="warn" title="Two licence paths on adjacent pages">
        <p>
          This page puts the key on the client —{" "}
          <code>publicLicenseKey=&quot;ck_pub_…&quot;</code> on the provider.
          The Quickstart and Headless Threads put it on the server —{" "}
          <code>intelligence: new CopilotKitIntelligence({"{ apiKey }"})</code>{" "}
          reading <code>INTELLIGENCE_API_KEY</code>, which Headless Threads is
          explicit must stay server-side. Both props exist; nothing on either
          page explains when to use which, or whether they are alternatives or
          complements. This harness uses the server path for all three runtimes.
        </p>
      </Callout>

      <Callout tone="info" title="Rename is not in this drawer">
        <p>
          The page says so plainly: the row menu covers archive/unarchive and
          delete, and rename is a headless action. If you need it, that is the{" "}
          <a
            href="/headless-threads"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Headless Threads
          </a>{" "}
          route, where <code>renameThread</code> is wired.
        </p>
      </Callout>
    </>
  );
}
