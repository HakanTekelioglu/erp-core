"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TablePagination } from "@/lib/pagination";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  searchPlaceholder?: string;
  pageSize?: number;
  pagination?: TablePagination;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchPlaceholder = "Ara",
  pageSize = 8,
  pagination
}: DataTableProps<T>) {
  const [query, setQuery] = useState(pagination?.query ?? "");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const submittedQuery = useRef<string | null>(null);
  const draftQuery = useRef(query);

  const serverQuery = pagination?.query;
  useEffect(() => {
    if (serverQuery === undefined) return;
    if (submittedQuery.current !== null) {
      if (serverQuery !== submittedQuery.current) return;
      submittedQuery.current = null;
      // A response for earlier keystrokes must not overwrite newer input.
      if (draftQuery.current.trim() !== serverQuery) return;
    }
    draftQuery.current = serverQuery;
    setQuery(serverQuery);
  }, [serverQuery]);

  useEffect(() => {
    if (!pagination || query.trim() === pagination.query) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) params.set(pagination.queryKey, query.trim());
      else params.delete(pagination.queryKey);
      params.delete(pagination.pageKey);
      submittedQuery.current = query.trim();
      startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, pagination, pathname, router, searchParams]);

  function changePage(nextPage: number) {
    if (!pagination) { setPage(nextPage); return; }
    const params = new URLSearchParams(searchParams.toString());
    params.set(pagination.pageKey, String(nextPage));
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  }

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    if (pagination || !normalizedQuery) return rows;

    return rows.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(normalizedQuery)
    );
  }, [query, rows, pagination]);

  const totalCount = pagination?.totalCount ?? filteredRows.length;
  const size = pagination?.pageSize ?? pageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const safePage = Math.min(pagination?.page ?? page, totalPages);
  const paginatedRows = pagination ? rows : filteredRows.slice((safePage - 1) * size, safePage * size);

  return (
    <div aria-busy={isPending} className="surface-card min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              draftQuery.current = event.target.value;
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            maxLength={pagination ? 120 : undefined}
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/80 focus:border-brand/60 focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <span aria-live="polite" className="inline-flex items-center gap-2 text-xs font-medium text-muted">
          {isPending ? (
            <span className="size-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" aria-hidden />
          ) : null}
          {isPending ? "Yukleniyor..." : `${totalCount} kayit`}
        </span>
      </div>
      <div className={isPending ? "overflow-x-auto opacity-60 transition-opacity" : "overflow-x-auto transition-opacity"}>
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs text-muted">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="whitespace-nowrap border-b border-border px-4 py-2.5 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rowIndex) => (
              <tr key={String(row.id ?? rowIndex)} className="border-b border-border/70 transition-colors last:border-0 hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3 align-middle text-ink">
                    {column.render ? column.render(row) : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted">
                  Kayit bulunamadi
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="text-xs font-medium text-muted">
          Sayfa <span className="text-ink">{safePage}</span> / {totalPages}
        </span>
        <div className="flex gap-1.5">
          <Button variant="secondary" className="size-8 min-h-0 p-0" onClick={() => changePage(Math.max(1, safePage - 1))} disabled={safePage === 1 || isPending} aria-label="Onceki sayfa">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" className="size-8 min-h-0 p-0" onClick={() => changePage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages || isPending} aria-label="Sonraki sayfa">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
