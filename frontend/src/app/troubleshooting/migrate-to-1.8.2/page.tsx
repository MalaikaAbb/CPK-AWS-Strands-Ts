import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

/**
 * Reference route: a v1-era release note (CopilotKit 1.8.2). Its one snippet is
 * shown verbatim. The feedback handlers it introduces are exercised for real
 * on /prebuilt-components/chat-controls.
 */

const THUMBS = `<CopilotChat
  onThumbsUp={(message) => console.log(message)}
  onThumbsDown={(message) => console.log(message)}
/>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/troubleshooting/migrate-to-1.8.2" />

      <Panel title="What the guide covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A v1-era release note: a new default chat look, thumbs-up and
          thumbs-down callbacks on the chat components, per-message buttons
          (thumbs, copy, regenerate) replacing the removed{" "}
          <code>ResponseButton</code> prop, and built-in dark mode driven by
          the <code>.dark</code> class or <code>color-scheme</code>.
        </p>
      </Panel>

      <Panel title="The page's snippet">
        <CodeBlock code={THUMBS} language="tsx" filename="Thumbs up / down handlers" />
      </Panel>

      <Callout tone="warn" title="This repo against the guide">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            The handlers still exist in v2: <code>onThumbsUp</code> /{" "}
            <code>onThumbsDown</code> are props of the v2 chat in{" "}
            <code>@copilotkit/react-core</code> 1.84.0. They run live on{" "}
            <Link className="underline" href="/prebuilt-components/chat-controls">
              /prebuilt-components/chat-controls
            </Link>
            .
          </li>
          <li>
            The snippet has no import line, so it does not say which package{" "}
            <code>CopilotChat</code> comes from.
          </li>
          <li>
            Both &quot;look and feel&quot; links on the page point to{" "}
            <code>/custom-look-and-feel</code> with no framework prefix, which
            did not resolve on 2026-11-11. The page also ends with an
            interactive preview component that only renders on the docs site.
          </li>
          <li>
            The page has a typo (&quot;behvior&quot;); recorded, not changed.
          </li>
        </ul>
      </Callout>
    </>
  );
}
