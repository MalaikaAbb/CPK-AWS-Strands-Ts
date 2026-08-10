"use client";

/**
 * The page's `delegation-log.tsx`, reproduced with its missing declarations
 * restored.
 *
 * Everything from `INDICATOR_ROLES` down is the published block, verbatim —
 * markup, Tailwind classes, hex colours, `data-testid` attributes and all.
 * The block is printed with its import section stripped, so four symbols it
 * uses are undefined:
 *
 *   - `SubAgentName`     — used as `Set<SubAgentName>` and as a field type.
 *                          `INDICATOR_ROLES` pins it to exactly these three.
 *   - `SUB_AGENT_STYLE`  — read as `SUB_AGENT_STYLE[subAgent]` for
 *                          `.color`, `.emoji` and `.label`.
 *   - `DelegationLogProps` — destructured as `{ delegations, isRunning }`.
 *   - the `Delegation` shape — read as `.sub_agent`, `.id`, `.task`,
 *                          `.result` and `.status`.
 *
 * All four are recovered from usage alone. Nothing about their *values* is
 * published, so the emoji, labels and colours below are this repo's.
 *
 * The component renders a `delegations` slot of agent state that nothing on
 * the Strands TypeScript side ever populates — the two tool snippets that
 * would are `snippet skipped` markers. See the doc gaps on the parent route.
 */

export type SubAgentName = "research_agent" | "writing_agent" | "critique_agent";

export interface Delegation {
  id: string;
  sub_agent: SubAgentName;
  task: string;
  result: string;
  status: string;
}

export interface DelegationLogProps {
  delegations: Delegation[];
  isRunning: boolean;
}

const SUB_AGENT_STYLE: Record<
  SubAgentName,
  { emoji: string; label: string; color: string }
> = {
  research_agent: {
    emoji: "🔎",
    label: "Research",
    color: "border-[#BEC2FF] text-[#3B3FA8]",
  },
  writing_agent: {
    emoji: "✍️",
    label: "Writing",
    color: "border-[#A8DDC8] text-[#12664B]",
  },
  critique_agent: {
    emoji: "⚖️",
    label: "Critique",
    color: "border-[#F5CBA0] text-[#8A4B12]",
  },
};

// Fixed list of the three sub-agent roles the supervisor can call.
// Rendered as always-visible indicator chips at the top of the log
// (regardless of whether the supervisor has delegated yet) so the user
// — and the e2e suite — can see at a glance which sub-agents exist and
// which are currently active.
const INDICATOR_ROLES: ReadonlyArray<{
  role: "researcher" | "writer" | "critic";
  subAgent: SubAgentName;
}> = [
  { role: "researcher", subAgent: "research_agent" },
  { role: "writer", subAgent: "writing_agent" },
  { role: "critic", subAgent: "critique_agent" },
];

export function DelegationLog({ delegations, isRunning }: DelegationLogProps) {
  const calledRoles = new Set<SubAgentName>(
    delegations.map((d) => d.sub_agent),
  );

  return (
    <div
      data-testid="delegation-log"
      className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-[#DBDBE5] overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#E9E9EF] bg-[#FAFAFC]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#010507]">
            Sub-agent delegations
          </span>
          {isRunning && (
            <span
              data-testid="supervisor-running"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#BEC2FF] bg-[#BEC2FF1A] text-[#010507] text-[10px] font-semibold uppercase tracking-[0.12em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#010507] animate-pulse" />
              Supervisor running
            </span>
          )}
        </div>
        <span
          data-testid="delegation-count"
          className="text-xs font-mono text-[#838389]"
        >
          {delegations.length} calls
        </span>
      </div>

      <div
        data-testid="subagent-indicators"
        className="flex items-center gap-2 border-b border-[#E9E9EF] bg-white px-6 py-2"
      >
        {INDICATOR_ROLES.map(({ role, subAgent }) => {
          const style = SUB_AGENT_STYLE[subAgent];
          const fired = calledRoles.has(subAgent);
          return (
            <span
              key={role}
              data-testid={`subagent-indicator-${role}`}
              data-role={role}
              data-fired={fired ? "true" : "false"}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color} ${
                fired ? "" : "opacity-60"
              }`}
            >
              <span aria-hidden>{style.emoji}</span>
              <span>{style.label}</span>
            </span>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {delegations.length === 0 ? (
          <p className="text-[#838389] italic text-sm">
            Ask the supervisor to complete a task. Every sub-agent it calls will
            appear here.
          </p>
        ) : (
          delegations.map((d, idx) => {
            const style = SUB_AGENT_STYLE[d.sub_agent];
            return (
              <div
                key={d.id}
                data-testid="delegation-entry"
                className="border border-[#E9E9EF] rounded-xl p-3 bg-[#FAFAFC]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#AFAFB7]">
                      #{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color}`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#189370]">
                    {d.status}
                  </span>
                </div>
                <div className="text-xs text-[#57575B] mb-2">
                  <span className="font-semibold text-[#010507]">Task: </span>
                  {d.task}
                </div>
                <div className="text-sm text-[#010507] whitespace-pre-wrap bg-white rounded-lg p-2.5 border border-[#E9E9EF]">
                  {d.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
