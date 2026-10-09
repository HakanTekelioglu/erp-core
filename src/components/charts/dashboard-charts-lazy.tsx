"use client";

import dynamic from "next/dynamic";

const Charts = dynamic(() => import("./dashboard-charts").then(module => module.DashboardCharts), {
  ssr: false,
  loading: () => <div aria-label="Grafikler yükleniyor" className="grid gap-4 xl:grid-cols-2">{[0, 1].map(index => <div key={index} className="h-[340px] animate-pulse rounded-lg border border-border bg-slate-50" />)}</div>
});

export function DashboardChartsLazy({ data }: { data: Array<{ month: string; sales: number; income: number; expense: number }> }) {
  return <Charts data={data} />;
}
