import type { KpiItem, TableRow } from "@/lib/mock-dashboard-data";
import type { TrendYear } from "@/lib/charts/monthly-carbon-trend-data";
import type {
  CompareReliability,
} from "@/lib/region-excel/admin-boundary-types";

export type RegionDashboardCompare = "yoy" | "prev";
export type RegionDashboardMetric = "total" | "per-capita" | "per-spend";

export type RegionDashboardQuery = {
  sidoCode: string;
  periodStart: string;
  periodEnd: string;
  compare: RegionDashboardCompare;
  metric: RegionDashboardMetric;
};

export type RegionExcelRow = {
  sidoNm: string;
  sggNm: string;
  regionLabel: string;
  year: number;
  month: number;
  ym: string;
  carbonRaw: number;
  carbonIndex: number;
  industries?: Record<string, number>;
};

export type RegionDetailQuery = {
  regionLabel: string;
  periodStart: string;
  periodEnd: string;
  compare: RegionDashboardCompare;
};

export type RegionDetailIndustryShare = {
  name: string;
  value: number;
  share: number;
};

export type RegionDetailComparisonItem = {
  label: string;
  value: number;
  changePercent: number;
  changeDirection: "up" | "down";
};

export type RegionDetailMonthlyTrend = {
  months: string[];
  selected: (number | null)[];
  prevYearSameMonth: (number | null)[];
  nationalAvg: (number | null)[];
  sidoAvg: (number | null)[];
  seriesLabels: {
    selected: string;
    sido: string;
  };
};

export type RegionDetailData = {
  regionLabel: string;
  sidoNm: string;
  periodLabel: string;
  kpi: KpiItem[];
  mapValue: number;
  monthlyTrend: RegionDetailMonthlyTrend;
  comparison: RegionDetailComparisonItem[];
  industryComposition: RegionDetailIndustryShare[];
  industryRanking: TableRow[];
  mapByLabel: Record<string, number>;
  boundaryWarnings: string[];
  compareReliability: CompareReliability;
  aggregationPolicy: RegionAggregationPolicy;
};

export type RegionDetailInsightsSections = {
  evaluation: string[];
  traveler: string[];
  policy: string[];
};

export type RegionDetailInsightsResponse = {
  sections: RegionDetailInsightsSections;
  source: RegionInsightsSource;
  periodLabel: string;
  model?: string;
  warning?: string;
};

export type RegionTrendSeries = Record<TrendYear, (number | null)[]>;

export type RegionAggregationPolicy = {
  kpiTrend: "point_in_time";
  mapRanking: "as_of_period_end";
};

export type RegionDashboardData = {
  periodLabel: string;
  kpi: KpiItem[];
  ranking: TableRow[];
  trend: RegionTrendSeries;
  mapByLabel: Record<string, number>;
  boundaryWarnings: string[];
  compareReliability: CompareReliability;
  aggregationPolicy: RegionAggregationPolicy;
};

export type RegionInsightsSource = "huggingface" | "fallback";

export type RegionInsightsResponse = {
  items: string[];
  source: RegionInsightsSource;
  periodLabel: string;
  model?: string;
  warning?: string;
};
