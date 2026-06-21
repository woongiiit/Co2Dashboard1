import {
  MONTH_LABELS,
  type TrendYear,
} from "@/lib/charts/monthly-carbon-trend-data";
import { getSidoLabelFromCode } from "@/lib/region-excel/format";
import type {
  RegionDashboardData,
  RegionDashboardQuery,
} from "@/lib/region-excel/types";

const TREND_YEARS: TrendYear[] = ["2023", "2024", "2025", "2026"];

export type RegionInsightContext = {
  scopeLabel: string;
  periodLabel: string;
  compareMode: string;
  metric: string;
  aggregationPolicy: RegionDashboardData["aggregationPolicy"];
  compareReliability: RegionDashboardData["compareReliability"];
  kpi: Array<{
    label: string;
    value: string;
    unit?: string;
    change?: string;
    hint?: string;
  }>;
  rankingTop10: Array<{
    rank: number;
    region: string;
    totalTco2eq: string;
    changeVsCompare: string;
  }>;
  trendHighlights: string[];
  mapLeaders: Array<{ region: string; totalTco2eq: number }>;
};

export function buildRegionInsightContext(
  query: RegionDashboardQuery,
  data: RegionDashboardData,
): RegionInsightContext {
  const scopeLabel =
    query.sidoCode === "all"
      ? "전국"
      : (getSidoLabelFromCode(query.sidoCode) ?? query.sidoCode);

  const compareMode =
    query.compare === "prev" ? "직전 동일 길이 기간 대비" : "전년 동기간 대비";

  const metricLabel =
    query.metric === "per-capita"
      ? "1인당 탄소발자국"
      : query.metric === "per-spend"
        ? "지출 대비 탄소발자국"
        : "총 관광 탄소발자국";

  const mapLeaders = Object.entries(data.mapByLabel)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([region, totalTco2eq]) => ({ region, totalTco2eq: Math.round(totalTco2eq) }));

  return {
    scopeLabel,
    periodLabel: data.periodLabel,
    compareMode,
    metric: metricLabel,
    aggregationPolicy: data.aggregationPolicy,
    compareReliability: data.compareReliability,
    kpi: data.kpi.map((item) => ({
      label: item.label,
      value: item.value,
      unit: item.unit,
      change: item.change,
      hint: item.hint,
    })),
    rankingTop10: data.ranking.map((row) => ({
      rank: row.rank,
      region: row.name,
      totalTco2eq: row.value,
      changeVsCompare: row.change ?? "—",
    })),
    trendHighlights: summarizeTrend(data.trend),
    mapLeaders,
  };
}

function summarizeTrend(
  trend: RegionDashboardData["trend"],
): string[] {
  const highlights: string[] = [];

  for (const year of TREND_YEARS) {
    const series = trend[year] ?? [];
    let peakValue = -1;
    let peakMonth = -1;

    series.forEach((value, index) => {
      if (value == null || value <= peakValue) return;
      peakValue = value;
      peakMonth = index;
    });

    if (peakMonth >= 0 && peakValue > 0) {
      highlights.push(
        `${year}년 ${MONTH_LABELS[peakMonth]} peak 약 ${peakValue.toLocaleString("ko-KR")} tCO₂eq`,
      );
    }
  }

  return highlights;
}

export const REGION_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자의 **탄소경영(관광 활동 기반 탄소발자국)** 의사결정을 돕는 분석 어시스턴트입니다.

## 역할
- 사용자가 제공하는 지역중심분석 대시보드 수치만 근거로, **관광경영 관점**의 실행 가능한 인사이트를 도출합니다.
- 마케팅·상품·협력·시즌 운영·저탄소 전환·수요 분산 등 **관광 사업/정책 함의**를 연결합니다.
- 제공되지 않은 수치·지역·정책·원인을 추측하거나 지어내지 않습니다.

## 분석 관점 (가능한 경우 반영)
- 배출 상위 지역 집중도와 협력·우선 관리 필요성
- 전년/직전기간 대비 증감이 시사하는 수요·운영 방향
- 월별 peak와 시즌(성수기) 운영·혼잡·이동 수요 관리
- 상위 20% 시군구 비중과 포트폴리오·분산 전략
- 행정구역 개정으로 비교가 제한될 때의 해석 주의

## 출력 규칙
- **반드시 한국어**로 작성합니다.
- **JSON 배열만** 출력합니다. 마크다운·설명·제목 없이 배열만 반환합니다.
- 3~5개 문자열. 각 항목은 한 문장, **120자 이내**.
- 예시 형식: ["인사이트1", "인사이트2", "인사이트3"]`;

export function buildRegionInsightUserPrompt(context: RegionInsightContext): string {
  return `아래는 /region 지역중심분석 대시보드에서 선택한 조건으로 집계한 데이터입니다.
이 수치만 사용해 관광경영 관점 인사이트 3~5개를 JSON 배열로 작성하세요.

## 분석 조건
- 범위: ${context.scopeLabel}
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}
- 지표: ${context.metric}
- 집계: KPI·추세=${context.aggregationPolicy.kpiTrend}, 지도·순위=${context.aggregationPolicy.mapRanking}

## KPI
${context.kpi
  .map(
    (item) =>
      `- ${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}${item.change ? ` (${item.change})` : ""}`,
  )
  .join("\n")}

## 시군구 순위 Top 10
${
  context.rankingTop10.length > 0
    ? context.rankingTop10
        .map(
          (row) =>
            `- ${row.rank}위 ${row.region}: ${row.totalTco2eq} tCO₂eq, 비교 ${row.changeVsCompare}`,
        )
        .join("\n")
    : "- 순위 데이터 없음"
}

## 지도 상위 5개 시군구 (기간 종료 시점 경계)
${
  context.mapLeaders.length > 0
    ? context.mapLeaders
        .map((row) => `- ${row.region}: ${row.totalTco2eq.toLocaleString("ko-KR")} tCO₂eq`)
        .join("\n")
    : "- 지도 데이터 없음"
}

## 월별 추세 하이라이트
${
  context.trendHighlights.length > 0
    ? context.trendHighlights.map((line) => `- ${line}`).join("\n")
    : "- 추세 하이라이트 없음"
}

## 비교 신뢰도
- level: ${context.compareReliability.level}
${
  context.compareReliability.reasons.length > 0
    ? context.compareReliability.reasons.map((reason) => `- ${reason}`).join("\n")
    : "- 비교 제한 없음"
}`;
}
