import type { KpiItem, TableRow } from "@/lib/mock-dashboard-data";
import { getRegionKpiIconSrc } from "@/lib/region-kpi-icons";
import {
  MONTH_LABELS,
  type TrendYear,
} from "@/lib/charts/monthly-carbon-trend-data";
import {
  formatChangePercent,
  formatChangePoint,
  formatDecimal,
  formatInteger,
  formatPeriodLabel,
  getSidoLabelFromCode,
  isYmInRange,
  rawCarbonToTco2eq,
  shiftYmByYears,
} from "@/lib/region-excel/format";
import { loadRegionExcelRows } from "@/lib/region-excel/load-region-data";
import {
  aggregateByDisplayLabel,
  buildBoundaryWarningMessages,
  buildCompareAggregationKey,
  buildMapByLabelFromRows,
  countRegionsAsOfEnd,
  detectCompareReliability,
  filterRowsPointInTime,
} from "@/lib/region-excel/resolve-admin-boundary";
import type {
  RegionDashboardData,
  RegionDashboardQuery,
  RegionExcelRow,
  RegionTrendSeries,
} from "@/lib/region-excel/types";
import type { CompareReliability } from "@/lib/region-excel/admin-boundary-types";

const TREND_YEARS: TrendYear[] = ["2023", "2024", "2025", "2026"];

function filterRows(rows: RegionExcelRow[], query: RegionDashboardQuery): RegionExcelRow[] {
  const sidoLabel = getSidoLabelFromCode(query.sidoCode);

  return rows.filter((row) => {
    if (sidoLabel && row.sidoNm !== sidoLabel) return false;
    return isYmInRange(row.ym, query.periodStart, query.periodEnd);
  });
}

function compareRows(rows: RegionExcelRow[], query: RegionDashboardQuery): RegionExcelRow[] {
  const sidoLabel = getSidoLabelFromCode(query.sidoCode);
  const comparePeriod =
    query.compare === "prev"
      ? getPreviousPeriod(query.periodStart, query.periodEnd)
      : {
          start: shiftYmByYears(query.periodStart, 1),
          end: shiftYmByYears(query.periodEnd, 1),
        };

  return rows.filter((row) => {
    if (sidoLabel && row.sidoNm !== sidoLabel) return false;
    return isYmInRange(row.ym, comparePeriod.start, comparePeriod.end);
  });
}

function monthIndex(ym: string): number {
  const [year, month] = ym.split("-").map(Number);
  return year! * 12 + (month! - 1);
}

function indexToYm(index: number): string {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getPreviousPeriod(start: string, end: string): { start: string; end: string } {
  const startIdx = monthIndex(start);
  const endIdx = monthIndex(end);
  const length = endIdx - startIdx + 1;
  const prevEnd = startIdx - 1;
  const prevStart = prevEnd - length + 1;
  return { start: indexToYm(prevStart), end: indexToYm(prevEnd) };
}

function getComparePeriod(query: RegionDashboardQuery): { start: string; end: string } {
  return query.compare === "prev"
    ? getPreviousPeriod(query.periodStart, query.periodEnd)
    : {
        start: shiftYmByYears(query.periodStart, 1),
        end: shiftYmByYears(query.periodEnd, 1),
      };
}

function aggregateDisplayTotals(
  rows: RegionExcelRow[],
  periodEnd: string,
): Map<string, number> {
  const rawTotals = aggregateByDisplayLabel(filterRowsPointInTime(rows), periodEnd);
  const totals = new Map<string, number>();

  for (const [label, rawTotal] of rawTotals.entries()) {
    totals.set(label, rawCarbonToTco2eq(rawTotal));
  }

  return totals;
}

function compareHintLabel(
  query: RegionDashboardQuery,
  compareReliability: CompareReliability,
): string {
  const base = query.compare === "prev" ? "직전 기간 대비" : "전년 동기간 대비";
  return compareReliability.level === "limited" ? `${base} · 행정구역 개정 주의` : base;
}
function sumCarbon(rows: RegionExcelRow[]): number {
  return filterRowsPointInTime(rows).reduce(
    (sum, row) => sum + rawCarbonToTco2eq(row.carbonRaw),
    0,
  );
}

function weightedIndex(rows: RegionExcelRow[]): number {
  let weighted = 0;
  let totalCarbon = 0;

  for (const row of filterRowsPointInTime(rows)) {
    const carbon = rawCarbonToTco2eq(row.carbonRaw);
    if (carbon <= 0) continue;
    weighted += carbon * row.carbonIndex;
    totalCarbon += carbon;
  }

  return totalCarbon > 0 ? weighted / totalCarbon : 0;
}

function top20Share(rows: RegionExcelRow[], periodEnd: string): number {
  const totals = aggregateDisplayTotals(rows, periodEnd);
  const values = [...totals.values()].sort((a, b) => b - a);
  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return 0;

  const topCount = Math.max(1, Math.ceil(values.length * 0.2));
  const topSum = values.slice(0, topCount).reduce((sum, value) => sum + value, 0);
  return (topSum / total) * 100;
}

function buildRanking(
  currentRows: RegionExcelRow[],
  compareRowsData: RegionExcelRow[],
  periodEnd: string,
): TableRow[] {
  const currentTotals = aggregateDisplayTotals(currentRows, periodEnd);
  const compareTotals = new Map<string, number>();

  for (const row of filterRowsPointInTime(compareRowsData)) {
    const key = buildCompareAggregationKey(row, periodEnd);
    compareTotals.set(
      key,
      (compareTotals.get(key) ?? 0) + rawCarbonToTco2eq(row.carbonRaw),
    );
  }

  return [...currentTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value], index) => {
      const previous = compareTotals.get(name) ?? 0;
      const change = formatChangePercent(value, previous);
      return {
        rank: index + 1,
        name,
        value: formatInteger(value),
        change: change.text,
      };
    });
}

