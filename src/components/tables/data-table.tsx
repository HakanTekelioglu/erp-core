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
    <div aria-busy={isPending} className="min-w-0 rounded-lg border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-sm">
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
            className="min-h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <span aria-live="polite" className="text-sm font-medium text-muted">{isPending ? "Yukleniyor..." : `${totalCount} kayit`}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-muted">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="border-b border-border px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rowIndex) => (
              <tr key={String(row.id ?? rowIndex)} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3 align-middle text-ink">
                    {column.render ? column.render(row) : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-3 py-3">
        <span className="text-sm text-muted">
          Sayfa {safePage} / {totalPages}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" className="size-9 p-0" onClick={() => changePage(Math.max(1, safePage - 1))} disabled={safePage === 1 || isPending} aria-label="Onceki sayfa">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" className="size-9 p-0" onClick={() => changePage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages || isPending} aria-label="Sonraki sayfa">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
