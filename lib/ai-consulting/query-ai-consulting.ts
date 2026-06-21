import type { KpiItem } from "@/lib/mock-dashboard-data";
import { getAiConsultingKpiIconSrc } from "@/lib/ai-consulting-kpi-icons";
import { getMajorIndustryDefinitions } from "@/lib/industry-excel/excel-columns";
import { sumIndustryColumns } from "@/lib/industry-excel/shared";
import {
  formatChangePercent,
  formatDecimal,
  formatInteger,
} from "@/lib/region-excel/format";
import { loadRegionExcelRows } from "@/lib/region-excel/load-region-data";
import { filterRowsPointInTime } from "@/lib/region-excel/resolve-admin-boundary";
import {
  parseRegionDetailQuery,
  queryRegionDetail,
} from "@/lib/region-excel/query-region-detail";
import type {
  AiConsultingDashboardData,
  AiConsultingInsightsSections,
  AiConsultingQuery,
  AiConsultingRadarData,
  SectorEmissionItem,
  TravelerGuideItem,
} from "@/lib/ai-consulting/types";
import { KOREA_SIDO_OPTIONS } from "@/lib/korea-admin-regions";

const RADAR_INDICATORS = [
  "총 배출량",
  "1인당 배출",
  "산업 집중도",
  "증가 추세",
  "감축 잠재력",
] as const;

const TRAVELER_GUIDE_TITLES: Record<TravelerGuideItem["id"], string> = {
  transport: "이동 · 교통",
  lodging: "숙박",
  food: "식음 · 쇼핑",
  waste: "자원 · 폐기물",
  activity: "체험 · 활동",
};

export function parseAiConsultingQuery(
  searchParams: URLSearchParams,
): AiConsultingQuery {
  const region = searchParams.get("region")?.trim();
  if (!region || region === "all") {
    throw new Error("AI 컨설팅은 시군구를 선택해야 합니다.");
  }

  return {
    regionLabel: region,
    periodStart: searchParams.get("start") ?? "2023-01",
    periodEnd: searchParams.get("end") ?? "2026-04",
    compare: searchParams.get("compare") === "prev" ? "prev" : "yoy",
  };
}

function resolveRegionLabelFromFilters(
  sidoCode: string,
  sigunguValue: string,
): string {
  if (sigunguValue !== "all") return sigunguValue;
  throw new Error("시군구를 선택해 주세요.");
}

export function buildAiConsultingQueryFromFilters(input: {
  sidoCode: string;
  sigunguValue: string;
  periodStart: string;
  periodEnd: string;
}): AiConsultingQuery {
  return {
    regionLabel: resolveRegionLabelFromFilters(input.sidoCode, input.sigunguValue),
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    compare: "yoy",
  };
}