function buildTrend(rows: RegionExcelRow[]): RegionTrendSeries {
  const monthlyTotals = new Map<string, number>();

  for (const row of filterRowsPointInTime(rows)) {
    const key = `${row.year}-${row.month}`;
    monthlyTotals.set(
      key,
      (monthlyTotals.get(key) ?? 0) + rawCarbonToTco2eq(row.carbonRaw),
    );
  }

  const series = {} as RegionTrendSeries;

  for (const year of TREND_YEARS) {
    series[year] = MONTH_LABELS.map((_, index) => {
      const value = monthlyTotals.get(`${Number(year)}-${index + 1}`);
      return value == null ? null : Math.round(value);
    });
  }

  return series;
}

function buildKpi(
  currentRows: RegionExcelRow[],
  compareRowsData: RegionExcelRow[],
  query: RegionDashboardQuery,
  compareReliability: CompareReliability,
  comparePeriodEnd: string,
): KpiItem[] {
  const totalCarbon = sumCarbon(currentRows);
  const compareCarbon = sumCarbon(compareRowsData);
  const totalChange = formatChangePercent(totalCarbon, compareCarbon);

  const avgIndex = weightedIndex(currentRows);
  const compareIndex = weightedIndex(compareRowsData);
  const indexChange = formatChangePoint(avgIndex, compareIndex);

  const topShare = top20Share(currentRows, query.periodEnd);
  const compareTopShare = top20Share(compareRowsData, comparePeriodEnd);
  const topShareChange = formatChangePoint(topShare, compareTopShare);

  const monthCount = new Set(filterRowsPointInTime(currentRows).map((row) => row.ym)).size;
  const monthlyAverage = monthCount > 0 ? totalCarbon / monthCount : 0;
  const compareMonthCount = new Set(
    filterRowsPointInTime(compareRowsData).map((row) => row.ym),
  ).size;
  const compareMonthlyAverage =
    compareMonthCount > 0 ? compareCarbon / compareMonthCount : 0;
  const monthlyChange = formatChangePercent(monthlyAverage, compareMonthlyAverage);

  const regionCount = countRegionsAsOfEnd(currentRows, query.periodEnd);
  const changeHint = compareHintLabel(query, compareReliability);

  return [
    {
      label: "총 관광 탄소발자국",
      value: formatInteger(totalCarbon),
      unit: "tCO₂eq",
      change: totalChange.text,
      changeDirection: totalChange.direction,
      hint: changeHint,
      icon: "region-total-carbon",
      iconSrc: getRegionKpiIconSrc("region-total-carbon"),
    },
    {
      label: "평균 탄소발자국 지수",
      value: formatDecimal(avgIndex),
      unit: "지수",
      change: indexChange.text,
      changeDirection: indexChange.direction,
      hint: changeHint,
      icon: "region-per-capita",
      iconSrc: getRegionKpiIconSrc("region-per-capita"),
    },
    {
      label: "월평균 탄소발자국",
      value: formatInteger(monthlyAverage),
      unit: "tCO₂eq",
      change: monthlyChange.text,
      changeDirection: monthlyChange.direction,
      hint: changeHint,
      icon: "region-spend-intensity",
      iconSrc: getRegionKpiIconSrc("region-spend-intensity"),
    },
    {
      label: "상위 20% 시군구 비중",
      value: formatDecimal(topShare, 1),
      unit: "%",
      change: topShareChange.text,
      changeDirection: topShareChange.direction,
      hint: changeHint,
      icon: "region-top-share",
      iconSrc: getRegionKpiIconSrc("region-top-share"),
    },
    {
      label: "분석 시군구 수",
      value: formatInteger(regionCount),
      unit: "개",
      hint: `${query.periodEnd} 시점 행정구역 기준`,
      icon: "region-priority",
      iconSrc: getRegionKpiIconSrc("region-priority"),
    },
  ];
}

