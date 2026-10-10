export default function Loading() {
  return (
    <div className="grid gap-4 p-4" aria-busy="true" aria-label="Yukleniyor">
      <div className="pb-2 pt-2 md:pt-4">
        <div className="h-7 w-48 animate-pulse rounded-md bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-md bg-slate-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="surface-card p-5">
            <div className="flex items-center gap-3">
              <div className="size-9 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-slate-100" />
            </div>
            <div className="mt-4 h-7 w-32 animate-pulse rounded-md bg-slate-100" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="surface-card p-5">
        <div className="h-5 w-40 animate-pulse rounded-md bg-slate-100" />
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
