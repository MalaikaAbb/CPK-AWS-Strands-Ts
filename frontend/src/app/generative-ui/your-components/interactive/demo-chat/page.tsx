"use client";

import { CopilotChat, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The approve/deny gate for the Interactive route.
 *
 * The `useHumanInTheLoop` call below is reproduced character for character from
 * the snippet supplied for this route — the doc page itself publishes nothing
 * at all (156 bytes, one unrendered placeholder tag), so there was no code on
 * it to reproduce. See the parent route.
 *
 * Three things about the snippet worth knowing before you read it:
 *
 *  - **No `agentId`.** That is not an omission. `FrontendTool.agentId` is
 *    documented as "optional agent ID to *constrain* this tool to a specific
 *    agent", so leaving it off makes the tool available to every agent rather
 *    than binding it to one named `default` — which this harness never
 *    registers. The hook unregisters on unmount and demo routes are full-page,
 *    so only this route's tool is ever live.
 *
 *  - **`status !== "executing"` is the right guard.** `ToolCallStatus` is
 *    `inProgress | executing | complete`, and `executing` is the window where
 *    the call is waiting on `respond`. So the buttons appear exactly while the
 *    run is suspended.
 *
 *  - **It returns `<></>` outside that window,** which means an answered gate
 *    leaves no trace in the transcript — scroll back after approving and the
 *    card is gone, by design. The agent's own follow-up message is the record.
 *
 * `respond` sends a string back as the tool result, and both branches here send
 * an instruction rather than a value ("Tell the user the command ran"), so the
 * agent narrates the outcome instead of the UI asserting it.
 */

function Chat() {
  useHumanInTheLoop({
    name: "humanApprovedCommand",
    description: "Ask human for approval to run a command.",
    parameters: z.object({
      command: z.string().describe("The command to run"),
    }),
    render: ({ args, respond, status }) => {
      if (status !== "executing") return <></>;
      return (
        <div>
          <pre>{args.command}</pre>
          <button onClick={() => respond?.(`Tell the user the command ran`)}>
            Approve
          </button>
          <button
            onClick={() => respond?.(`Tell the user the command wasn't run`)}
          >
            Deny
          </button>
        </div>
      );
    },
  });

  return <CopilotChat agentId="gen-ui-interactive" />;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/your-components/interactive"
      subtitle="agent: gen-ui-interactive"
    >
      <div className="chat-host mx-auto h-full max-w-3xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
