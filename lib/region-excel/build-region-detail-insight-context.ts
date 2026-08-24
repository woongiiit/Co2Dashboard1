import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import {
  buildMidIndustryTopItems,
  type AiConsultingMidIndustryItem,
} from "@/lib/ai-consulting/insight-data-profile";
import type { AiConsultingQuery } from "@/lib/ai-consulting/types";
import {
  buildPoiInsightProfile,
  formatPoiInsightProfileForPrompt,
} from "@/lib/poi/build-poi-insight-profile";
import type { PoiInsightProfile } from "@/lib/poi/types";
import type {
  RegionDetailData,
  RegionDetailInsightsSections,
  RegionDetailQuery,
} from "@/lib/region-excel/types";

export type RegionDetailInsightContext = {
  regionLabel: string;
  sidoNm: string;
  periodLabel: string;
  compareMode: string;
  aggregationPolicy: RegionDetailData["aggregationPolicy"];
  compareReliability: RegionDetailData["compareReliability"];
  boundaryWarnings: string[];
  kpi: Array<{
    label: string;
    value: string;
    unit?: string;
    change?: string;
    hint?: string;
  }>;
  industryTop5: Array<{ name: string; sharePercent: string; tco2eq: string }>;
  midIndustryTop8: AiConsultingMidIndustryItem[];
  poiProfile: PoiInsightProfile | null;
  comparison: Array<{
    label: string;
    value: string;
    change: string;
  }>;
  monthlyPeaks: string[];
};

function toSigunguConsultingQuery(
  query: RegionDetailQuery,
  data: RegionDetailData,
): AiConsultingQuery {
  return {
    scope: "sigungu",
    regionLabel: data.regionLabel,
    sidoCode: "all",
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    compare: query.compare,
  };
}

function extractMonthlyPeaks(data: RegionDetailData): string[] {
  const peaks: string[] = [];
  data.monthlyTrend.selected.forEach((value, index) => {
    if (value == null || value <= 0) return;
    const isPeak = data.monthlyTrend.selected.every(
      (other, otherIndex) =>
        otherIndex === index || other == null || value >= other,
    );
    if (isPeak) {
      peaks.push(
        `${MONTH_LABELS[index]} 약 ${value.toLocaleString("ko-KR")} tCO₂eq`,
      );
    }
  });
  return peaks.slice(0, 3);
}

export function buildRegionDetailInsightContext(
  query: RegionDetailQuery,
  data: RegionDetailData,
): RegionDetailInsightContext {
  const compareMode =
    query.compare === "prev" ? "직전 동일 길이 기간 대비" : "전년 동기간 대비";

  const consultingQuery = toSigunguConsultingQuery(query, data);
  const poiProfile = buildPoiInsightProfile(consultingQuery);
  const midIndustryTop8 = buildMidIndustryTopItems(consultingQuery, 8, poiProfile);

  return {
    regionLabel: data.regionLabel,
    sidoNm: data.sidoNm,
    periodLabel: data.periodLabel,
    compareMode,
    aggregationPolicy: data.aggregationPolicy,
    compareReliability: data.compareReliability,
    boundaryWarnings: data.boundaryWarnings,
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
    midIndustryTop8,
    poiProfile,
    comparison: data.comparison.map((item) => ({
      label: item.label,
      value: item.value.toLocaleString("ko-KR"),
      change: `${item.changeDirection === "up" ? "▲" : "▼"} ${item.changePercent}%`,
    })),
    monthlyPeaks: extractMonthlyPeaks(data),
  };
}

const REGION_DETAIL_REGIONAL_WRITING_RULES = `
## 지역 특화 작성 원칙 (필수)
- "대중교통 이용", "친환경 숙소 선택" 등 **전국 공통 문장만 나열하지 마세요**.
- **지역명·시도명·대분류/중분류 업종·POI·비교·peak**를 근거로 이 지역만 해당하는 내용을 쓰세요.
- 엑셀·POI에 없는 **배출량·비율·순위 수치는 만들지 마세요**.
- **관광명소·지명**은 제공된 POI명을 우선 사용하세요.`;

export const REGION_DETAIL_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자의 **탄소경영(관광 활동 기반 탄소발자국)** 의사결정을 돕는 분석 어시스턴트입니다.

