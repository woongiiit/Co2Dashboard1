import type { KpiItem, TableRow } from "@/lib/mock-dashboard-data";
import {
  MONTH_LABELS,
  type TrendYear,
} from "@/lib/charts/monthly-carbon-trend-data";
import { getIndustryKpiIconSrc } from "@/lib/industry-kpi-icons";
import {
  ALL_EXCEL_INDUSTRY_COLUMNS,
  getMajorIndustryDefinitions,
  getMidIndustryDefinitions,
  resolveIndustryColumns,
} from "@/lib/industry-excel/excel-columns";
import {
  buildIndustryCompareReliability,
  filterIndustryScopeRows,
  formatIndustryScopeLabel,
  formatPeriodLabel,
  getComparePeriod,
  loadRegionExcelRows,
  sumIndustryColumns,
  weightedIndustryIndex,
} from "@/lib/industry-excel/shared";
import type {
  IndustryDashboardData,
  IndustryDashboardQuery,
  IndustryMajorItem,
  IndustryMonthlyHighlight,
} from "@/lib/industry-excel/types";
import type { CompareReliability } from "@/lib/region-excel/admin-boundary-types";
import {
  formatChangePercent,
  formatChangePoint,
  formatDecimal,
  formatInteger,
  formatScaledCarbonMass,
  rawCarbonToTco2eq,
} from "@/lib/region-excel/format";
import { filterRowsPointInTime } from "@/lib/region-excel/resolve-admin-boundary";
import type { RegionExcelRow, RegionTrendSeries } from "@/lib/region-excel/types";

const TREND_YEARS: TrendYear[] = ["2023", "2024", "2025", "2026"];

function buildMajorIndustries(rows: RegionExcelRow[]): IndustryMajorItem[] {
  const definitions = getMajorIndustryDefinitions();
  const values = definitions.map((major) => ({
    ...major,
    value: Math.round(sumIndustryColumns(rows, major.columns)),
  }));
  const total = values.reduce((sum, item) => sum + item.value, 0);

  return values.map((item) => ({
    name: item.label,
    value: item.value,
    share: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0,
    color: item.color,
  }));
}

