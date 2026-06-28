import type { KpiItem, TableRow } from "@/lib/mock-dashboard-data";
import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import type { CompareReliability } from "@/lib/region-excel/admin-boundary-types";
import {
  findRowByRegionLabel,
  normalizeRegionLabel,
  regionLabelsMatch,
  rowMatchesRegionLabel,
} from "@/lib/region-excel/admin-boundary-registry";
import {
  formatChangePercent,
  formatChangePoint,
  formatDecimal,
  formatInteger,
  formatPeriodLabel,
  formatScaledCarbonMass,
  isYmInRange,
  rawCarbonToTco2eq,
  shiftYmByYears,
} from "@/lib/region-excel/format";
import { REGION_INDUSTRY_COLUMN_GROUPS } from "@/lib/region-excel/industry-groups";
import { loadRegionExcelRows } from "@/lib/region-excel/load-region-data";
import {
  aggregateByDisplayLabel,
  buildBoundaryWarningMessages,
  detectCompareReliability,
  filterRowsPointInTime,
} from "@/lib/region-excel/resolve-admin-boundary";
import type {
  RegionAggregationPolicy,
  RegionDashboardCompare,
  RegionDetailData,
  RegionDetailInsightsSections,
  RegionDetailQuery,
  RegionExcelRow,
} from "@/lib/region-excel/types";
import { getRegionDetailKpiIconSrc } from "@/lib/region-detail-kpi-icons";

function filterRegionRows(
  rows: RegionExcelRow[],
  query: RegionDetailQuery,
): RegionExcelRow[] {
  return rows.filter(
    (row) =>
      rowMatchesRegionLabel(row, query.regionLabel) &&
      isYmInRange(row.ym, query.periodStart, query.periodEnd),
  );
}

