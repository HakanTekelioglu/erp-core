import { unstable_cache } from "next/cache";
import { getDashboardReport, getReportsOverview } from "@/services/report-service";

export const REPORT_CACHE_TAG = "erp-reports";
// Company-wide report data is identical for all authorized roles; sessions are never cached.
export const getCachedDashboardReport = unstable_cache(getDashboardReport, ["dashboard-report-v1"], { tags: [REPORT_CACHE_TAG], revalidate: 30 });
export const getCachedReportsOverview = unstable_cache(getReportsOverview, ["reports-overview-v1"], { tags: [REPORT_CACHE_TAG], revalidate: 30 });
