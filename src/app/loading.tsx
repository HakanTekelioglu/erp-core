export default function Loading() {
  return (
    <div className="grid gap-4 p-4">
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-8 w-32 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-3 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
