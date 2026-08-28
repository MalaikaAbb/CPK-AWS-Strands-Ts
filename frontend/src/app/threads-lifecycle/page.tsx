import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PRECEDENCE = [
  "An explicit `threadId` prop on <CopilotChat> / <CopilotChatConfigurationProvider> — authoritative: it drives history replay and disables the welcome screen.",
  "An active-thread override set via setActiveThreadId(...) / a picked thread row / startNewThread().",
  "A threadId inherited from a parent configuration provider.",
  "A non-authoritative threadId seed.",
  "Otherwise, a freshly minted randomUUID().",
];

const MINT_UP_FRONT = `async function startConversation() {
  const { id } = await myApi.createThread(); // your backend  ← never defined
  config?.setActiveThreadId(id, { explicit: true });
  // or render <CopilotChat threadId={id} />
}`;

const HYDRATE = `import { useAgent } from "@copilotkit/react-core/v2";

function MyComponent() {
  const { agent } = useAgent({ agentId: "my-agent" });

  // Read the current conversation
  const messages = agent.messages;

  // Replace it (e.g. hydrate from your own store)
  // agent.setMessages(myPersistedMessages);

  return null;
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads-lifecycle" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Where a <code>threadId</code> comes from and what follows from that.
          Four beats: <strong>mint</strong> (client-side UUID v4 at mount if you
          supply none), <strong>run</strong> (messages stream under that id and
          persist if a store is configured), <strong>hydrate</strong> (mount
          with a known id and the client replays its history), and{" "}
          <strong>switch/start</strong>. The route puts the two controls that
          drive the last beat next to a readout of the id they are changing.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, press New chat, send another",
              "Pick the first conversation and press Open conversation",
              "Pick it again and press Set id, no replay",
            ]}
            expect="New chat mints a new threadId and clears the view. Open conversation flips hasExplicitThreadId to true and replays that conversation's messages. Set id, no replay moves the id to the same thread but leaves the welcome screen up — that contrast is the whole point of the explicit flag."
            fail="The buttons log a warning and do nothing, which happens when a threadId prop is also set. This route deliberately passes none — see below. An empty picker means no threads exist yet: send a message first, and note that the list needs INTELLIGENCE_API_KEY to populate at all."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/threads-lifecycle/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="Both branches of the explicit flag are on the demo">
        <p>
          The page draws a distinction that is easy to read past:{" "}
          <code>setActiveThreadId(id, {"{ explicit: true }"})</code> treats the
          id as a known thread and <em>replays its history</em>, while{" "}
          <code>{"{ explicit: false }"}</code> sets the same id and shows the
          welcome screen instead. The demo gives each its own button — Open
          conversation and Set id, no replay — so the difference is visible
          rather than described. The readout&apos;s{" "}
          <code>hasExplicitThreadId</code> row is what moves between them.
        </p>
      </Callout>

      <Panel title="How the id is resolved, highest precedence first">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          {PRECEDENCE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </Panel>

      <Callout tone="warn" title="Pick one source of truth, or the setters silently stop working">
        <p>
          The page is explicit: both <code>setActiveThreadId</code> and{" "}
          <code>startNewThread</code> <strong>no-op and log a warning</strong>{" "}
          when the id is prop-controlled. So a route cannot both pass{" "}
          <code>threadId</code> to <code>&lt;CopilotChat&gt;</code> and drive it
          imperatively. This route picks the imperative side and passes no prop,
          which is why its buttons work;{" "}
          <a
            href="/headless-threads"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Headless Threads
          </a>{" "}
          picks the prop, which is why its New button has to clear that prop
          before <code>startNewThread</code> can land. Between them the two
          routes cover both halves of the choice.
        </p>
      </Callout>

      <Callout tone="warn" title="Auto-minted ids re-mint on remount">
        <p>
          The fallback id is computed with <code>useMemo</code>, so a{" "}
          <em>remount</em> — a changed React <code>key</code>, a parent
          unmount/remount, or StrictMode&apos;s double-mount in dev — produces a
          new id and silently starts a new conversation. Worth knowing before
          you conclude that persistence is broken: in dev the first conversation
          of a page load can be orphaned this way. If you need continuity, mint
          the id yourself and pass it.
        </p>
      </Callout>

      <Panel title="Manual hydration, as published">
        <CodeBlock code={HYDRATE} language="tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Note that the only mutating line is commented out and its argument,{" "}
          <code>myPersistedMessages</code>, is defined nowhere — so the snippet
          reads as a demonstration of the API surface rather than a working
          example. The readout on this route uses the live half (
          <code>agent.messages</code>) and leaves{" "}
          <code>agent.setMessages</code> alone, since there is no store here to
          hydrate from.
        </p>
      </Panel>

      <Callout tone="warn" title="Two snippets call a backend that is never defined">
        <p className="mb-3">
          The &quot;create a thread with your own API&quot; section is built on{" "}
          <code>myApi.createThread()</code>:
        </p>
        <CodeBlock code={MINT_UP_FRONT} language="tsx" />
        <p className="mt-3">
          <code>myApi</code> is imported nowhere and defined nowhere, and the
          headless variant beneath it uses the same call plus a{" "}
          <code>&quot;...then trigger the run with your send logic&quot;</code>{" "}
          comment in place of the send. Both are shape-only. This route
          therefore implements the parts that are complete — the two lifecycle
          setters — and not the two that are placeholders.
        </p>
        <p className="mt-3">
          The section is still worth reading for one hard-won detail it does
          state precisely: for a send you fire in the same handler, set{" "}
          <code>agent.threadId</code> directly rather than calling{" "}
          <code>setActiveThreadId</code>, because the latter updates React state
          and only reaches the agent on the next render — so an immediate run
          would still use the previous thread.
        </p>
      </Callout>

      <Callout tone="info" title="CopilotKit threads are not your framework's checkpointer">
        <p>
          Two layers, correlated only by the shared <code>threadId</code>.
          CopilotKit Intelligence stores the conversation list and the full
          AG-UI event history; a framework checkpointer stores framework-internal
          state. <code>useThreads</code> rename/archive/delete operate on the
          former and do not reach into the latter. For Strands specifically this
          distinction is mostly academic — the Strands TypeScript tree documents
          no checkpointer at all, and every example the page gives of the
          framework-native side is LangGraph or ADK.
        </p>
      </Callout>
    </>
  );
}
