"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardChartPoint = {
  month: string;
  sales: number;
  income: number;
  expense: number;
};

const chartColors = {
  axis: "rgb(var(--color-muted))",
  grid: "rgb(var(--color-border) / 0.7)",
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
  borderRadius: 10,
  color: chartColors.ink,
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 12px 32px -8px rgb(0 0 0 / 0.18)"
};

const seriesLabels: Record<string, string> = {
  sales: "Satis",
  income: "Gelir",
  expense: "Gider"
};

function formatTooltipValue(value: unknown, name: unknown): [string, string] {
  const numeric = typeof value === "number" ? value : Number(value);
  const formatted = Number.isFinite(numeric)
    ? numeric.toLocaleString("tr-TR", { maximumFractionDigits: 2 })
    : String(value);
  return [formatted, seriesLabels[String(name)] ?? String(name)];
}

function formatAxisValue(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}B`;
  return String(value);
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {label}
    </span>
  );
}

export function DashboardCharts({ data }: { data: DashboardChartPoint[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="surface-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Aylik satis grafigi</h2>
            <p className="mt-0.5 text-xs text-muted">Aylara gore toplam satis tutari</p>
          </div>
          <LegendDot color={chartColors.brand} label="Satis" />
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="salesAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.brand} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={chartColors.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatAxisValue} width={56} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: chartColors.ink, fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: chartColors.ink }}
                cursor={{ stroke: chartColors.border, strokeWidth: 1 }}
                formatter={formatTooltipValue}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={chartColors.brand}
                strokeWidth={2.5}
                fill="url(#salesAreaFill)"
                dot={false}
                activeDot={{ r: 5, fill: chartColors.brand, stroke: chartColors.panel, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="surface-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Gelir gider grafigi</h2>
            <p className="mt-0.5 text-xs text-muted">Aylik gelir ve gider karsilastirmasi</p>
          </div>
          <div className="flex items-center gap-3">
            <LegendDot color={chartColors.success} label="Gelir" />
            <LegendDot color={chartColors.danger} label="Gider" />
          </div>
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatAxisValue} width={56} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: chartColors.ink, fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: chartColors.ink }}
                cursor={{ fill: "rgb(var(--color-border) / 0.35)" }}
                formatter={formatTooltipValue}
              />
              <Bar dataKey="income" fill={chartColors.success} radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill={chartColors.danger} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
