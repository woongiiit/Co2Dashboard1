import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
} from "@/lib/korea-admin-regions";
import type { RegionDashboardCompare, RegionDetailQuery } from "@/lib/region-excel/types";

export type RegionDetailFilters = Pick<
  RegionDetailQuery,
  "periodStart" | "periodEnd" | "compare"
>;

export function buildRegionDetailSearchParams(
  regionLabel: string,
  filters: RegionDetailFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("region", regionLabel);
  params.set("start", filters.periodStart);
  params.set("end", filters.periodEnd);
  params.set("compare", filters.compare);
  return params;
}

export const DEFAULT_REGION_DETAIL_FILTERS: RegionDetailFilters = {
  periodStart: DEFAULT_PERIOD_START,
  periodEnd: DEFAULT_PERIOD_END,
  compare: "yoy" satisfies RegionDashboardCompare,
};
