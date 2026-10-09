export type ListSearchParams = Record<string, string | string[] | undefined>;

export type PaginationRequest = {
  page: number;
  query: string;
  pageSize: number;
  pageKey: string;
  queryKey: string;
};

export type TablePagination = PaginationRequest & { totalCount: number };

export function parsePagination(params: ListSearchParams = {}, prefix = ""): PaginationRequest {
  const pageKey = prefix ? `${prefix}Page` : "page";
  const queryKey = prefix ? `${prefix}Query` : "q";
  const pageValue = params[pageKey];
  const queryValue = params[queryKey];
  const page = Number(Array.isArray(pageValue) ? pageValue[0] : pageValue);
  return {
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000000) : 1,
    query: (Array.isArray(queryValue) ? queryValue[0] : queryValue ?? "").trim().slice(0, 120),
    pageSize: 8,
    pageKey,
    queryKey
  };
}

export function escapeLike(query: string) {
  return query.toLocaleLowerCase("tr-TR").replace(/[\\%_]/g, "\\$&");
}
