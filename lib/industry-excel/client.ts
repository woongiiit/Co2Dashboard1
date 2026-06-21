import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
} from "@/lib/korea-admin-regions";
import type {
  IndustryDashboardQuery,
  IndustryDeepAnalysisQuery,
} from "@/lib/industry-excel/types";

export function buildIndustryDashboardSearchParams(
  filters: IndustryDashboardQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("sido", filters.sidoCode);
  params.set("region", filters.regionLabel);
  params.set("start", filters.periodStart);
  params.set("end", filters.periodEnd);
  params.set("compare", filters.compare);
  params.set("major", filters.majorCode);
  params.set("mid", filters.midCode);
  return params;
}

export const DEFAULT_INDUSTRY_DASHBOARD_QUERY: IndustryDashboardQuery = {
  sidoCode: "all",
  regionLabel: "all",
  periodStart: DEFAULT_PERIOD_START,
  periodEnd: DEFAULT_PERIOD_END,
  compare: "yoy",
  majorCode: "all",
  midCode: "all",
};

export function buildIndustryDeepAnalysisSearchParams(
  filters: IndustryDeepAnalysisQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("region", filters.regionValue);
  params.set("industry", filters.majorCode);
  params.set("compare", filters.compare);
  return params;
}

export const DEFAULT_INDUSTRY_DEEP_ANALYSIS_QUERY = {
  regionValue: "all",
  majorCode: "all",
  compare: "yoy",
} as const;