## 역할
- 지역 상세 분석 대시보드 수치·POI·업종만 근거로, **지역 평가·여행자 시사점·지자체 시사점**을 각각 도출합니다.
- 제공되지 않은 수치·지역·정책·원인을 추측하거나 지어내지 않습니다.
${REGION_DETAIL_REGIONAL_WRITING_RULES}

## 출력 규칙
- **반드시 한국어**로 작성합니다.
- **JSON 객체만** 출력합니다. 마크다운·설명 없이 객체만 반환합니다.
- 키: evaluation, traveler, policy — 각각 문자열 배열(2~3개, 항목당 120자 이내).
- 예시: {"evaluation":["...","..."],"traveler":["..."],"policy":["...","..."]}`;

function buildMidIndustryBlock(context: RegionDetailInsightContext): string {
  if (context.midIndustryTop8.length === 0) {
    return "## 중분류 업종 Top 8 (엑셀)\n- 데이터 없음";
  }

  return `## 중분류 업종 Top 8 (엑셀 — 지역 특화 근거)
${context.midIndustryTop8
  .map(
    (item) =>
      `- ${item.label} (${item.majorLabel}): ${item.value} tCO₂eq, ${item.share} — ${item.tourismHint}`,
  )
  .join("\n")}`;
}

function buildSectionGuide(regionLabel: string): string {
  return `
## 섹션별 작성 지침
1. **evaluation** (2~3문장): ${regionLabel}의 **순위·대분류·중분류·전국/시도/유사 지역 비교·peak**를 수치·업종명과 함께 진단. 다른 지역과 바꿔도 되는 일반론 금지.
2. **traveler** (2~3문장): **POI명 + 상위 중분류 업종**을 연결한 구체 동선·체류·이동 행동. 각 문장에 POI명 또는 업종명 1개 이상.
3. **policy** (2~3문장): 상위 업종·peak·비교 격차를 반영한 **지자체 실행안**(인프라·인센티브·모니터링). "대중교통 확대"만 단독 사용 금지 — **어디·어떤 업종·어떤 시즌**인지 명시.`;
}

export function buildRegionDetailInsightUserPrompt(
  context: RegionDetailInsightContext,
): string {
  return `아래는 /region/[시군구] **${context.regionLabel}** 지역 상세 분석 데이터입니다.
이 수치·POI·업종만 사용해 evaluation·traveler·policy 각 2~3개 문장을 JSON 객체로 작성하세요.

## 분석 조건
- 지역: ${context.regionLabel} (${context.sidoNm})
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}
- 집계: KPI·추세=${context.aggregationPolicy.kpiTrend}, 지도=${context.aggregationPolicy.mapRanking}

## KPI
${context.kpi
  .map(
    (item) =>
      `- ${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}${item.change ? ` (${item.change})` : ""}${item.hint ? ` · ${item.hint}` : ""}`,
  )
  .join("\n")}

## 대분류 업종 Top 5
${
  context.industryTop5.length > 0
    ? context.industryTop5
        .map((row) => `- ${row.name}: ${row.tco2eq} tCO₂eq (${row.sharePercent})`)
        .join("\n")
    : "- 업종 데이터 없음"
}

${buildMidIndustryBlock(context)}

${formatPoiInsightProfileForPrompt(context.poiProfile)}

