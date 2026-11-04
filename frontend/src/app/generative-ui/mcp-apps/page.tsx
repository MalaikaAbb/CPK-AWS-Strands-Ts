import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/mcp-apps";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/mcp-apps" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A runtime given <code>mcpApps.servers</code> attaches the MCP Apps
          middleware to its agents. The agent sees the MCP server&apos;s tools;
          when it calls one that has a UI resource, the middleware fetches it
          and the built-in renderer mounts it in the chat as a sandboxed iframe.
          The frontend is a plain chat with nothing registered.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Draw a simple flowchart: Idea → Build → Ship.",
              "Sketch a box labelled Frontend connected to a box labelled Agent.",
            ]}
            expect="The agent calls an Excalidraw MCP tool and an interactive Excalidraw canvas appears inline in the chat, in an iframe."
            fail={
              <>
                A text-only answer means the MCP tools never reached the
                model: check the Inspector for the tool list on the run. An
                error from the runtime usually means the server URL could not
                be reached. The demo&apos;s URL is{" "}
                <code>https://mcp.excalidraw.com</code>, which answers with a
                308 redirect to <code>/mcp</code>.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="The runtime — as published">
        <SourceCodeGroup
          files={[{ file: "frontend/src/app/api/copilotkit-mcp-apps/route.ts" }]}
          note={
            <>
              Copied unchanged from the page&apos;s demo Code tab, including its{" "}
              <code>@ts-ignore</code> and its single <code>POST</code> export.
              Every agent name points at <code>{"${AGENT_URL}/"}</code>.
            </>
          }
        />
      </Panel>

      <Panel title="The page — as published">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/_demo/page.tsx` },
            { file: `${DIR}/demo-chat/page.tsx` },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Written in — what the page leaves out">
        <ul className="space-y-1.5">
          <li>
            · <code>./chat</code> is imported and never published.{" "}
            <code>_demo/chat.tsx</code> is a plain{" "}
            <code>&lt;CopilotChat agentId=&quot;mcp-apps&quot;&gt;</code>.
          </li>
          <li>
            · The runtime&apos;s <code>HttpAgent</code> targets the server root,
            where the showcase serves <code>buildShowcaseAgent</code>. Its{" "}
            <code>SYSTEM_PROMPT</code> and <code>SHOWCASE_TOOLS</code> are
            unpublished, so the backend mounts a Quickstart-shaped stand-in at{" "}
            <code>/</code> (<code>showcase-standin</code> in{" "}
            <code>backend/src/agents/registry.ts</code>). The MCP tools reach it
            per run.
          </li>
          <li>
            · The page&apos;s prose snippet for Intelligence uses{" "}
            <code>https://mcp.excalidraw.com/mcp</code>, while the demo route
            uses the bare host. Only the demo route runs here.
          </li>
        </ul>
      </Callout>
    </>
  );
}