function filterCompareRegionRows(
  rows: RegionExcelRow[],
  query: RegionDetailQuery,
): RegionExcelRow[] {
  const comparePeriod = getComparePeriod(query);
  return rows.filter(
    (row) =>
      rowMatchesRegionLabel(row, query.regionLabel) &&
      isYmInRange(row.ym, comparePeriod.start, comparePeriod.end),
  );
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

function getComparePeriod(query: RegionDetailQuery): { start: string; end: string } {
  return query.compare === "prev"
    ? getPreviousPeriod(query.periodStart, query.periodEnd)
    : {
        start: shiftYmByYears(query.periodStart, 1),
        end: shiftYmByYears(query.periodEnd, 1),
      };
}

function getPreviousPeriod(start: string, end: string): { start: string; end: string } {
  const startIdx = monthIndex(start);
  const endIdx = monthIndex(end);
  const length = endIdx - startIdx + 1;
  const prevEnd = startIdx - 1;
  const prevStart = prevEnd - length + 1;
  return { start: indexToYm(prevStart), end: indexToYm(prevEnd) };
}

function sumRegionCarbon(rows: RegionExcelRow[]): number {
  return filterRowsPointInTime(rows).reduce(
    (sum, row) => sum + rawCarbonToTco2eq(row.carbonRaw),
    0,
  );
}

function weightedRegionIndex(rows: RegionExcelRow[]): number {
  let weighted = 0;
  let total = 0;
  for (const row of filterRowsPointInTime(rows)) {
    const carbon = rawCarbonToTco2eq(row.carbonRaw);
    if (carbon <= 0) continue;
    weighted += carbon * row.carbonIndex;
    total += carbon;
  }
  return total > 0 ? weighted / total : 0;
}

function regionTotalsAtEnd(
  rows: RegionExcelRow[],
  periodEnd: string,
): Map<string, number> {
  const scoped = rows.filter((row) => isYmInRange(row.ym, "2023-01", periodEnd));
  const rawTotals = aggregateByDisplayLabel(scoped, periodEnd);
  const totals = new Map<string, number>();
  for (const [label, raw] of rawTotals.entries()) {
    totals.set(label, rawCarbonToTco2eq(raw));
  }
  return totals;
}

function computeRanks(
  allRows: RegionExcelRow[],
  regionLabel: string,
  periodEnd: string,
): { nationalRank: number; nationalCount: number; sidoRank: number; sidoCount: number; sidoNm: string } {
  const totals = regionTotalsAtEnd(allRows, periodEnd);
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const normalizedLabel = normalizeRegionLabel(regionLabel);
  const nationalRank = Math.max(
    1,
    sorted.findIndex(([label]) => regionLabelsMatch(label, normalizedLabel)) + 1,
  );
  const sidoNm = findRowByRegionLabel(allRows, normalizedLabel)?.sidoNm ?? "";
  const sidoEntries = sorted.filter(([label]) => {
    const match = findRowByRegionLabel(allRows, label);
    return match?.sidoNm === sidoNm;
  });
  const sidoRank = Math.max(
    1,
    sidoEntries.findIndex(([label]) => regionLabelsMatch(label, normalizedLabel)) + 1,
  );

  return {
    nationalRank,
    nationalCount: sorted.length,
    sidoRank,
    sidoCount: sidoEntries.length,
    sidoNm,
  };
}

function sumIndustryGroups(rows: RegionExcelRow[]): { name: string; value: number }[] {
  const totals = new Map<string, number>();

  for (const [groupName, columns] of Object.entries(REGION_INDUSTRY_COLUMN_GROUPS)) {
    let sum = 0;
    for (const row of filterRowsPointInTime(rows)) {
      for (const column of columns) {
        sum += rawCarbonToTco2eq(row.industries?.[column] ?? 0);
      }
    }
    totals.set(groupName, sum);
  }

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

function buildIndustryComposition(rows: RegionExcelRow[]) {
  const groups = sumIndustryGroups(rows);
  const total = groups.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return [];

  return groups.map((item) => ({
    name: item.name,
    value: Math.round(item.value),
    share: (item.value / total) * 100,
  }));
}

function buildIndustryRanking(rows: RegionExcelRow[]): TableRow[] {
  return buildIndustryComposition(rows).slice(0, 7).map((item, index) => ({
    rank: index + 1,
    name: item.name,
    value: formatInteger(item.value),
    change: `${formatDecimal(item.share, 1)}%`,
  }));
}

function monthlyValueForYm(
  allRows: RegionExcelRow[],
  ym: string,
  regionLabel: string | null,
  sidoNm: string | null,
  mode: "region" | "national" | "sido",
): number | null {
  const monthRows = filterRowsPointInTime(
    allRows.filter((row) => row.ym === ym && isRowInScope(row, regionLabel, sidoNm, mode)),
  );

  if (monthRows.length === 0) return null;

  if (mode === "region") {
    return Math.round(sumRegionCarbon(monthRows));
  }

  const byRegion = new Map<string, number>();
  for (const row of monthRows) {
    byRegion.set(
      row.regionLabel,
      (byRegion.get(row.regionLabel) ?? 0) + rawCarbonToTco2eq(row.carbonRaw),
    );
  }

  const values = [...byRegion.values()];
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function isRowInScope(
  row: RegionExcelRow,
  regionLabel: string | null,
  sidoNm: string | null,
  mode: "region" | "national" | "sido",
): boolean {
  if (mode === "region") return rowMatchesRegionLabel(row, regionLabel ?? "");
  if (mode === "sido") return row.sidoNm === sidoNm;
  return true;
}

function buildMonthlyTrend(
  allRows: RegionExcelRow[],
  query: RegionDetailQuery,
  sidoNm: string,
) {
  const endYear = Number(query.periodEnd.split("-")[0]);
  const prevYear = endYear - 1;

  const selected: (number | null)[] = [];
  const prevYearSameMonth: (number | null)[] = [];
  const nationalAvg: (number | null)[] = [];
  const sidoAvg: (number | null)[] = [];

  for (let month = 1; month <= 12; month += 1) {
    const ym = `${endYear}-${String(month).padStart(2, "0")}`;
    const prevYm = `${prevYear}-${String(month).padStart(2, "0")}`;

    selected.push(
      isYmInRange(ym, query.periodStart, query.periodEnd)
        ? monthlyValueForYm(allRows, ym, query.regionLabel, sidoNm, "region")
        : null,
    );
    prevYearSameMonth.push(
      monthlyValueForYm(allRows, prevYm, query.regionLabel, sidoNm, "region"),
    );
    nationalAvg.push(
      isYmInRange(ym, query.periodStart, query.periodEnd)
        ? monthlyValueForYm(allRows, ym, null, null, "national")
        : null,
    );
    sidoAvg.push(
      isYmInRange(ym, query.periodStart, query.periodEnd)
        ? monthlyValueForYm(allRows, ym, null, sidoNm, "sido")
        : null,
    );
  }

  return {
    months: [...MONTH_LABELS],
    selected,
    prevYearSameMonth,
    nationalAvg,
    sidoAvg,
    seriesLabels: {
      selected: query.regionLabel,
      sido: `${sidoNm} 평균`,
    },
  };
}

function findSimilarRegionLabels(
  totals: Map<string, number>,
  targetLabel: string,
  count = 3,
): string[] {
  const targetValue = totals.get(targetLabel) ?? 0;
  return [...totals.entries()]
    .filter(([label]) => label !== targetLabel)
    .sort(
      (a, b) =>
        Math.abs(a[1] - targetValue) - Math.abs(b[1] - targetValue),
    )
    .slice(0, count)
    .map(([label]) => label);
}

function averageForLabels(totals: Map<string, number>, labels: string[]): number {
  if (labels.length === 0) return 0;
  const sum = labels.reduce((acc, label) => acc + (totals.get(label) ?? 0), 0);
  return sum / labels.length;
}

function buildComparison(
  allRows: RegionExcelRow[],
  currentRows: RegionExcelRow[],
  compareRows: RegionExcelRow[],
  query: RegionDetailQuery,
): RegionDetailData["comparison"] {
  const currentTotals = regionTotalsAtEnd(allRows, query.periodEnd);
  const comparePeriod = getComparePeriod(query);
  const compareTotals = regionTotalsAtEnd(allRows, comparePeriod.end);
  const ranks = computeRanks(allRows, query.regionLabel, query.periodEnd);
  const similarLabels = findSimilarRegionLabels(currentTotals, query.regionLabel);

  const nationalValues = [...currentTotals.values()];
  const nationalAvg =
    nationalValues.reduce((sum, value) => sum + value, 0) /
    Math.max(1, nationalValues.length);

  const sidoLabels = [...currentTotals.keys()].filter(
    (label) => findRowByRegionLabel(allRows, label)?.sidoNm === ranks.sidoNm,
  );
  const sidoAvg = averageForLabels(currentTotals, sidoLabels);
  const similarAvg = averageForLabels(currentTotals, similarLabels);

  const compareNationalValues = [...compareTotals.values()];
  const compareNationalAvg =
    compareNationalValues.reduce((sum, value) => sum + value, 0) /
    Math.max(1, compareNationalValues.length);
  const compareSidoLabels = [...compareTotals.keys()].filter(
    (label) => findRowByRegionLabel(allRows, label)?.sidoNm === ranks.sidoNm,
  );
  const compareSidoAvg = averageForLabels(compareTotals, compareSidoLabels);
  const compareSimilarAvg = averageForLabels(
    compareTotals,
    findSimilarRegionLabels(compareTotals, query.regionLabel),
  );

  const items = [
    { label: "전국 평균", value: nationalAvg, compare: compareNationalAvg },
    { label: `${ranks.sidoNm} 평균`, value: sidoAvg, compare: compareSidoAvg },
    { label: "유사 지역 평균", value: similarAvg, compare: compareSimilarAvg },
  ];

  return items.map((item) => {
    const change = formatChangePercent(item.value, item.compare);
    return {
      label: item.label,
      value: Math.round(item.value),
      changePercent: Number.parseFloat(change.text.replace("%", "").replace("+", "")) || 0,
      changeDirection: change.direction === "neutral" ? "up" : change.direction,
    };
  });
}

function buildDetailKpi(
  currentRows: RegionExcelRow[],
  compareRows: RegionExcelRow[],
  allRows: RegionExcelRow[],
  query: RegionDetailQuery,
  compareReliability: CompareReliability,
): KpiItem[] {
  const totalCarbon = sumRegionCarbon(currentRows);
  const compareCarbon = sumRegionCarbon(compareRows);
  const totalChange = formatChangePercent(totalCarbon, compareCarbon);
  const totalCarbonDisplay = formatScaledCarbonMass(totalCarbon);
  const ranks = computeRanks(allRows, query.regionLabel, query.periodEnd);
  const avgIndex = weightedRegionIndex(currentRows);
  const compareIndex = weightedRegionIndex(compareRows);
  const indexChange = formatChangePoint(avgIndex, compareIndex);
  const changeHint =
    compareReliability.level === "limited"
      ? "전년 동기간 대비 · 행정구역 개정 주의"
      : "전년 동기간 대비";

  return [
    {
      label: "선택 지역 총 탄소발자국",
      value: totalCarbonDisplay.value,
      unit: totalCarbonDisplay.unit,
      change: totalChange.text,
      changeDirection: totalChange.direction,
      hint: changeHint,
      icon: "detail-region-carbon",
      iconSrc: getRegionDetailKpiIconSrc("detail-region-carbon"),
    },
    {
      label: "평균 탄소발자국 지수",
      value: formatDecimal(avgIndex),
      unit: "지수",
      change: indexChange.text,
      changeDirection: indexChange.direction,
      hint: changeHint,
      icon: "detail-spend-intensity",
      iconSrc: getRegionDetailKpiIconSrc("detail-spend-intensity"),
    },
    {
      label: "전국 순위",
      value: formatInteger(ranks.nationalRank),
      unit: "위",
      hint: `${formatInteger(ranks.nationalCount)}개 시군구 중`,
      icon: "detail-national-rank",
      iconSrc: getRegionDetailKpiIconSrc("detail-national-rank"),
    },
    {
      label: "시도 내 순위",
      value: formatInteger(ranks.sidoRank),
      unit: "위",
      hint: `${ranks.sidoNm} ${formatInteger(ranks.sidoCount)}개 시군구 중`,
      icon: "detail-sido-rank",
      iconSrc: getRegionDetailKpiIconSrc("detail-sido-rank"),
    },
  ];
}

function buildMapByLabelForSido(
  allRows: RegionExcelRow[],
  query: RegionDetailQuery,
): Record<string, number> {
  const sidoNm = findRowByRegionLabel(allRows, query.regionLabel)?.sidoNm;
  const scoped = allRows.filter(
    (row) =>
      (!sidoNm || row.sidoNm === sidoNm) &&
      isYmInRange(row.ym, query.periodStart, query.periodEnd),
  );
  const rawTotals = aggregateByDisplayLabel(scoped, query.periodEnd);
  const result: Record<string, number> = {};
  for (const [label, raw] of rawTotals.entries()) {
    result[label] = rawCarbonToTco2eq(raw);
  }
  return result;
}

export function parseRegionDetailQuery(
  searchParams: URLSearchParams,
  regionLabel: string,
): RegionDetailQuery {
  return {
    regionLabel: normalizeRegionLabel(regionLabel),
    periodStart: searchParams.get("start") ?? "2023-01",
    periodEnd: searchParams.get("end") ?? "2026-04",
    compare: searchParams.get("compare") === "prev" ? "prev" : "yoy",
  };
}

export function queryRegionDetail(query: RegionDetailQuery): RegionDetailData {
  const allRows = loadRegionExcelRows();
  const normalizedLabel = normalizeRegionLabel(query.regionLabel);
  if (!findRowByRegionLabel(allRows, normalizedLabel)) {
    throw new Error(`지역 데이터를 찾을 수 없습니다: ${normalizedLabel}`);
  }

  const resolvedQuery = { ...query, regionLabel: normalizedLabel };
  const currentRows = filterRegionRows(allRows, resolvedQuery);
  const compareRows = filterCompareRegionRows(allRows, resolvedQuery);
  const comparePeriod = getComparePeriod(resolvedQuery);
  const compareReliability = detectCompareReliability(
    resolvedQuery.periodStart,
    resolvedQuery.periodEnd,
    comparePeriod.start,
    comparePeriod.end,
  );
  const ranks = computeRanks(allRows, normalizedLabel, resolvedQuery.periodEnd);

  return {
    regionLabel: normalizedLabel,
    sidoNm: ranks.sidoNm,
    periodLabel: formatPeriodLabel(resolvedQuery.periodStart, resolvedQuery.periodEnd),
    kpi: buildDetailKpi(currentRows, compareRows, allRows, resolvedQuery, compareReliability),
    mapValue: sumRegionCarbon(currentRows),
    monthlyTrend: buildMonthlyTrend(allRows, resolvedQuery, ranks.sidoNm),
    comparison: buildComparison(allRows, currentRows, compareRows, resolvedQuery),
    industryComposition: buildIndustryComposition(currentRows),
    industryRanking: buildIndustryRanking(currentRows),
    mapByLabel: buildMapByLabelForSido(allRows, resolvedQuery),
    boundaryWarnings: buildBoundaryWarningMessages(
      resolvedQuery.periodStart,
      resolvedQuery.periodEnd,
      compareReliability,
    ),
    compareReliability,
    aggregationPolicy: {
      kpiTrend: "point_in_time",
      mapRanking: "as_of_period_end",
    },
  };
}

export function buildFallbackRegionDetailInsights(
  data: RegionDetailData,
  query: RegionDetailQuery,
): RegionDetailInsightsSections {
  const totalKpi = data.kpi[0];
  const topIndustry = data.industryComposition[0];
  const compareLabel = query.compare === "prev" ? "직전 기간" : "전년 동기간";

  return {
    evaluation: [
      `${data.regionLabel}의 총 관광 탄소발자국은 ${compareLabel} ${totalKpi.change ?? "—"}입니다.`,
      `전국 ${data.kpi[1]?.value ?? "—"}위, ${data.sidoNm} 내 ${data.kpi[2]?.value ?? "—"}위입니다.`,
    ],
    traveler: topIndustry
      ? [
          `${topIndustry.name}이(가) 지역 탄소의 ${formatDecimal(topIndustry.share, 1)}%를 차지합니다.`,
          "대중교통·로컬 소비 선택이 탄소 절감에 도움이 됩니다.",
        ]
      : ["업종별 데이터가 충분하지 않습니다."],
    policy: topIndustry
      ? [
          `${topIndustry.name} 중심의 에너지·운영 효율 개선을 검토할 수 있습니다.`,
          "성수기 집중 구간의 수요 분산·친환경 이동 수단 확대를 권장합니다.",
        ]
      : ["지자체 맞춤 정책 수립을 위해 추가 데이터가 필요합니다."],
  };
}