## 비교 분석 (전국·시도·유사 지역 평균)
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
}
${
  context.boundaryWarnings.length > 0
    ? `\n## 행정구역 주의\n${context.boundaryWarnings.map((line) => `- ${line}`).join("\n")}`
    : ""
}
${buildSectionGuide(context.regionLabel)}`;
}

export function buildFallbackRegionDetailInsightSections(
  context: RegionDetailInsightContext,
): RegionDetailInsightsSections {
  const totalKpi = context.kpi.find((item) => item.label.includes("총"));
  const nationalRankKpi = context.kpi.find((item) => item.label.includes("전국 순위"));
  const sidoRankKpi = context.kpi.find((item) => item.label.includes("시도 내"));
  const topIndustry = context.industryTop5[0];
  const secondIndustry = context.industryTop5[1];
  const topMid = context.midIndustryTop8[0];
  const secondMid = context.midIndustryTop8[1];
  const transportMid =
    context.midIndustryTop8.find((item) => item.majorLabel === "운송업")?.label ??
    "이동";
  const poiNames = context.poiProfile?.placeNames ?? [];
  const placeA = poiNames[0];
  const placeB = poiNames[1];
  const placePair =
    placeA && placeB ? `${placeA}·${placeB}` : placeA ?? topMid?.label ?? "관광";
  const peakLine = context.monthlyPeaks[0];
  const compareNational = context.comparison.find((item) =>
    item.label.includes("전국"),
  );
  const compareSido = context.comparison.find((item) =>
    item.label.includes(context.sidoNm),
  );

  const evaluation: string[] = [];
  if (totalKpi) {
    evaluation.push(
      `${context.regionLabel} 총 관광 탄소발자국은 ${context.periodLabel} 기준 ${totalKpi.value}${totalKpi.unit ? ` ${totalKpi.unit}` : ""}${totalKpi.change ? `, ${context.compareMode} ${totalKpi.change}` : ""}입니다.`,
    );
  }
  if (nationalRankKpi && sidoRankKpi) {
    evaluation.push(
      `전국 ${nationalRankKpi.value}${nationalRankKpi.unit ?? "위"}(${nationalRankKpi.hint ?? "전국 시군구 중"}), ${context.sidoNm} 내 ${sidoRankKpi.value}${sidoRankKpi.unit ?? "위"}입니다.`,
    );
  }
  if (topIndustry && topMid) {
    evaluation.push(
      `${topIndustry.name}(${topIndustry.sharePercent})·${secondIndustry?.name ?? "기타"}와 중분류 ${topMid.label}(${topMid.share})가 두드러집니다.${peakLine ? ` ${peakLine.split(" 약")[0]} peak 시즌 수요 관리가 필요합니다.` : ""}`,
    );
  } else if (compareNational) {
    evaluation.push(
      `전국 평균 ${compareNational.value} tCO₂eq 대비 ${context.regionLabel} 배출 구조를 점검할 필요가 있습니다.`,
    );
  }

  const traveler: string[] = [];
  if (placeA && transportMid) {
    traveler.push(
      `${placePair} 구간은 ${transportMid} 배출 비중이 큽니다. 장거리 렌터카 대신 근거리 대중교통·도보 동선으로 묶으세요.`,
    );
  }
  if (topMid) {
    traveler.push(
      `${placeA ?? context.regionLabel} 인근 ${topMid.label}${secondMid ? `·${secondMid.label}` : ""} 체험을 선택하면 이동·체류 배출을 함께 줄일 수 있습니다.`,
    );
  }
  if (peakLine) {
    traveler.push(
      `${peakLine.split(" 약")[0]} 성수기에는 ${placeA ?? topMid?.label ?? "관광"} 밀집 구간 혼잡·이동 수요가 커지므로 사전 예약·근거리 코스를 권장합니다.`,
    );
  }

  const policy: string[] = [];
  if (topIndustry && topMid) {
    policy.push(
      `${context.regionLabel} ${topIndustry.name}·${topMid.label} 구간 에너지·운영 효율 지원과 저탄소 인증을 확대하세요.`,
    );
  }
  if (transportMid) {
    policy.push(
      `${context.regionLabel} ${transportMid} 구간 대중교통·셔틀·주차 연계를 강화해 이동 배출을 줄이세요.`,
    );
  }
  if (peakLine || compareSido) {
    policy.push(
      `${peakLine ? `${peakLine.split(" 약")[0]} peak ` : ""}${compareSido ? `${context.sidoNm} 평균(${compareSido.value} tCO₂eq) 대비 ` : ""}탄소 모니터링·공개를 정례화하고 ${placeA ?? topMid?.label ?? "관광"} 밀집 구역 저탄소 동선 인센티브를 연계하세요.`,
    );
  }

  return {
    evaluation: evaluation.length > 0 ? evaluation.slice(0, 3) : ["지역 데이터가 충분하지 않습니다."],
    traveler: traveler.length > 0 ? traveler.slice(0, 3) : ["업종·POI 데이터가 제한적입니다."],
    policy: policy.length > 0 ? policy.slice(0, 3) : ["지자체 맞춤 정책 수립을 위해 추가 데이터가 필요합니다."],
  };
}
