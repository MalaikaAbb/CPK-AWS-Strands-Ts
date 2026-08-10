"use client";

/**
 * The cards the tool-rendering page draws in place of raw tool calls.
 *
 * The page's `page.tsx` imports `WeatherCard`, `FlightListCard` (plus its
 * `Flight` type), `CustomCatchallRenderer` (plus `CatchallToolStatus`) and
 * `parseJsonResult` at the top, and publishes none of them. What it does
 * publish is every call site, and each one passes its props by name, so the
 * prop lists below are recovered rather than guessed:
 *
 *     <WeatherCard loading location temperature humidity windSpeed conditions />
 *     <FlightListCard loading origin destination flights />
 *     <CustomCatchallRenderer name parameters status result />
 *
 * Each card renders in both states on purpose. While `loading` is true the
 * arguments are known — the model has said which city, or which route — but
 * the result is not, so the card can show what is being fetched instead of a
 * bare spinner. That two-state behaviour is the thing tool rendering exists
 * for, and it is the one part the published render functions do make explicit
 * (`const loading = status !== "complete"`).
 */

import type { ReactNode } from "react";

export interface Flight {
  airline?: string;
  departure?: string;
  arrival?: string;
  price?: string;
  duration?: string;
}

export type CatchallToolStatus = string;

/**
 * `parseJsonResult` from the unpublished `../_shared/parse-json-result`.
 *
 * Its behaviour is pinned by how the published render functions use it: called
 * with a possibly-absent `result`, destructured with `??` fallbacks on every
 * field, and never guarded against throwing. So: tolerate absence, tolerate a
 * non-JSON string, never throw.
 */
export function parseJsonResult<T>(result: unknown): Partial<T> {
  if (!result) return {};
  if (typeof result === "object") return result as Partial<T>;
  if (typeof result !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(result);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Partial<T>)
      : {};
  } catch {
    return {};
  }
}

function CardShell({
  title,
  pill,
  children,
}: {
  title: string;
  pill: string;
  children: ReactNode;
}) {
  return (
    <div className="my-2 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </p>
        <span className="shrink-0 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {pill}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function WeatherCard({
  loading,
  location,
  temperature,
  humidity,
  windSpeed,
  conditions,
}: {
  loading: boolean;
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  conditions?: string;
}) {
  return (
    <CardShell
      title={location || "…"}
      pill={loading ? "calling weather api…" : "get_weather"}
    >
      {loading ? (
        <p className="text-sm text-slate-500">Fetching conditions…</p>
      ) : (
        <>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {temperature ?? "—"}°
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {conditions ?? "—"}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>
              <dt className="font-medium">Humidity</dt>
              <dd>{humidity ?? "—"}%</dd>
            </div>
            <div>
              <dt className="font-medium">Wind</dt>
              <dd>{windSpeed ?? "—"} mph</dd>
            </div>
          </dl>
        </>
      )}
    </CardShell>
  );
}

export function FlightListCard({
  loading,
  origin,
  destination,
  flights,
}: {
  loading: boolean;
  origin: string;
  destination: string;
  flights: Flight[];
}) {
  return (
    <CardShell
      title={`${origin || "?"} → ${destination || "?"}`}
      pill={loading ? "searching…" : "search_flights"}
    >
      {loading ? (
        <p className="text-sm text-slate-500">Searching for flights…</p>
      ) : flights.length === 0 ? (
        <p className="text-sm text-slate-500">No flights returned.</p>
      ) : (
        <ul className="space-y-2">
          {flights.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
            >
              <span className="truncate">{f.airline ?? "Airline"}</span>
              <span className="shrink-0 font-mono text-xs text-slate-500">
                {f.departure ?? "--:--"} → {f.arrival ?? "--:--"}
              </span>
              <span className="shrink-0 font-semibold">{f.price ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
}

/**
 * The wildcard renderer. Deliberately generic — it has to look right for a tool
 * it has never heard of, which is the whole point of a catch-all.
 */
export function CustomCatchallRenderer({
  name,
  parameters,
  status,
  result,
}: {
  name: string;
  parameters?: unknown;
  status: CatchallToolStatus;
  result?: unknown;
}) {
  const done = status === "complete";
  return (
    <div className="my-2 w-full max-w-sm rounded-xl border border-dashed border-violet-300 bg-violet-50/60 p-3 dark:border-violet-800 dark:bg-violet-950/30">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-mono text-xs font-semibold text-violet-900 dark:text-violet-200">
          {name}
        </span>
        <span className="shrink-0 rounded-full bg-violet-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900 dark:bg-violet-900 dark:text-violet-100">
          {done ? "done" : "running"}
        </span>
      </div>
      <pre className="mt-2 overflow-x-auto text-[11px] leading-relaxed text-violet-900/80 dark:text-violet-200/80">
        {JSON.stringify(done ? { parameters, result } : { parameters }, null, 2)}
      </pre>
    </div>
  );
}
