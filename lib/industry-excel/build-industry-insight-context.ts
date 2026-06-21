import type {
  IndustryDashboardData,
  IndustryDashboardQuery,
} from "@/lib/industry-excel/types";
import { formatIndustryScopeLabel } from "@/lib/industry-excel/shared";
import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";

export type IndustryInsightContext = {
  scopeLabel: string;
  periodLabel: string;
  compareMode: string;
  industryLabel: string;
  kpi: Array<{ label: string; value: string; unit?: string; change?: string }>;
  majorTop3: Array<{ name: string; share: string; value: string }>;
  midTop5: Array<{ name: string; value: string; share: string }>;
  compareReliability: IndustryDashboardData["compareReliability"];
};

export function buildIndustryInsightContext(
  query: IndustryDashboardQuery,
  data: IndustryDashboardData,
): IndustryInsightContext {
  const compareMode =
    query.compare === "prev" ? "직전 동일 길이 기간 대비" : "전년 동기간 대비";

  const major = INDUSTRY_CLASSIFICATION.find((item) => item.value === query.majorCode);
  const mid = major?.mid.find((item) => item.value === query.midCode);
  const industryLabel =
    query.midCode !== "all"
      ? (mid?.label ?? "선택 업종")
      : query.majorCode !== "all"
        ? (major?.label ?? "선택 업종")
        : "전체 업종";

  return {
    scopeLabel: formatIndustryScopeLabel(query),
    periodLabel: data.periodLabel,
    compareMode,
    industryLabel,
    kpi: data.kpi.map((item) => ({
      label: item.label,
      value: item.value,
      unit: item.unit,
      change: item.change,
    })),
    majorTop3: data.majorIndustries.slice(0, 3).map((item) => ({
      name: item.name,
      share: `${item.share}%`,
      value: item.value.toLocaleString("ko-KR"),
    })),
    midTop5: data.midRanking.slice(0, 5).map((item) => ({
      name: item.name,
      value: item.value,
      share: item.change ?? "—",
    })),
    compareReliability: data.compareReliability,
  };
}

export const INDUSTRY_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자의 탄소경영 의사결정을 돕는 분석 어시스턴트입니다.

## 출력 규칙
- **반드시 한국어**로 작성합니다.
- **JSON 배열만** 출력합니다. 3~5개 문자열, 각 120자 이내.
- 제공된 수치만 사용하고 추측하지 않습니다.
- 예시: ["인사이트1", "인사이트2", "인사이트3"]`;

export function buildIndustryInsightUserPrompt(
  context: IndustryInsightContext,
): string {
  return `아래는 /industry 업종 중심 분석 데이터입니다. 관광경영 관점 인사이트 3~5개를 JSON 배열로 작성하세요.

## 조건
- 범위: ${context.scopeLabel}
- 업종: ${context.industryLabel}
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}

## KPI
${context.kpi.map((item) => `- ${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}${item.change ? ` (${item.change})` : ""}`).join("\n")}

## 대분류 Top 3
${context.majorTop3.map((item) => `- ${item.name}: ${item.value} tCO₂eq (${item.share})`).join("\n")}

## 중분류 Top 5
${context.midTop5.map((item) => `- ${item.name}: ${item.value} tCO₂eq (${item.share})`).join("\n")}

## 비교 신뢰도
- level: ${context.compareReliability.level}`;
}

export type IndustryDeepInsightContext = {
  scopeLabel: string;
  industryLabel: string;
  periodLabel: string;
  yearlyKpi: Array<{ label: string; value: string; change?: string }>;
  comparison: Array<{ label: string; y2025: string; y2026: string }>;
};

export function buildIndustryDeepInsightContext(
  data: import("@/lib/industry-excel/types").IndustryDeepAnalysisData,
): IndustryDeepInsightContext {
  return {
    scopeLabel: data.scopeLabel,
    industryLabel: data.industryLabel,
    periodLabel: data.periodLabel,
    yearlyKpi: data.kpi.map((item) => ({
      label: item.label,
      value: item.value,
      change: item.change,
    })),
    comparison: data.comparisonRows.map((row) => ({
      label: row.label,
      y2025: row.values.y2025,
      y2026: row.values.y2026,
    })),
  };
}

export const INDUSTRY_DEEP_INSIGHT_SYSTEM_PROMPT = INDUSTRY_INSIGHT_SYSTEM_PROMPT;

export function buildIndustryDeepInsightUserPrompt(
  context: IndustryDeepInsightContext,
): string {
  return `아래는 /industry/deep-analysis 업종 심화 분석 데이터입니다. JSON 배열 3~5개로 작성하세요.

## 조건
- 범위: ${context.scopeLabel}
- 업종: ${context.industryLabel}
- 기간: ${context.periodLabel}

## 연도별 KPI
${context.yearlyKpi.map((item) => `- ${item.label}: ${item.value}${item.change ? ` (${item.change})` : ""}`).join("\n")}

## 지표 비교
${context.comparison.map((row) => `- ${row.label}: 2025 ${row.y2025}, 2026 ${row.y2026}`).join("\n")}`;
}
