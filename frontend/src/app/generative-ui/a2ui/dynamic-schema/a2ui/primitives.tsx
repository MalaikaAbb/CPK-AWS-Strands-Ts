"use client";

/**
 * The shared chrome `renderers.tsx` builds on. None of it is published.
 *
 * The doc page's `renderers.tsx` block opens directly at
 * `export const myRenderers: CatalogRenderers<MyDefinitions> = {` — no import
 * line — and stops mid-JSX inside the first renderer. So every symbol the
 * renderers reach for outside their own bodies has to come from somewhere, and
 * the docs name none of them.
 *
 * Seven live here:
 *
 *   c              colour tokens (`cardFg`, `muted`, `divider`)
 *   CHART_COLORS   the categorical series palette for Pie/Bar
 *   CardShell      the titled container Card, PieChart and BarChart share
 *   Badge          the pill StatusBadge renders into
 *   Button         the control PrimaryButton renders into
 *
 * plus `React` and the four lucide icons, which are real packages and only
 * needed an import line — those are added in `renderers.tsx` directly.
 *
 * Every prop signature below is recovered from a call site rather than
 * invented: `CardShell` is called with `title` / `subtitle` / `testid` and
 * (from `Card` only) `cardId`; `Badge` with `variant`, `style` and a
 * `data-testid`; `Button` with `onClick`. Nothing here has behaviour the
 * renderers do not ask for.
 *
 * Colours resolve through CopilotKit's v2 shadcn tokens, which are scoped to
 * `[data-copilotkit]` — the A2UI surface renders inside the chat, so they are
 * in scope. Each carries a literal fallback so a surface rendered outside that
 * subtree still has contrast rather than inheriting `currentColor`.
 */

import type { CSSProperties, ComponentProps, ReactNode } from "react";

/** Token shorthand. `c.divider` and `c.muted` are handed to Recharts as SVG paint. */
export const c = {
  cardFg: "var(--foreground, #0f172a)",
  muted: "var(--muted-foreground, #64748b)",
  divider: "var(--border, #e2e8f0)",
} as const;

/**
 * Categorical palette for the charts.
 *
 * Ordered so adjacent slices stay distinguishable, and long enough that the
 * `i % CHART_COLORS.length` wrap in `PieChart` only kicks in past six
 * categories.
 */
export const CHART_COLORS = [
  "#3b82f6",
  "#7c4dff",
  "#00a9a5",
  "#f4a300",
  "#e2564d",
  "#8e9aaf",
] as const;

/**
 * The titled container shared by `Card`, `PieChart` and `BarChart`.
 *
 * `testid` is required because all three callers pass a distinct one
 * (`declarative-card`, `declarative-pie-chart`, `declarative-bar-chart`).
 * `cardId` is optional — only `Card` passes it, to disambiguate sibling cards
 * by title, per the comment at that call site.
 */
export function CardShell({
  title,
  subtitle,
  testid,
  cardId,
  children,
}: {
  title?: string;
  subtitle?: string;
  testid: string;
  cardId?: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-testid={testid}
      data-card-id={cardId}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card,#fff)] p-4 shadow-sm"
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-sm font-semibold leading-tight text-[var(--foreground)]">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

const BADGE_TONE: Record<string, string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
  error: "border-rose-300 bg-rose-50 text-rose-800",
  info: "border-sky-300 bg-sky-50 text-sky-800",
};

/**
 * The pill `StatusBadge` renders into.
 *
 * `variant` matches the enum in `definitions.ts`
 * (`success | warning | error | info`) so a value the planner is allowed to
 * emit always has a tone. Extra props are spread so the call site's
 * `style` and `data-testid` land on the element.
 */
export function Badge({
  variant = "info",
  className = "",
  children,
  ...rest
}: {
  variant?: "success" | "warning" | "error" | "info";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Omit<ComponentProps<"span">, "children">) {
  return (
    <span
      {...rest}
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        BADGE_TONE[variant] ?? BADGE_TONE.info
      } ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * The control `PrimaryButton` renders into.
 *
 * Deliberately plain: the renderer owns the click handler, because that is
 * where `dispatch` is in scope.
 */
export function Button({
  children,
  className = "",
  ...rest
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...rest}
      className={`w-fit rounded-md bg-[var(--primary,#3b82f6)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground,#fff)] transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}