function buildMidIndustries(rows: RegionExcelRow[]): IndustryMajorItem[] {
  const definitions = getMidIndustryDefinitions();
  const colorByMajorLabel = new Map(
    getMajorIndustryDefinitions().map((major) => [major.label, major.color]),
  );

  const values = definitions
    .map((mid) => ({
      name: mid.label,
      value: Math.round(sumIndustryColumns(rows, [mid.column])),
      color: colorByMajorLabel.get(mid.majorLabel) ?? "#94a3b8",
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = values.reduce((sum, item) => sum + item.value, 0);

  return values.map((item) => ({
    ...item,
    share: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0,
  }));
}

function buildMidRanking(rows: RegionExcelRow[]): TableRow[] {
  const definitions = getMidIndustryDefinitions();
  const totals = definitions
    .map((mid) => ({
      name: mid.label,
      value: sumIndustryColumns(rows, [mid.column]),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const grandTotal = totals.reduce((sum, item) => sum + item.value, 0);

  return totals.slice(0, 10).map((item, index) => ({
    rank: index + 1,
    name: item.name,
    value: formatInteger(item.value),
    change:
      grandTotal > 0
        ? `${formatDecimal((item.value / grandTotal) * 100, 1)}%`
        : "—",
  }));
}

function buildMonthlyTrend(
  rows: RegionExcelRow[],
  columns: string[],
): RegionTrendSeries {
  const monthlyTotals = new Map<string, number>();

  for (const row of filterRowsPointInTime(rows)) {
    let monthTotal = 0;
    for (const column of columns) {
      monthTotal += rawCarbonToTco2eq(row.industries?.[column] ?? 0);
    }
    const key = `${row.year}-${row.month}`;
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + monthTotal);
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

function findMonthlyHighlight(
  trend: RegionTrendSeries,
): IndustryMonthlyHighlight | null {
  const series2026 = trend["2026"] ?? [];
  let peakValue = -1;
  let peakIndex = -1;

  series2026.forEach((value, index) => {
    if (value == null || value <= peakValue) return;
    peakValue = value;
    peakIndex = index;
  });

  if (peakIndex < 0 || peakValue <= 0) return null;

  return {
    monthIndex: peakIndex,
    value: peakValue,
    label: `2026년 ${MONTH_LABELS[peakIndex]}`,
  };
}

function buildKpi(
  currentRows: RegionExcelRow[],
  compareRows: RegionExcelRow[],
  selectedColumns: string[],
): KpiItem[] {
  const selectedCarbon = sumIndustryColumns(currentRows, selectedColumns);
  const totalCarbon = sumIndustryColumns(currentRows, ALL_EXCEL_INDUSTRY_COLUMNS);
  const compareSelected = sumIndustryColumns(compareRows, selectedColumns);

  const selectedChange = formatChangePercent(selectedCarbon, compareSelected);
  const share = totalCarbon > 0 ? (selectedCarbon / totalCarbon) * 100 : 0;
  const compareTotal = sumIndustryColumns(compareRows, ALL_EXCEL_INDUSTRY_COLUMNS);
  const compareShare =
    compareTotal > 0 ? (compareSelected / compareTotal) * 100 : 0;
  const shareChange = formatChangePoint(share, compareShare);

  const avgIndex = weightedIndustryIndex(currentRows, selectedColumns);
  const compareIndex = weightedIndustryIndex(compareRows, selectedColumns);
  const indexChange = formatChangePoint(avgIndex, compareIndex);

  const yoyDisplay = selectedChange.text.replace("+", "");
  const selectedCarbonDisplay = formatScaledCarbonMass(selectedCarbon);
  const totalCarbonDisplay = formatScaledCarbonMass(totalCarbon);

  return [
    {
      label: "선택 업종 탄소발자국",
      value: selectedCarbonDisplay.value,
      unit: selectedCarbonDisplay.unit,
      change: selectedChange.text,
      changeDirection: selectedChange.direction,
      icon: "industry-carbon",
      iconSrc: getIndustryKpiIconSrc("industry-carbon"),
      carbonTco2eq: selectedCarbon,
    },
    {
      label: "평균 탄소발자국 지수",
      value: formatDecimal(avgIndex),
      unit: "지수",
      change: indexChange.text,
      changeDirection: indexChange.direction,
      icon: "carbon-intensity",
      iconSrc: getIndustryKpiIconSrc("carbon-intensity"),
    },
    {
      label: "전체 대비 비중",
      value: formatDecimal(share, 1),
      unit: "%",
      change: shareChange.text,
      changeDirection: shareChange.direction,
      icon: "share-pie",
      iconSrc: getIndustryKpiIconSrc("share-pie"),
    },
    {
      label: "범위 내 총 탄소발자국",
      value: totalCarbonDisplay.value,
      unit: totalCarbonDisplay.unit,
      icon: "tourism-spend",
      iconSrc: getIndustryKpiIconSrc("tourism-spend"),
      carbonTco2eq: totalCarbon,
    },
    {
      label: "전년 대비 증감률",
      value: yoyDisplay.replace("%", ""),
      unit: "%",
      changeDirection: selectedChange.direction,
      valueTone:
        selectedChange.direction === "down"
          ? "down"
          : selectedChange.direction === "up"
            ? "up"
            : "neutral",
      icon: "yoy-trend",
      iconSrc: getIndustryKpiIconSrc("yoy-trend"),
    },
  ];
}

export function queryIndustryDashboard(
  query: IndustryDashboardQuery,
): IndustryDashboardData {
  const allRows = loadRegionExcelRows();
  const currentRows = filterIndustryScopeRows(allRows, query);
  const comparePeriod = getComparePeriod(query);
  const compareRows = filterIndustryScopeRows(allRows, {
    ...query,
    periodStart: comparePeriod.start,
    periodEnd: comparePeriod.end,
  });
  const { compareReliability, boundaryWarnings } =
    buildIndustryCompareReliability(query);

  const selectedColumns = resolveIndustryColumns(query.majorCode, query.midCode);
  const monthlyTrend = buildMonthlyTrend(currentRows, selectedColumns);

  return {
    periodLabel: formatPeriodLabel(query.periodStart, query.periodEnd),
    kpi: buildKpi(currentRows, compareRows, selectedColumns),
    majorIndustries: buildMajorIndustries(currentRows),
    midIndustries: buildMidIndustries(currentRows),
    midRanking: buildMidRanking(currentRows),
    monthlyTrend,
    monthlyHighlight: findMonthlyHighlight(monthlyTrend),
    boundaryWarnings,
    compareReliability,
  };
}


