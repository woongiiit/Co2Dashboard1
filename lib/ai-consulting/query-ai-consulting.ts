import type { KpiItem } from "@/lib/mock-dashboard-data";
import { getAiConsultingKpiIconSrc } from "@/lib/ai-consulting-kpi-icons";
import { getMajorIndustryDefinitions } from "@/lib/industry-excel/excel-columns";
import { sumIndustryColumns } from "@/lib/industry-excel/shared";
import {
  formatDecimal,
  formatPeriodLabel,
  getSidoLabelFromCode,
  isYmInRange,
} from "@/lib/region-excel/format";
import { loadRegionExcelRows } from "@/lib/region-excel/load-region-data";
import { rowMatchesRegionLabel } from "@/lib/region-excel/admin-boundary-registry";
import { filterRowsPointInTime } from "@/lib/region-excel/resolve-admin-boundary";
import {
  parseRegionDetailQuery,
  queryRegionDetail,
} from "@/lib/region-excel/query-region-detail";
import { queryRegionDashboard } from "@/lib/region-excel/query-region-dashboard";
import type {
  AiConsultingDashboardData,
  AiConsultingInsightsSections,
  AiConsultingQuery,
  AiConsultingRadarData,
  AiConsultingScope,
  SectorEmissionItem,
  TravelerGuideItem,
} from "@/lib/ai-consulting/types";
import { buildMidIndustryTopItems } from "@/lib/ai-consulting/insight-data-profile";
import type { RegionDashboardQuery } from "@/lib/region-excel/types";
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
  const region = searchParams.get("region")?.trim() ?? "all";
  const sidoCode = searchParams.get("sido") ?? "all";
  const periodStart = searchParams.get("start") ?? "2023-01";
  const periodEnd = searchParams.get("end") ?? "2026-04";
  const compare = searchParams.get("compare") === "prev" ? "prev" : "yoy";

  if (region !== "all") {
    return {
      scope: "sigungu",
      regionLabel: region,
      sidoCode,
      periodStart,
      periodEnd,
      compare,
    };
  }

  if (sidoCode !== "all") {
    const sidoLabel = getSidoLabelFromCode(sidoCode);
    if (!sidoLabel) {
      throw new Error("시도를 확인할 수 없습니다.");
    }
    return {
      scope: "sido",
      regionLabel: sidoLabel,
      sidoCode,
      periodStart,
      periodEnd,
      compare,
    };
  }

  return {
    scope: "national",
    regionLabel: "전국",
    sidoCode: "all",
    periodStart,
    periodEnd,
    compare,
  };
}

function resolveRegionLabelFromFilters(
  sidoCode: string,
  sigunguValue: string,
): { scope: AiConsultingScope; regionLabel: string } {
  if (sigunguValue !== "all") {
    return { scope: "sigungu", regionLabel: sigunguValue };
  }
  if (sidoCode !== "all") {
    const sidoLabel = getSidoLabelFromCode(sidoCode);
    if (!sidoLabel) throw new Error("시도를 확인할 수 없습니다.");
    return { scope: "sido", regionLabel: sidoLabel };
  }
  return { scope: "national", regionLabel: "전국" };
}

export function buildAiConsultingQueryFromFilters(input: {
  sidoCode: string;
  sigunguValue: string;
  periodStart: string;
  periodEnd: string;
}): AiConsultingQuery {
  const resolved = resolveRegionLabelFromFilters(input.sidoCode, input.sigunguValue);
  return {
    scope: resolved.scope,
    regionLabel: resolved.regionLabel,
    sidoCode: input.sidoCode,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    compare: "yoy",
  };
}

function filterRowsForScope(query: AiConsultingQuery) {
  const allRows = loadRegionExcelRows();
  return allRows.filter((row) => {
    if (!isYmInRange(row.ym, query.periodStart, query.periodEnd)) return false;
    if (query.scope === "sigungu") {
      return rowMatchesRegionLabel(row, query.regionLabel);
    }
    if (query.scope === "sido") {
      return row.sidoNm === query.regionLabel;
    }
    return true;
  });
}

