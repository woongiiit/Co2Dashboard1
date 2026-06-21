import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
} from "@/lib/korea-admin-regions";
import type { RegionDashboardQuery } from "@/lib/region-excel/types";

export function buildRegionDashboardSearchParams(
  filters: RegionDashboardQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("sido", filters.sidoCode);
  params.set("start", filters.periodStart);
  params.set("end", filters.periodEnd);
  params.set("compare", filters.compare);
  params.set("metric", filters.metric);
  return params;
}

export const DEFAULT_REGION_DASHBOARD_QUERY: RegionDashboardQuery = {
  sidoCode: "all",
  periodStart: DEFAULT_PERIOD_START,
  periodEnd: DEFAULT_PERIOD_END,
  compare: "yoy",
  metric: "total",
};
