import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import type {
  RegionDetailData,
  RegionDetailQuery,
} from "@/lib/region-excel/types";

export type RegionDetailInsightContext = {
  regionLabel: string;
  sidoNm: string;
  periodLabel: string;
  compareMode: string;
  aggregationPolicy: RegionDetailData["aggregationPolicy"];
  compareReliability: RegionDetailData["compareReliability"];
  kpi: Array<{
    label: string;
    value: string;
    unit?: string;
    change?: string;
    hint?: string;
  }>;
  industryTop5: Array<{ name: string; sharePercent: string; tco2eq: string }>;
  comparison: Array<{
    label: string;
    value: string;
    change: string;
  }>;
  monthlyPeaks: string[];
};

export function buildRegionDetailInsightContext(
  query: RegionDetailQuery,
  data: RegionDetailData,
): RegionDetailInsightContext {
  const compareMode =
    query.compare === "prev" ? "직전 동일 길이 기간 대비" : "전년 동기간 대비";

  const monthlyPeaks: string[] = [];
  data.monthlyTrend.selected.forEach((value, index) => {
    if (value == null || value <= 0) return;
    const isPeak = data.monthlyTrend.selected.every(
      (other, otherIndex) =>
        otherIndex === index || other == null || value >= other,
    );
    if (isPeak) {
      monthlyPeaks.push(
        `${MONTH_LABELS[index]} 약 ${value.toLocaleString("ko-KR")} tCO₂eq`,
      );
    }
  });

  return {
    regionLabel: data.regionLabel,
    sidoNm: data.sidoNm,
    periodLabel: data.periodLabel,
    compareMode,
    aggregationPolicy: data.aggregationPolicy,
    compareReliability: data.compareReliability,
    kpi: data.kpi.map((item) => ({
      label: item.label,
      value: item.value,
      unit: item.unit,
      change: item.change,
      hint: item.hint,
    })),
    industryTop5: data.industryComposition.slice(0, 5).map((item) => ({
      name: item.name,
      sharePercent: `${item.share.toFixed(1)}%`,
      tco2eq: item.value.toLocaleString("ko-KR"),
    })),
    comparison: data.comparison.map((item) => ({
      label: item.label,
      value: item.value.toLocaleString("ko-KR"),
      change: `${item.changeDirection === "up" ? "▲" : "▼"} ${item.changePercent}%`,
    })),
    monthlyPeaks: monthlyPeaks.slice(0, 3),
  };
}

export const REGION_DETAIL_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자의 **탄소경영(관광 활동 기반 탄소발자국)** 의사결정을 돕는 분석 어시스턴트입니다.

## 역할
- 지역 상세 분석 대시보드 수치만 근거로, **지역 평가·여행자 시사점·지자체 시사점**을 각각 도출합니다.
- 제공되지 않은 수치·지역·정책·원인을 추측하거나 지어내지 않습니다.

## 출력 규칙
- **반드시 한국어**로 작성합니다.
- **JSON 객체만** 출력합니다. 마크다운·설명 없이 객체만 반환합니다.
- 키: evaluation, traveler, policy — 각각 문자열 배열(2~3개, 항목당 120자 이내).
- 예시: {"evaluation":["...","..."],"traveler":["..."],"policy":["...","..."]}`;

export function buildRegionDetailInsightUserPrompt(
  context: RegionDetailInsightContext,
): string {
  return `아래는 /region/[시군구] 지역 상세 분석 대시보드 데이터입니다.
이 수치만 사용해 evaluation·traveler·policy 각 2~3개 문장을 JSON 객체로 작성하세요.

## 분석 조건
- 지역: ${context.regionLabel} (${context.sidoNm})
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}
- 집계: KPI·추세=${context.aggregationPolicy.kpiTrend}, 지도=${context.aggregationPolicy.mapRanking}

## KPI
${context.kpi
  .map(
    (item) =>
      `- ${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}${item.change ? ` (${item.change})` : ""}`,
  )
  .join("\n")}

## 업종 구성 Top 5
${
  context.industryTop5.length > 0
    ? context.industryTop5
        .map((row) => `- ${row.name}: ${row.tco2eq} tCO₂eq (${row.sharePercent})`)
        .join("\n")
    : "- 업종 데이터 없음"
}

## 비교 분석
${
  context.comparison.length > 0
    ? context.comparison
        .map((row) => `- ${row.label}: ${row.value} tCO₂eq, ${row.change}`)
        .join("\n")
    : "- 비교 데이터 없음"
}

## 월별 peak (선택 지역)
${
  context.monthlyPeaks.length > 0
    ? context.monthlyPeaks.map((line) => `- ${line}`).join("\n")
    : "- peak 정보 없음"
}

## 비교 신뢰도
- level: ${context.compareReliability.level}
${
  context.compareReliability.reasons.length > 0
    ? context.compareReliability.reasons.map((reason) => `- ${reason}`).join("\n")
    : "- 비교 제한 없음"
}`;
}
