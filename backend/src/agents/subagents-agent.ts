

import { Agent, tool, type ToolList } from "@strands-agents/sdk";
import { StrandsAgent, type StatePayload, type StrandsAgentConfig, type ToolResultContext } from "@ag-ui/aws-strands";
import { z } from "zod";
import OpenAI from "openai";

import { createModel } from "./model";

const SUBAGENT_SYSTEM_PROMPTS: Record<string, string> = {
  research_agent:
    "You are a research sub-agent. Given a topic, produce a concise bulleted list of 3-5 key facts. No preamble, no closing.",
  writing_agent:
    "You are a writing sub-agent. Given a brief and optional source facts, produce a polished 1-paragraph draft. Be clear and concrete. No preamble.",
  critique_agent:
    "You are an editorial critique sub-agent. Given a draft, give 2-3 crisp, actionable critiques. No preamble.",
};
const SUBAGENT_EMPTY_RESULT = "(sub-agent returned no content)";
// Per-thread scratchpad of delegations, seeded from inbound state so a
// multi-turn conversation appends rather than overwrites.
const delegationsByThread = new Map<string, Delegation[]>();

function seedDelegations(threadId: string, state: unknown): Delegation[] {
  const existing = delegationsByThread.get(threadId);
  if (existing) return existing;
  let seeded: Delegation[] = [];
  if (state && typeof state === "object") {
    const d = (state as Record<string, unknown>).delegations;
    if (Array.isArray(d)) {
      seeded = d.filter((x): x is Delegation => !!x && typeof x === "object");
    }
  }
  delegationsByThread.set(threadId, seeded);
  return seeded;
}

function flattenResult(resultData: unknown): string {
  if (resultData == null) return "";
  if (typeof resultData === "string") return resultData;
  if (Array.isArray(resultData)) {
    const parts: string[] = [];
    for (const item of resultData) {
      if (item && typeof item === "object" && "text" in item) {
        const t = (item as { text?: unknown }).text;
        if (typeof t === "string") parts.push(t);
      } else if (typeof item === "string") {
        parts.push(item);
      }
    }
    if (parts.length) return parts.join("\n");
  }
  if (typeof resultData === "object" && "text" in resultData) {
    const t = (resultData as { text?: unknown }).text;
    if (typeof t === "string") return t;
  }
  return JSON.stringify(resultData);
}

/** Parse a tool's input (string JSON or already-parsed object). */
function parseToolInput(raw: unknown): unknown {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw;
}

export const SUBAGENT_FAILURE_MARKER = "__SUBAGENT_FAILED__:";

// ---- sub-agents (delegation log) -----------------------------------------

interface Delegation {
  id: string;
  sub_agent: string;
  task: string;
  status: "completed" | "failed";
  result: string;
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
    
/**
 * Factory for a `stateFromResult` hook bound to a sub-agent name. On each
 * delegation it appends a Delegation entry to the per-thread scratchpad and
 * returns the full updated list so the adapter emits a `StateSnapshotEvent`.
 */
export function makeSubagentStateFromResult(subAgentName: string) {
  return async (ctx: ToolResultContext): Promise<StatePayload | null> => {
    const threadId = ctx.inputData.threadId || "default";
    const existing = seedDelegations(threadId, ctx.inputData.state);

    const input = parseToolInput(ctx.toolInput);
    let task = "";
    if (input && typeof input === "object" && !Array.isArray(input)) {
      task = String((input as Record<string, unknown>).task ?? "");
    }

    const resultText = flattenResult(ctx.resultData);
    let status: Delegation["status"];
    let displayResult: string;
    if (resultText.startsWith(SUBAGENT_FAILURE_MARKER)) {
      status = "failed";
      const failureClass =
        resultText.slice(SUBAGENT_FAILURE_MARKER.length).trim() || "Error";
      displayResult = `Sub-agent call failed (${failureClass}).`;
    } else {
      status = "completed";
      displayResult = resultText;
    }

    const entry: Delegation = {
      id: crypto.randomUUID(),
      sub_agent: subAgentName,
      task,
      status,
      result: displayResult,
    };
    const updated = [...existing, entry];
    delegationsByThread.set(threadId, updated);
    return { delegations: updated.map((d) => ({ ...d })) };
  };
}

const config: StrandsAgentConfig = {
    
    toolBehaviors: {
      research_agent: {
        stateFromResult: makeSubagentStateFromResult("research_agent"),
      },
      writing_agent: {
        stateFromResult: makeSubagentStateFromResult("writing_agent"),
      },
      critique_agent: {
        stateFromResult: makeSubagentStateFromResult("critique_agent"),
      },
    },
  };
/**
 * Run a single-shot completion as a sub-agent. Returns the failure marker
 * (caught in `state.ts`) on transport/API errors rather than throwing, so a
 * delegation failure surfaces as a "failed" log row instead of a 500.
 */
async function runSubagent(name: string, task: string): Promise<string> {
  const systemPrompt = SUBAGENT_SYSTEM_PROMPTS[name];
  try {
    const response = await client.chat.completions.create({
      model: process.env.SUBAGENT_MODEL_ID ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: task },
      ],
    });
    const content = response.choices[0]?.message?.content ?? "";
    const text = content.trim();
    return text || SUBAGENT_EMPTY_RESULT;
  } catch (err) {
   console.error(`Sub-agent ${name} failed:`, err);
  }
}


export const researchAgent = tool({
  name: "research_agent",
  description:
    "Delegate a research task to the research sub-agent. Use for gathering facts, background, definitions, statistics. Returns a bulleted list of key facts.",
  inputSchema: z.object({
    task: z.string().describe("The research brief to hand off."),
  }),
  callback: ({ task }) => runSubagent("research_agent", task),
});

export const writingAgent = tool({
  name: "writing_agent",
  description:
    "Delegate a drafting task to the writing sub-agent. Use for producing a polished paragraph, draft, or summary. Pass relevant facts inside `task`.",
  inputSchema: z.object({
    task: z.string().describe("The writing brief to hand off."),
  }),
  callback: ({ task }) => runSubagent("writing_agent", task),
});

export const critiqueAgent = tool({
  name: "critique_agent",
  description:
    "Delegate a critique task to the critique sub-agent. Use for reviewing a draft and suggesting concrete improvements.",
  inputSchema: z.object({
    task: z.string().describe("The draft to critique."),
  }),
  callback: ({ task }) => runSubagent("critique_agent", task),
});

/**
 * The supervisor's delegation tools.
 *
 * Empty on purpose — see the header. Add the three delegation tools here and
 * they reach the agent below with no other change.
 */
export const SUBAGENT_DELEGATION_TOOLS: ToolList = [researchAgent, writingAgent, critiqueAgent];



/** This repo's prompt; the docs' own lives in the unpublished `./prompts`. */
const SUPERVISOR_PROMPT =
  "Delegate work to specialised sub-agents when the user asks for research, drafting, or critique. Tools: \`research_agent\`, \`writing_agent\`, \`critique_agent\`. For non-trivial deliverables delegate in sequence research -> write -> critique. Pass relevant facts/draft through the \`task\` argument. The UI renders a live log of every delegation.";




export async function buildSubagentsAgent(): Promise<StrandsAgent> {
  const agent = new Agent({
    model: createModel(),
    systemPrompt: SUPERVISOR_PROMPT,
    ...(SUBAGENT_DELEGATION_TOOLS.length
      ? { tools: SUBAGENT_DELEGATION_TOOLS }
      : {}),
  });

  await agent.initialize();

  return new StrandsAgent({
    agent,
    name: "subagents",
    description: "Backs Sub-Agents.",
    config,
  });
}
