"use client";

/**
 * The bar chart the Components-as-Tools page registers.
 *
 * The page says the example "uses Recharts for the bar chart; it doesn't know
 * anything about CopilotKit" — and then shows neither the component nor the
 * Zod schema it names as `barChartPropsSchema`. Only the `useComponent` call
 * is published. Both are written here from that one sentence.
 *
 * It is deliberately CopilotKit-free, which is the page's actual point: the
 * component receives typed props and nothing else.
 */

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

export const barChartPropsSchema = z.object({
  title: z.string().describe("Heading shown above the chart."),
  data: z
    .array(
      z.object({
        label: z.string().describe("Category name on the x axis."),
        value: z.number().describe("Numeric height of the bar."),
      }),
    )
    .describe("One entry per bar."),
});

export type BarChartProps = z.infer<typeof barChartPropsSchema>;

export function BarChart({ title, data }: BarChartProps) {
  const rows = Array.isArray(data) ? data.filter((d) => d && d.label) : [];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title ?? "Untitled chart"}
      </h3>
      <div className="mt-3 h-56 w-full">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-500">Waiting for data…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
