import Link from "next/link";

import { StatusBadge } from "@/components/route-header";
import { Callout, Panel } from "@/components/ui";
import { ALL_GAPS } from "@/lib/doc-gaps";
import { AGENT_IDS } from "@/lib/agents";
import { ALL_ROUTES, DOCS_ROOT, DOC_SYNC_DATE, NAV } from "@/lib/nav-config";

export default function Page() {
  const counts = ALL_ROUTES.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const blocking = ALL_GAPS.filter((g) => g.severity === "blocking").length;

  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          CopilotKit + AWS Strands (TypeScript)
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          A working test harness for the CopilotKit AWS Strands TypeScript
          integration. Every page under{" "}
          <a
            href={DOCS_ROOT}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            docs.copilotkit.ai/strands-typescript
          </a>{" "}
          that this repo covers has a route, and every route either implements
          what the page teaches or says precisely why it cannot.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Doc-sync date {DOC_SYNC_DATE} · {ALL_ROUTES.length} routes ·{" "}
          {AGENT_IDS.length} agents · {ALL_GAPS.length} doc gaps ({blocking}{" "}
          blocking)
        </p>
      </header>

      <Panel title="Status at a glance">
        <div className="flex flex-wrap gap-4 text-sm">
          {(["working", "partial", "broken", "reference"] as const).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <StatusBadge status={s} />
              <span className="text-slate-600 dark:text-slate-400">
                {counts[s] ?? 0}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          The full table, with a note per route, is on the{" "}
          <Link
            href="/status"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            status page
          </Link>
          .
        </p>
      </Panel>

      <Panel title="The routes">
        <div className="space-y-5">
          {NAV.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {group.title}
              </p>
              <ul className="mt-1.5 space-y-1">
                {group.routes
                  .filter((r) => r.path !== "/")
                  .map((route) => (
                    <li key={route.path} className="flex items-start gap-3">
                      <StatusBadge status={route.status} />
                      <Link
                        href={route.path}
                        className="text-sm text-slate-800 underline-offset-4 hover:underline dark:text-slate-200"
                      >
                        {route.title}
                      </Link>
                      <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
                        {route.summary}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