function buildFallbackRegionInsights(
  currentRows: RegionExcelRow[],
  compareRowsData: RegionExcelRow[],
  query: RegionDashboardQuery,
  compareReliability: CompareReliability,
): string[] {
  const totalCarbon = sumCarbon(currentRows);
  const compareCarbon = sumCarbon(compareRowsData);
  const totalChange = formatChangePercent(totalCarbon, compareCarbon);
  const ranking = buildRanking(currentRows, compareRowsData, query.periodEnd);
  const topRegion = ranking[0];
  const topShare = top20Share(currentRows, query.periodEnd);

  const scope =
    query.sidoCode === "all"
      ? "선택 범위"
      : (getSidoLabelFromCode(query.sidoCode) ?? "선택 시도");

  const compareLabel =
    query.compare === "prev" ? "직전 기간 대비" : "전년 동기간 대비";

  const insights = [
    `${scope} 총 관광 탄소발자국은 ${compareLabel} ${totalChange.text}입니다.`,
    topRegion
      ? `${topRegion.name}이(가) ${topRegion.value} tCO₂eq로 가장 높은 배출을 기록했습니다.`
      : "순위 데이터가 없습니다.",
    `상위 20% 시군구가 전체의 ${formatDecimal(topShare, 1)}%를 차지합니다.`,
  ];

  if (compareReliability.level === "limited") {
    insights.push("행정구역 개정으로 일부 전년 대비·순위 비교는 동일 단위가 아닐 수 있습니다.");
  }

  return insights;
}

export function buildFallbackRegionInsightsFromQuery(
  query: RegionDashboardQuery,
): string[] {
  const allRows = loadRegionExcelRows();
  const currentRows = filterRows(allRows, query);
  const compareRowsData = compareRows(allRows, query);
  const compareReliability = detectCompareReliability(
    query.periodStart,
    query.periodEnd,
    getComparePeriod(query).start,
    getComparePeriod(query).end,
  );

  return buildFallbackRegionInsights(
    currentRows,
    compareRowsData,
    query,
    compareReliability,
  );
}

export function queryRegionDashboard(
  query: RegionDashboardQuery,
): RegionDashboardData {
  const allRows = loadRegionExcelRows();
  const currentRows = filterRows(allRows, query);
  const compareRowsData = compareRows(allRows, query);
  const comparePeriod = getComparePeriod(query);
  const compareReliability = detectCompareReliability(
    query.periodStart,
    query.periodEnd,
    comparePeriod.start,
    comparePeriod.end,
  );
  const boundaryWarnings = buildBoundaryWarningMessages(
    query.periodStart,
    query.periodEnd,
    compareReliability,
  );

  return {
    periodLabel: formatPeriodLabel(query.periodStart, query.periodEnd),
    kpi: buildKpi(
      currentRows,
      compareRowsData,
      query,
      compareReliability,
      comparePeriod.end,
    ),
    ranking: buildRanking(currentRows, compareRowsData, query.periodEnd),
    trend: buildTrend(currentRows),
    mapByLabel: buildMapByLabelFromRows(
      currentRows,
      query.periodEnd,
      rawCarbonToTco2eq,
    ),
    boundaryWarnings,
    compareReliability,
    aggregationPolicy: {
      kpiTrend: "point_in_time",
      mapRanking: "as_of_period_end",
    },
  };
}

export function parseRegionDashboardQuery(
  searchParams: URLSearchParams,
): RegionDashboardQuery {
  return {
    sidoCode: searchParams.get("sido") ?? "all",
    periodStart: searchParams.get("start") ?? "2023-01",
    periodEnd: searchParams.get("end") ?? "2026-04",
    compare: searchParams.get("compare") === "prev" ? "prev" : "yoy",
    metric:
      searchParams.get("metric") === "per-capita" ||
      searchParams.get("metric") === "per-spend"
        ? (searchParams.get("metric") as RegionDashboardQuery["metric"])
        : "total",
  };
}