function buildSectorEmission(query: AiConsultingQuery): SectorEmissionItem[] {
  const rows = loadRegionExcelRows().filter(
    (row) =>
      row.regionLabel === query.regionLabel &&
      row.ym >= query.periodStart &&
      row.ym <= query.periodEnd,
  );
  const scoped = filterRowsPointInTime(rows);
  const majors = getMajorIndustryDefinitions();

  const items = majors
    .map((major) => ({
      name: major.label,
      value: Math.round(sumIndustryColumns(scoped, major.columns)),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = items.reduce((sum, item) => sum + item.value, 0);
  return items.map((item) => ({
    ...item,
    share: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0,
  }));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildRadar(detail: ReturnType<typeof queryRegionDetail>): AiConsultingRadarData {
  const regionTotal = detail.kpi[0];
  const regionTotalNum = Number.parseInt(
    regionTotal?.value.replace(/,/g, "") ?? "0",
    10,
  );
  const nationalItem = detail.comparison.find((item) => item.label === "전국 평균");
  const nationalAvg = nationalItem?.value ?? regionTotalNum;
  const totalScore = clampScore((regionTotalNum / Math.max(1, nationalAvg)) * 50);

  const indexKpi = detail.kpi[3];
  const indexValue = Number.parseFloat(indexKpi?.value.replace(/,/g, "") ?? "100");
  const perCapitaScore = clampScore((indexValue / 100) * 50);

  const topShare = detail.industryComposition[0]?.share ?? 0;
  const concentrationScore = clampScore(topShare * 1.2);

  const changeText = regionTotal?.change ?? "0%";
  const changeNum = Number.parseFloat(changeText.replace(/[+%-]/g, "") || "0");
  const growthScore = clampScore(50 + changeNum * 2);

  const transportShare =
    detail.industryComposition.find((item) => item.name.includes("운송") || item.name.includes("교통"))
      ?.share ?? topShare;
  const reductionScore = clampScore(100 - transportShare * 0.8);

  return {
    indicators: [...RADAR_INDICATORS],
    region: [
      totalScore,
      perCapitaScore,
      concentrationScore,
      growthScore,
      reductionScore,
    ],
    national: [50, 50, 50, 50, 50],
  };
}

function buildKpi(detail: ReturnType<typeof queryRegionDetail>): KpiItem[] {
  const totalKpi = detail.kpi[0];
  const rankKpi = detail.kpi[1];
  const topIndustry = detail.industryComposition[0];
  const change = totalKpi.change ?? "—";
  const changeDirection = totalKpi.changeDirection ?? "neutral";

  return [
    {
      label: "선택 지역 총 관광 탄소발자국",
      value: totalKpi.value,
      unit: "(tCO₂eq)",
      unitOnLabel: true,
      hint: detail.periodLabel,
      icon: "ai-total-carbon",
      iconSrc: getAiConsultingKpiIconSrc("ai-total-carbon"),
    },
    {
      label: "전국 시군구 순위 (Top 10)",
      value: `${rankKpi.value}위 / ${rankKpi.hint?.replace(/개 시군구 중$/, "") ?? "—"}개`,
      hint: "전국 시군구 중",
      icon: "ai-national-rank",
      iconSrc: getAiConsultingKpiIconSrc("ai-national-rank"),
    },
    {
      label: "주요 배출 산업",
      value: topIndustry?.name ?? "—",
      hint: topIndustry ? `(${formatDecimal(topIndustry.share, 1)}%)` : undefined,
      icon: "ai-major-industry",
      iconSrc: getAiConsultingKpiIconSrc("ai-major-industry"),
    },
    {
      label: "최근 3년 추세",
      value: change.replace("+", "").replace("-", "").replace("%", ""),
      unit: "%",
      valueTone:
        changeDirection === "down"
          ? "down"
          : changeDirection === "up"
            ? "up"
            : "neutral",
      hint: totalKpi.hint ?? "전년 동기간 대비",
      icon: "ai-trend",
      iconSrc: getAiConsultingKpiIconSrc("ai-trend"),
    },
  ];
}

export function queryAiConsultingDashboard(
  query: AiConsultingQuery,
): AiConsultingDashboardData {
  const detailQuery = parseRegionDetailQuery(
    new URLSearchParams({
      start: query.periodStart,
      end: query.periodEnd,
      compare: query.compare,
    }),
    query.regionLabel,
  );
  const detail = queryRegionDetail(detailQuery);

  return {
    regionLabel: detail.regionLabel,
    periodLabel: detail.periodLabel,
    kpi: buildKpi(detail),
    sectorEmission: buildSectorEmission(query),
    radar: buildRadar(detail),
    compareReliability: detail.compareReliability,
  };
}

export function buildFallbackAiConsultingInsights(
  query: AiConsultingQuery,
  dashboard: AiConsultingDashboardData,
): AiConsultingInsightsSections {
  const detailQuery = parseRegionDetailQuery(
    new URLSearchParams({
      start: query.periodStart,
      end: query.periodEnd,
      compare: query.compare,
    }),
    query.regionLabel,
  );
  const detail = queryRegionDetail(detailQuery);
  const topIndustry = dashboard.sectorEmission[0];
  const secondIndustry = dashboard.sectorEmission[1];
  const totalKpi = dashboard.kpi[0];
  const rankKpi = dashboard.kpi[1];

  return {
    regionalEvaluation: [
      `${query.regionLabel}의 관광 탄소발자국은 ${dashboard.periodLabel} 기준 ${totalKpi.value} tCO₂eq이며, ${rankKpi.value}입니다.`,
      topIndustry
        ? `${topIndustry.name}·${secondIndustry?.name ?? "기타"} 부문이 배출의 상당 부분을 차지합니다(${topIndustry.share}%).`
        : "업종별 배출 구조 데이터가 제한적입니다.",
      totalKpi.change
        ? `전년 동기간 대비 ${totalKpi.change}로, 구조적 저감 전략 검토가 필요합니다.`
        : "비교 기간 데이터로 추세를 확인할 수 있습니다.",
    ],
    travelerGuide: (
      ["transport", "lodging", "food", "waste", "activity"] as const
    ).map((id) => ({
      id,
      title: TRAVELER_GUIDE_TITLES[id],
      description:
        id === "transport"
          ? "대중교통·카셰어링을 활용하고 불필요한 장거리 이동을 줄여보세요."
          : id === "lodging"
            ? "친환경 인증 숙소와 에너지 절약형 숙박을 선택해 주세요."
            : id === "food"
              ? "지역 식재료·로컬 식당 선택으로 운송 배출을 줄일 수 있습니다."
              : id === "waste"
                ? "다회용품·텀블러 사용으로 일회용품 폐기물을 줄여 주세요."
                : "도보·자전거·저배출 체험 프로그램을 선택해 보세요.",
    })),
    governmentConsulting: [
      topIndustry
        ? `${topIndustry.name} 대상 에너지 효율·운영 개선 지원을 확대하세요.`
        : "상위 배출 업종 대상 맞춤 감축 프로그램을 설계하세요.",
      "대중교통·친환경 이동 인프라 확충으로 관광 이동 배출을 줄이세요.",
      "관광 탄소 모니터링 대시보드와 성과 지표를 정례화하세요.",
      "관광객·업소 대상 저탄소 행동 인센티브를 연계하세요.",
    ],
    priorityActions: {
      short: [
        "저탄소 숙소·식당 인증 확대",
        "대중교통·카셰어링 이용 혜택 제공",
        "관광객 대상 행동 변화 캠페인",
      ],
      mid: [
        `${topIndustry?.name ?? "상위"} 업종 에너지 효율 개선 지원`,
        "친환경 교통수단 전환·충전 인프라 확충",
        "탄소 모니터링·공개 체계 고도화",
      ],
      long: [
        "관광 전 분야 탄소중립 로드맵 수립",
        "재생에너지 기반 관광 인프라 구축",
        "탄소중립 관광 브랜드·인증 체계 정착",
      ],
    },
    oneLineRecommendation: topIndustry
      ? `${topIndustry.name} 중심의 구조적 전환과 데이터 기반 관리가 ${query.regionLabel} 관광 탄소중립의 핵심입니다.`
      : `${query.regionLabel} 관광 탄소중립을 위해 업종·이동·숙박 연계 감축이 필요합니다.`,
  };
}

export function getSidoCodeForRegionLabel(regionLabel: string): string {
  const sidoLabel = regionLabel.split(" ")[0];
  return (
    KOREA_SIDO_OPTIONS.find((option) => option.label === sidoLabel)?.value ?? "all"
  );
}
