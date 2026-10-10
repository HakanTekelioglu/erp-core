"use client";

import dynamic from "next/dynamic";

const Charts = dynamic(() => import("./dashboard-charts").then(module => module.DashboardCharts), {
  ssr: false,
  loading: () => <div aria-label="Grafikler yükleniyor" className="grid gap-4 xl:grid-cols-2">{[0, 1].map(index => <div key={index} className="h-[386px] animate-pulse surface-card" />)}</div>
});

export function DashboardChartsLazy({ data }: { data: Array<{ month: string; sales: number; income: number; expense: number }> }) {
  return <Charts data={data} />;
}
