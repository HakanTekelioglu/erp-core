"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const salesData = [
  { month: "Ocak", sales: 82000 },
  { month: "Subat", sales: 91000 },
  { month: "Mart", sales: 108000 },
  { month: "Nisan", sales: 97000 },
  { month: "Mayis", sales: 124000 },
  { month: "Haziran", sales: 138000 }
];

const incomeExpenseData = [
  { month: "Ocak", income: 82000, expense: 54000 },
  { month: "Subat", income: 91000, expense: 61000 },
  { month: "Mart", income: 108000, expense: 68000 },
  { month: "Nisan", income: 97000, expense: 59000 },
  { month: "Mayis", income: 124000, expense: 76000 },
  { month: "Haziran", income: 138000, expense: 81000 }
];

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

export function DashboardCharts() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Aylik satis grafigi</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
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
            <BarChart data={incomeExpenseData}>
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
