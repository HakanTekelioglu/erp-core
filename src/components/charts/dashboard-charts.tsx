"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardChartPoint = {
  month: string;
  sales: number;
  income: number;
  expense: number;
};

const chartColors = {
  axis: "rgb(var(--color-muted))",
  grid: "rgb(var(--color-border) / 0.55)",
  panel: "rgb(var(--color-panel))",
  ink: "rgb(var(--color-ink))",
  border: "rgb(var(--color-border))",
  brand: "rgb(var(--color-brand))",
  success: "rgb(var(--color-success))",
  danger: "rgb(var(--color-danger))"
};

const axisStyle = {
  fontSize: 12,
  fill: chartColors.axis
};

const tooltipStyle = {
  backgroundColor: chartColors.panel,
  border: `1px solid ${chartColors.border}`,
  borderRadius: 8,
  color: chartColors.ink,
  boxShadow: "0 12px 28px rgb(2 6 23 / 0.18)"
};

export function DashboardCharts({ data }: { data: DashboardChartPoint[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Aylik satis grafigi</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: chartColors.border }} tickLine={{ stroke: chartColors.border }} />
              <YAxis tick={axisStyle} axisLine={{ stroke: chartColors.border }} tickLine={{ stroke: chartColors.border }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: chartColors.ink }} itemStyle={{ color: chartColors.ink }} />
              <Line type="monotone" dataKey="sales" stroke={chartColors.brand} strokeWidth={3} dot={{ r: 4, fill: chartColors.panel, strokeWidth: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Gelir gider grafigi</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: chartColors.border }} tickLine={{ stroke: chartColors.border }} />
              <YAxis tick={axisStyle} axisLine={{ stroke: chartColors.border }} tickLine={{ stroke: chartColors.border }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: chartColors.ink }} itemStyle={{ color: chartColors.ink }} />
              <Bar dataKey="income" fill={chartColors.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill={chartColors.danger} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
