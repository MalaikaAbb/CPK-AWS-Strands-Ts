import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/agent-readonly" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A one-way UI → agent channel. Each{" "}
          <code>useAgentContext({"{ description, value }"})</code> registers a
          context entry that refreshes whenever <code>value</code> changes and
          unregisters when the component unmounts. The agent reads it on every
          turn and has no setter and no tool to write it back — the page&apos;s
          own framing is &quot;props for the agent&quot;. The{" "}
          <code>description</code> is not decorative: it is the label the model
          sees next to the value, so treat it like a parameter docstring.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What do you know about me?",
              "Change the display name, then ask again: what is my name?",
              "What have I been doing in the app?",
            ]}
            expect="The agent names the current display name and timezone and lists exactly the checked activities. Edit a field and the next answer changes."
            fail="The agent says it has no information about you. The context entries are not reaching the model."
          />
        </div>
      </Panel>

      <Panel
        title="The demo and its layout"
        description="The hook calls and state initialisers are the doc's. DemoLayout and ACTIVITIES are imported by it and published nowhere."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx" },
            { file: "frontend/src/app/shared-state/agent-readonly/demo-layout.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="The page credits middleware that does not exist here">
        <p className="mb-2">
          It says the entries are &quot;surfaced to the agent via the
          backend&apos;s <code>CopilotKitMiddleware</code>, which threads the
          entries into the model&apos;s message history on every turn&quot;.{" "}
          <code>@ag-ui/aws-strands</code> ships no such middleware. What it
          actually does:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Flattens <code>RunAgentInput.context[]</code> into a plain{" "}
            <code>Record&lt;string, string&gt;</code> keyed by{" "}
            <code>description</code> — later entries overwrite earlier ones, and{" "}
            <code>__proto__</code> / <code>constructor</code> /{" "}
            <code>prototype</code> are dropped.
          </li>
          <li>
            Hands that record to your <code>stateContextBuilder</code> as its
            third <code>extras</code> argument, alongside{" "}
            <code>forwardedProps</code>.
          </li>
        </ul>
        <p className="mt-2">
          Neither the third argument nor the flattening is mentioned on any doc
          page, and this page&apos;s backend section is the{" "}
          <code>setup skipped</code> placeholder. Context does reach the model —
          just not by the route the page describes.
        </p>
      </Callout>

      <Callout tone="info" title="When to reach for this instead of shared state">
        <p>
          Use <code>useAgentContext</code> when the value is UI-owned and the
          agent has no business changing it: identity, feature flags, the
          selected record, the current route. Use{" "}
          <a
            href="/shared-state/in-app-agent-write"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </a>{" "}
          when both sides need to write.
        </p>
      </Callout>
    </>
  );
}
