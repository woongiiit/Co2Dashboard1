import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
  KOREA_SIDO_OPTIONS,
} from "@/lib/korea-admin-regions";
import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";
import type {
  IndustryDashboardQuery,
  IndustryDeepAnalysisQuery,
} from "@/lib/industry-excel/types";
import { resolveDeepAnalysisRegionLabel } from "@/lib/industry-excel/excel-columns";

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

export const DEFAULT_INDUSTRY_DEEP_ANALYSIS_QUERY: IndustryDeepAnalysisQuery = {
  sidoCode: "all",
  regionLabel: "all",
  majorCode: "all",
  compare: "yoy",
};

export function buildIndustryDeepAnalysisSearchParams(
  filters: IndustryDeepAnalysisQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("sido", filters.sidoCode);
  params.set("region", filters.regionLabel);
  params.set("industry", filters.majorCode);
  params.set("compare", filters.compare);
  return params;
}

function inferSidoCodeFromRegionLabel(regionLabel: string): string | null {
  const match = KOREA_SIDO_OPTIONS.find(
    (option) => option.value !== "all" && regionLabel.startsWith(option.label),
  );
  return match?.value ?? null;
}

/** 구 심화분석 URL(region=jeju-jeju 등) 및 regionLabel 단독 전달 호환 */
export function normalizeDeepAnalysisRegionParams(
  sidoCode: string,
  regionParam: string,
): Pick<IndustryDeepAnalysisQuery, "sidoCode" | "regionLabel"> {
  const legacyLabel = resolveDeepAnalysisRegionLabel(regionParam);
  if (legacyLabel) {
    const inferred = inferSidoCodeFromRegionLabel(legacyLabel);
    return {
      sidoCode: inferred ?? sidoCode,
      regionLabel: legacyLabel,
    };
  }

  if (regionParam !== "all" && sidoCode === "all") {
    return {
      sidoCode: inferSidoCodeFromRegionLabel(regionParam) ?? "all",
      regionLabel: regionParam,
    };
  }

  return {
    sidoCode: sidoCode,
    regionLabel: regionParam,
  };
}

export function parseIndustryDeepAnalysisQuery(
  searchParams: URLSearchParams,
): IndustryDeepAnalysisQuery {
  const compare = searchParams.get("compare");
  const { sidoCode, regionLabel } = normalizeDeepAnalysisRegionParams(
    searchParams.get("sido") ?? "all",
    searchParams.get("region") ?? "all",
  );

  return {
    sidoCode,
    regionLabel,
    majorCode: searchParams.get("industry") ?? DEFAULT_INDUSTRY_DEEP_ANALYSIS_QUERY.majorCode,
    compare: compare === "prev" ? "prev" : "yoy",
  };
}

/** @deprecated parseIndustryDeepAnalysisQuery 사용 */
export const parseIndustryDeepAnalysisFiltersFromSearchParams =
  parseIndustryDeepAnalysisQuery;

/** 업종 중심 분석 필터 → 심화분석 필터 (중분류 선택 시 해당 대분류로 매핑) */
export function mapDashboardQueryToDeepAnalysis(
  query: IndustryDashboardQuery,
): IndustryDeepAnalysisQuery {
  let majorCode = query.majorCode;

  if (query.midCode !== "all") {
    const parentMajor = INDUSTRY_CLASSIFICATION.find((major) =>
      major.mid.some((mid) => mid.value === query.midCode),
    );
    if (parentMajor) {
      majorCode = parentMajor.value;
    }
  }

  return {
    sidoCode: query.sidoCode,
    regionLabel: query.regionLabel,
    majorCode,
    compare: query.compare,
  };
}

export function buildIndustryDeepAnalysisHref(
  dashboardQuery: IndustryDashboardQuery,
): string {
  const deepQuery = mapDashboardQueryToDeepAnalysis(dashboardQuery);
  const params = buildIndustryDeepAnalysisSearchParams(deepQuery);
  return `/industry/deep-analysis?${params.toString()}`;
}
