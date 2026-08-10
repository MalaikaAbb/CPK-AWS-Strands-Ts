"use client";

import React from "react";
import {
  CopilotChat,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import type { TimeSlot } from "../time-picker-card";
import { TimePickerCard } from "../time-picker-card";

/**
 * The HITL page's `hitl-in-chat/page.tsx`, reproduced.
 *
 * `DEFAULT_SLOTS`, the `useConfigureSuggestions` block and the whole
 * `useHumanInTheLoop` call — including its very long `description`, which is
 * doing real work steering the model away from a competing `schedule_meeting`
 * tool — are the page's, verbatim. So is `render: ({ args, status, respond }: any)`,
 * `any` included.
 *
 * The published block ends after the hook, with no closing brace and no
 * return, so the `<CopilotChat>` below is this repo's. `TimePickerCard` and
 * `TimeSlot` are imported by the page and published nowhere; see
 * `../time-picker-card.tsx`.
 */

const DEFAULT_SLOTS: TimeSlot[] = [
  { label: "Tomorrow 10:00 AM", iso: "2026-04-19T10:00:00-07:00" },
  { label: "Tomorrow 2:00 PM", iso: "2026-04-19T14:00:00-07:00" },
  { label: "Monday 9:00 AM", iso: "2026-04-21T09:00:00-07:00" },
  { label: "Monday 3:30 PM", iso: "2026-04-21T15:30:00-07:00" },
];

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message:
          "Please book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });

  useHumanInTheLoop({
    agentId: "hitl-in-chat",
    name: "book_call",
    description:
      "Use this tool for ANY request to schedule, book, set up, arrange, or organize a call, meeting, 1:1, intro, sync, or chat — including phrasings like 'schedule a 1:1 with Alice', 'book a call', or 'set up a meeting'. It presents the user an in-chat time picker with candidate slots and returns their chosen time. ALWAYS prefer this tool over `schedule_meeting` or any other scheduling tool when the user wants to pick a meeting time in this conversation.",
    parameters: z.object({
      topic: z
        .string()
        .describe("What the call is about (e.g. 'Intro with sales')"),
      attendee: z
        .string()
        .describe("Who the call is with (e.g. 'Alice from Sales')"),
    }),
    render: ({ args, status, respond }: any) => (
      <TimePickerCard
        topic={args?.topic ?? "a call"}
        attendee={args?.attendee}
        slots={DEFAULT_SLOTS}
        status={status}
        onSubmit={(result) => respond?.(result)}
      />
    ),
  });

  return <CopilotChat agentId="hitl-in-chat" />;
}

export default function HitlInChatDemo() {
  return (
    <DemoFrame parentPath="/human-in-the-loop" subtitle="agent: hitl-in-chat">
      <div className="chat-host mx-auto h-full max-w-3xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
