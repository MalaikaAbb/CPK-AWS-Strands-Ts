import Link from "next/link";

import { StatusBadge } from "@/components/route-header";
import { Panel } from "@/components/ui";
import { ALL_GAPS, ROUTE_GAPS, type GapSeverity } from "@/lib/doc-gaps";
import { ALL_ROUTES, NAV, docUrl } from "@/lib/nav-config";
import { DocSyncedAt } from "@/components/doc-synced-at";

/** Dynamic: the doc-sync readouts below read the snapshot off disk. */
export const dynamic = "force-dynamic";

const SEVERITY_ORDER: GapSeverity[] = ["blocking", "degraded", "note"];

const SEVERITY_STYLE: Record<GapSeverity, string> = {
  blocking:
    "border-rose-400 bg-rose-100 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200",
  degraded:
    "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  note: "border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export default function Page() {
  const counts = ALL_ROUTES.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  // Which routes each gap shows up on, so the ledger reads both ways.
  const gapRoutes = new Map<string, string[]>();
  for (const [path, ids] of Object.entries(ROUTE_GAPS)) {
    for (const id of ids) {
      gapRoutes.set(id, [...(gapRoutes.get(id) ?? []), path]);
    }
  }

  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Status
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The living QA record. Checked against the live docs on{" "}
          <DocSyncedAt />.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {(["working", "partial", "broken", "reference"] as const).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <StatusBadge status={s} />
              <span className="text-slate-600 dark:text-slate-400">
                {counts[s] ?? 0}
              </span>
            </span>
          ))}
        </div>
      </header>

      <Panel title="Every route">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Route", "Status", "Agent", "Notes", "Doc"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAV.flatMap((g) =>
                g.routes.map((route) => (
                  <tr key={route.path} className="align-top">
                    <td className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                      <Link
                        href={route.path}
                        className="text-slate-900 underline-offset-4 hover:underline dark:text-slate-100"
                      >
                        {route.title}
                      </Link>
                      <div className="font-mono text-[11px] text-slate-400">
                        {route.path}
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                      <StatusBadge status={route.status} />
                    </td>
                    <td className="border-b border-slate-100 px-2 py-2 font-mono text-[11px] text-slate-500 dark:border-slate-800">
                      {route.agentId ?? "—"}
                    </td>
                    <td className="border-b border-slate-100 px-2 py-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {route.statusNote ?? route.summary}
                    </td>
                    <td className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                      <a
                        href={docUrl(route)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--accent)] underline underline-offset-4"
                      >
                        ↗
                      </a>
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title={`The doc-gap ledger (${ALL_GAPS.length})`}
        description="Every finding is a claim about the documentation, checked on the doc-sync date. None is a claim about AWS Strands."
      >
        <ul className="space-y-5">
          {SEVERITY_ORDER.flatMap((severity) =>
            ALL_GAPS.filter((g) => g.severity === severity).map((gap) => (
              <li key={gap.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_STYLE[gap.severity]}`}
                  >
                    {gap.severity}
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {gap.title}
                  </p>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {gap.detail}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Shows on:{" "}
                  {(gapRoutes.get(gap.id) ?? ["—"]).map((p, i) => (
                    <span key={p}>
                      {i > 0 && ", "}
                      <Link href={p} className="underline underline-offset-4">
                        {p}
                      </Link>
                    </span>
                  ))}
                </p>
              </li>
            )),
          )}
        </ul>
      </Panel>
    </>
  );
}