function buildSectorEmission(query: AiConsultingQuery): SectorEmissionItem[] {
  const scoped = filterRowsPointInTime(filterRowsForScope(query));
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

function findDetailKpi(
  detail: ReturnType<typeof queryRegionDetail>,
  labelIncludes: string,
): KpiItem | undefined {
  return detail.kpi.find((item) => item.label.includes(labelIncludes));
}

function kpiValueToTco2eq(kpi: KpiItem): number {
  const amount = Number.parseFloat(kpi.value.replace(/,/g, "") || "0");
  const unit = kpi.unit ?? "";
  if (unit.includes("백만")) return amount * 1_000_000;
  if (unit.includes("천")) return amount * 1_000;
  return amount;
}

function buildSigunguRadar(
  detail: ReturnType<typeof queryRegionDetail>,
  sectorEmission: SectorEmissionItem[],
): AiConsultingRadarData {
  const totalKpi = findDetailKpi(detail, "총") ?? detail.kpi[0]!;
  const indexKpi = findDetailKpi(detail, "평균") ?? detail.kpi[1];
  const regionTotalNum = kpiValueToTco2eq(totalKpi);
  const nationalItem = detail.comparison.find((item) => item.label === "전국 평균");
  const nationalAvg = nationalItem?.value ?? regionTotalNum;
  const totalScore = clampScore((regionTotalNum / Math.max(1, nationalAvg)) * 50);

  const indexValue = Number.parseFloat(indexKpi?.value.replace(/,/g, "") ?? "100");
  const perCapitaScore = clampScore((indexValue / 100) * 50);

  const topShare = sectorEmission[0]?.share ?? 0;
  const concentrationScore = clampScore(topShare * 1.2);

  const changeText = totalKpi.change ?? "0%";
  const changeNum = Number.parseFloat(changeText.replace(/[+%-]/g, "") || "0");
  const growthScore = clampScore(50 + changeNum * 2);

  const transportShare =
    sectorEmission.find((item) => item.name.includes("운송") || item.name.includes("교통"))
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

function buildAggregateRadar(
  sectorEmission: SectorEmissionItem[],
  totalChangeText: string,
  avgIndex: number,
): AiConsultingRadarData {
  const topShare = sectorEmission[0]?.share ?? 0;
  const changeNum = Number.parseFloat(totalChangeText.replace(/[+%-]/g, "") || "0");
  const transportShare =
    sectorEmission.find((item) => item.name.includes("운송") || item.name.includes("교통"))
      ?.share ?? topShare;

  return {
    indicators: [...RADAR_INDICATORS],
    region: [
      clampScore(50 + changeNum),
      clampScore((avgIndex / 100) * 50),
      clampScore(topShare * 1.2),
      clampScore(50 + changeNum * 2),
      clampScore(100 - transportShare * 0.8),
    ],
    national: [50, 50, 50, 50, 50],
  };
}

function toRegionDashboardQuery(query: AiConsultingQuery): RegionDashboardQuery {
  return {
    sidoCode: query.scope === "sido" ? query.sidoCode : "all",
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    compare: query.compare,
    metric: "total",
  };
}

function buildAggregateKpi(
  query: AiConsultingQuery,
  regionData: ReturnType<typeof queryRegionDashboard>,
  sectorEmission: SectorEmissionItem[],
): KpiItem[] {
  const totalKpi =
    regionData.kpi.find((item) => item.label.includes("총")) ?? regionData.kpi[0]!;
  const topRegion = regionData.ranking[0];
  const topIndustry = sectorEmission[0];
  const change = totalKpi.change ?? "—";
  const changeDirection = totalKpi.changeDirection ?? "neutral";
  const scopeTitle = query.scope === "national" ? "전국" : query.regionLabel;

  return [
    {
      label: `${scopeTitle} 총 관광 탄소발자국`,
      value: totalKpi.value,
      unit: totalKpi.unit,
      hint: formatPeriodLabel(query.periodStart, query.periodEnd),
      icon: "ai-total-carbon",
      iconSrc: getAiConsultingKpiIconSrc("ai-total-carbon"),
    },
    {
      label: query.scope === "national" ? "배출 1위 시군구" : "시도 내 1위 시군구",
      value: topRegion?.name ?? "—",
      hint: topRegion ? `(${topRegion.value} tCO₂eq)` : undefined,
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
      hint: "전년 동기간 대비",
      icon: "ai-trend",
      iconSrc: getAiConsultingKpiIconSrc("ai-trend"),
    },
  ];
}

function queryAggregateAiConsultingDashboard(
  query: AiConsultingQuery,
): AiConsultingDashboardData {
  const regionData = queryRegionDashboard(toRegionDashboardQuery(query));
  const sectorEmission = buildSectorEmission(query);
  const totalKpi =
    regionData.kpi.find((item) => item.label.includes("총")) ?? regionData.kpi[0]!;
  const indexKpi =
    regionData.kpi.find((item) => item.label.includes("평균")) ?? regionData.kpi[1];
  const avgIndex = Number.parseFloat(indexKpi?.value.replace(/,/g, "") ?? "100");

  return {
    regionLabel: query.regionLabel,
    periodLabel: regionData.periodLabel,
    kpi: buildAggregateKpi(query, regionData, sectorEmission),
    sectorEmission,
    radar: buildAggregateRadar(
      sectorEmission,
      totalKpi.change ?? "0%",
      avgIndex,
    ),
    compareReliability: regionData.compareReliability,
  };
}

function buildSigunguKpi(
  detail: ReturnType<typeof queryRegionDetail>,
  sectorEmission: SectorEmissionItem[],
): KpiItem[] {
  const totalKpi = findDetailKpi(detail, "총") ?? detail.kpi[0]!;
  const rankKpi = findDetailKpi(detail, "전국 순위");
  const topIndustry = sectorEmission[0];
  const change = totalKpi.change ?? "—";
  const changeDirection = totalKpi.changeDirection ?? "neutral";

  return [
    {
      label: "선택 지역 총 관광 탄소발자국",
      value: totalKpi.value,
      unit: totalKpi.unit,
      hint: detail.periodLabel,
      icon: "ai-total-carbon",
      iconSrc: getAiConsultingKpiIconSrc("ai-total-carbon"),
    },
    {
      label: "전국 시군구 순위 (Top 10)",
      value: rankKpi?.value ?? "—",
      unit: rankKpi?.unit ?? "위",
      hint: rankKpi?.hint ?? "전국 시군구 중",
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
      hint: "전년 동기간 대비",
      icon: "ai-trend",
      iconSrc: getAiConsultingKpiIconSrc("ai-trend"),
    },
  ];
}

function querySigunguAiConsultingDashboard(
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
  const sectorEmission = buildSectorEmission(query);

  return {
    regionLabel: detail.regionLabel,
    periodLabel: detail.periodLabel,
    kpi: buildSigunguKpi(detail, sectorEmission),
    sectorEmission,
    radar: buildSigunguRadar(detail, sectorEmission),
    compareReliability: detail.compareReliability,
  };
}

export function queryAiConsultingDashboard(
  query: AiConsultingQuery,
): AiConsultingDashboardData {
  if (query.scope !== "sigungu") {
    return queryAggregateAiConsultingDashboard(query);
  }
  return querySigunguAiConsultingDashboard(query);
}

function buildTravelerGuideFallback(
  regionLabel: string,
  midIndustries: ReturnType<typeof buildMidIndustryTopItems>,
): TravelerGuideItem[] {
  const topMid = midIndustries[0]?.label ?? "관광";
  const secondMid = midIndustries[1]?.label;
  const transportMid =
    midIndustries.find((item) => item.majorLabel === "운송업")?.label ?? "이동";

  return (["transport", "lodging", "food", "waste", "activity"] as const).map(
    (id) => ({
      id,
      title: TRAVELER_GUIDE_TITLES[id],
      description:
        id === "transport"
          ? `${regionLabel}에서는 ${transportMid} 배출 비중이 높습니다. 렌터카·장거리 이동 대신 시내·근교 대중교통·도보 동선을 계획하세요.`
          : id === "lodging"
            ? `${regionLabel} ${topMid} 연계 숙소·근교 1박 거점을 선택하면 이동·숙박 배출을 함께 줄일 수 있습니다.`
            : id === "food"
              ? secondMid
                ? `${regionLabel} ${topMid}·${secondMid} 중심 지역에서 향토 식당·시장을 선택해 식음·쇼핑 이동을 줄이세요.`
                : `${regionLabel} ${topMid} 밀집 구역의 로컬 식당을 선택해 불필요한 이동을 줄이세요.`
              : id === "waste"
                ? `${regionLabel} ${topMid} 체험·외식 구간에서 다회용품·분리배출을 실천해 폐기물 배출을 줄여 주세요.`
                : `${regionLabel} ${topMid} 중심 도보·근거리 체험을 선택해 ${transportMid} 의존을 낮춰 보세요.`,
    }),
  );
}

function buildPackageOneLiner(
  regionLabel: string,
  topSector: SectorEmissionItem | undefined,
  midIndustries: ReturnType<typeof buildMidIndustryTopItems>,
): string {
  const mid1 = midIndustries[0];
  const mid2 = midIndustries[1];
  const sectorName = topSector?.name ?? "주요 업종";
  const sectorShare = topSector ? `${topSector.share}%` : "";

  if (mid1 && mid2) {
    return `${regionLabel}는 ${sectorName}(${sectorShare})·${mid1.label}(${mid1.share}) 비중이 큽니다. ${regionLabel}의 대표 관광지와 ${mid1.label}·${mid2.label} 체험을 도보·대중교통 1일 동선으로 묶으면 장거리 이동·렌터카 의존을 줄여 ${sectorName} 배출을 낮출 수 있습니다.`;
  }

  return `${regionLabel} ${sectorName}(${sectorShare}) 중심 구조에서는 근거리·저이동 관광 코스 설계가 탄소 감축의 핵심입니다.`;
}

function buildAggregateFallbackInsights(
  query: AiConsultingQuery,
  dashboard: AiConsultingDashboardData,
): AiConsultingInsightsSections {
  const topIndustry = dashboard.sectorEmission[0];
  const secondIndustry = dashboard.sectorEmission[1];
  const totalKpi = dashboard.kpi[0];
  const topRegionKpi = dashboard.kpi[1];
  const trendKpi = dashboard.kpi[3];
  const totalCarbonLabel = [totalKpi.value, totalKpi.unit].filter(Boolean).join(" ");
  const scopeLabel = query.regionLabel;
  const midIndustries = buildMidIndustryTopItems(query, 5);

  return {
    regionalEvaluation: [
      `${scopeLabel} 관광 탄소발자국은 ${dashboard.periodLabel} 기준 ${totalCarbonLabel}입니다.`,
      topRegionKpi.value !== "—"
        ? `${topRegionKpi.label.replace("1위 ", "")} ${topRegionKpi.value}${topRegionKpi.hint ? ` ${topRegionKpi.hint}` : ""}로 집중 관리가 필요합니다.`
        : "지역별 배출 격차 데이터가 제한적입니다.",
      topIndustry
        ? `${topIndustry.name}·${secondIndustry?.name ?? "기타"} 부문(${topIndustry.share}%)과 중분류 ${midIndustries[0]?.label ?? "—"}(${midIndustries[0]?.share ?? "—"}) 등이 두드러집니다.`
        : "업종별 배출 구조 데이터가 제한적입니다.",
      trendKpi.value !== "—"
        ? `전년 동기간 대비 ${trendKpi.value}% 변화로, 구조적 저감 전략 검토가 필요합니다.`
        : "비교 기간 데이터로 추세를 확인할 수 있습니다.",
    ],
    travelerGuide: buildTravelerGuideFallback(scopeLabel, midIndustries),
    governmentConsulting: [
      topRegionKpi.value !== "—"
        ? `${topRegionKpi.value}·${midIndustries[0]?.label ?? topIndustry?.name ?? "상위 업종"} 연계 맞춤 감축 프로그램을 설계하세요.`
        : `${midIndustries[0]?.label ?? topIndustry?.name ?? "상위"} 업종 대상 맞춤 감축 프로그램을 설계하세요.`,
      `${scopeLabel} ${midIndustries.find((m) => m.majorLabel === "운송업")?.label ?? "이동"} 구간 대중교통·셔틀 연계를 확대하세요.`,
      `${scopeLabel} 상위 중분류(${midIndustries.slice(0, 2).map((m) => m.label).join("·") || "—"}) 모니터링·공개 체계를 정례화하세요.`,
      `${topRegionKpi.value !== "—" ? topRegionKpi.value : scopeLabel} 관광객·업소 대상 저탄소 동선 인센티브를 연계하세요.`,
    ],
    priorityActions: {
      short: [
        `${scopeLabel} ${midIndustries[0]?.label ?? topIndustry?.name ?? "상위"} 구간 저탄소 인증·안내`,
        `${midIndustries.find((m) => m.majorLabel === "운송업")?.label ?? "이동"} 연계 대중교통 쿠폰`,
        `${topRegionKpi.value !== "—" ? topRegionKpi.value : scopeLabel} 관광객 행동 변화 캠페인`,
      ],
      mid: [
        `${topIndustry?.name ?? "상위"}·${midIndustries[0]?.label ?? "중분류"} 업종 에너지 효율 지원`,
        `${scopeLabel} ${midIndustries.find((m) => m.majorLabel === "운송업")?.label ?? "이동"} 친환경 전환 인프라`,
        `${midIndustries.slice(0, 2).map((m) => m.label).join("·") || "상위 업종"} 탄소 모니터링 고도화`,
      ],
      long: [
        `${scopeLabel} 관광 탄소중립 로드맵 수립`,
        `${topIndustry?.name ?? "상위"}·${midIndustries[0]?.label ?? "중분류"} 연계 저탄소 관광 클러스터`,
        `${scopeLabel} 데이터 기반 탄소 공개·인증 체계`,
      ],
    },
    oneLineRecommendation: buildPackageOneLiner(scopeLabel, topIndustry, midIndustries),
  };
}

export function buildFallbackAiConsultingInsights(
  query: AiConsultingQuery,
  dashboard: AiConsultingDashboardData,
): AiConsultingInsightsSections {
  if (query.scope !== "sigungu") {
    return buildAggregateFallbackInsights(query, dashboard);
  }

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
  const detailTotalKpi = findDetailKpi(detail, "총");
  const totalCarbonLabel = [totalKpi.value, totalKpi.unit].filter(Boolean).join(" ");
  const rankLabel = [rankKpi.value, rankKpi.unit].filter(Boolean).join("");
  const midIndustries = buildMidIndustryTopItems(query, 5);

  return {
    regionalEvaluation: [
      `${query.regionLabel}의 관광 탄소발자국은 ${dashboard.periodLabel} 기준 ${totalCarbonLabel}이며, 전국 ${rankLabel}(${rankKpi.hint ?? "전국 시군구 중"})입니다.`,
      topIndustry
        ? `${topIndustry.name}(${topIndustry.share}%)·${secondIndustry?.name ?? "기타"}와 중분류 ${midIndustries[0]?.label ?? "—"}(${midIndustries[0]?.share ?? "—"})가 두드러집니다.`
        : "업종별 배출 구조 데이터가 제한적입니다.",
      detailTotalKpi?.change
        ? `전년 동기간 대비 ${detailTotalKpi.change}로, 구조적 저감 전략 검토가 필요합니다.`
        : "비교 기간 데이터로 추세를 확인할 수 있습니다.",
    ],
    travelerGuide: buildTravelerGuideFallback(query.regionLabel, midIndustries),
    governmentConsulting: [
      topIndustry
        ? `${query.regionLabel} ${topIndustry.name}·${midIndustries[0]?.label ?? "상위 중분류"} 구간 에너지·운영 효율 지원을 확대하세요.`
        : `${query.regionLabel} 상위 배출 업종 대상 맞춤 감축 프로그램을 설계하세요.`,
      `${query.regionLabel} ${midIndustries.find((m) => m.majorLabel === "운송업")?.label ?? "이동"} 구간 대중교통·셔틀·주차 연계를 강화하세요.`,
      `${query.regionLabel} ${midIndustries.slice(0, 2).map((m) => m.label).join("·") || topIndustry?.name || "상위"} 탄소 모니터링·공개를 정례화하세요.`,
      `${query.regionLabel} ${midIndustries[0]?.label ?? topIndustry?.name ?? "관광"} 밀집 구역 저탄소 동선 인센티브를 연계하세요.`,
    ],
    priorityActions: {
      short: [
        `${query.regionLabel} ${midIndustries[0]?.label ?? topIndustry?.name ?? "상위"} 구간 저탄소 인증`,
        `${midIndustries.find((m) => m.majorLabel === "운송업")?.label ?? "이동"} 연계 대중교통 쿠폰`,
        `${query.regionLabel} ${topIndustry?.name ?? "관광"} 구역 행동 변화 캠페인`,
      ],
      mid: [
        `${topIndustry?.name ?? "상위"}·${midIndustries[0]?.label ?? "중분류"} 업종 에너지 효율 지원`,
        `${query.regionLabel} ${midIndustries.find((m) => m.majorLabel === "운송업")?.label ?? "이동"} 친환경 전환`,
        `${midIndustries.slice(0, 2).map((m) => m.label).join("·") || topIndustry?.name || "상위"} 데이터 모니터링 고도화`,
      ],
      long: [
        `${query.regionLabel} 관광 탄소중립 로드맵`,
        `${topIndustry?.name ?? "상위"}·${midIndustries[0]?.label ?? "중분류"} 연계 저탄소 관광 클러스터`,
        `${query.regionLabel} 탄소 공개·인증 체계 정착`,
      ],
    },
    oneLineRecommendation: buildPackageOneLiner(
      query.regionLabel,
      topIndustry,
      midIndustries,
    ),
  };
}

export function getSidoCodeForRegionLabel(regionLabel: string): string {
  const sidoLabel = regionLabel.split(" ")[0];
  return (
    KOREA_SIDO_OPTIONS.find((option) => option.label === sidoLabel)?.value ?? "all"
  );
}
