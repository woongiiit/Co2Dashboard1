import type { KpiItem, TableRow } from "@/lib/mock-dashboard-data";
import type { TrendYear } from "@/lib/charts/monthly-carbon-trend-data";
import type { CompareReliability } from "@/lib/region-excel/admin-boundary-types";
import type { RegionTrendSeries } from "@/lib/region-excel/types";

export type IndustryDashboardCompare = "yoy" | "prev";

export type IndustryDashboardQuery = {
  sidoCode: string;
  regionLabel: string;
  periodStart: string;
  periodEnd: string;
  compare: IndustryDashboardCompare;
  majorCode: string;
  midCode: string;
};

export type IndustryMajorItem = {
  name: string;
  value: number;
  share: number;
  color: string;
};

/** 중분류 업종 비교 차트 — IndustryMajorItem과 동일 구조 */
export type IndustryMidItem = IndustryMajorItem;

export type IndustryMonthlyHighlight = {
  monthIndex: number;
  value: number;
  label: string;
};

export type IndustryDashboardData = {
  periodLabel: string;
  kpi: KpiItem[];
  majorIndustries: IndustryMajorItem[];
  midIndustries: IndustryMidItem[];
  midRanking: TableRow[];
  monthlyTrend: RegionTrendSeries;
  monthlyHighlight: IndustryMonthlyHighlight | null;
  boundaryWarnings: string[];
  compareReliability: CompareReliability;
};

export type IndustryDeepAnalysisCompare = "yoy" | "prev";

export type IndustryDeepAnalysisQuery = {
  sidoCode: string;
  regionLabel: string;
  majorCode: string;
  compare: IndustryDeepAnalysisCompare;
};

export type IndustryDeepAnalysisComparisonRow = {
  label: string;
  unit: string;
  values: {
    y2023: string;
    y2024: string;
    y2024Change: string;
    y2024Direction: "up" | "down" | "neutral";
    y2025: string;
    y2025Change: string;
    y2025Direction: "up" | "down" | "neutral";
    y2026: string;
    y2026Change: string;
    y2026Direction: "up" | "down" | "neutral";
  };
};

export type IndustryCompositionBucket = {
  label: string;
  shares: number[];
};

export type IndustryDeepAnalysisData = {
  periodLabel: string;
  scopeLabel: string;
  industryLabel: string;
  kpi: KpiItem[];
  monthlyTrend: RegionTrendSeries;
  composition: {
    industries: Array<{ name: string; color: string }>;
    buckets: IndustryCompositionBucket[];
  };
  yoyGrowth: Record<Exclude<TrendYear, "2023">, (number | null)[]>;
  comparisonRows: IndustryDeepAnalysisComparisonRow[];
  noticeItems: string[];
  boundaryWarnings: string[];
  compareReliability: CompareReliability;
};

export type IndustryInsightsSource = "huggingface" | "fallback";

export type IndustryInsightsResponse = {
  items: string[];
  source: IndustryInsightsSource;
  periodLabel: string;
  model?: string;
  warning?: string;
};

export type IndustryDeepInsightsResponse = {
  items: string[];
  source: IndustryInsightsSource;
  periodLabel: string;
  model?: string;
  warning?: string;
};
