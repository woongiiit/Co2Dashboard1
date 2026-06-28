import type { KpiItem } from "@/lib/mock-dashboard-data";
import {
  MONTH_LABELS,
  type TrendYear,
} from "@/lib/charts/monthly-carbon-trend-data";
import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";
import { getIndustryKpiIconSrc } from "@/lib/industry-kpi-icons";
import {
  getExcelColumnsForMajor,
  getMajorIndustryDefinitions,
} from "@/lib/industry-excel/excel-columns";
import {
  buildIndustryCompareReliability,
  filterIndustryScopeRows,
  formatIndustryScopeLabel,
  formatPeriodLabel,
  loadRegionExcelRows,
  sumIndustryColumns,
} from "@/lib/industry-excel/shared";
import type {
  IndustryDeepAnalysisComparisonRow,
  IndustryDeepAnalysisData,
  IndustryDeepAnalysisQuery,
  IndustryCompositionBucket,
} from "@/lib/industry-excel/types";
import {
  formatChangePercent,
  formatInteger,
  isYmInRange,
  rawCarbonToTco2eq,
} from "@/lib/region-excel/format";
import { filterRowsPointInTime } from "@/lib/region-excel/resolve-admin-boundary";
import type { RegionExcelRow, RegionTrendSeries } from "@/lib/region-excel/types";

const PERIOD_START = "2023-01";
const PERIOD_END = "2026-04";
const TREND_YEARS: TrendYear[] = ["2023", "2024", "2025", "2026"];

const COMPOSITION_MONTHS = [
  { label: "23.01", year: 2023, month: 1 },
  { label: "23.04", year: 2023, month: 4 },
  { label: "23.07", year: 2023, month: 7 },
  { label: "23.10", year: 2023, month: 10 },
  { label: "24.01", year: 2024, month: 1 },
  { label: "24.04", year: 2024, month: 4 },
  { label: "24.07", year: 2024, month: 7 },
  { label: "24.10", year: 2024, month: 10 },
  { label: "25.01", year: 2025, month: 1 },
  { label: "25.04", year: 2025, month: 4 },
  { label: "25.07", year: 2025, month: 7 },
  { label: "25.10", year: 2025, month: 10 },
  { label: "26.01", year: 2026, month: 1 },
  { label: "26.04", year: 2026, month: 4 },
] as const;

function filterDeepAnalysisRows(
  allRows: RegionExcelRow[],
  query: IndustryDeepAnalysisQuery,
): RegionExcelRow[] {
  return filterIndustryScopeRows(allRows, {
    sidoCode: query.sidoCode,
    regionLabel: query.regionLabel,
    periodStart: PERIOD_START,
    periodEnd: PERIOD_END,
  });
}

function sumForYearRange(
  rows: RegionExcelRow[],
  columns: string[],
  startYm: string,
  endYm: string,
): number {
  const scoped = rows.filter((row) => isYmInRange(row.ym, startYm, endYm));
  return sumIndustryColumns(scoped, columns);
}

function buildYearlyKpi(rows: RegionExcelRow[], columns: string[]): KpiItem[] {
  const y2023 = sumForYearRange(rows, columns, "2023-01", "2023-12");
  const y2024 = sumForYearRange(rows, columns, "2024-01", "2024-12");
  const y2025 = sumForYearRange(rows, columns, "2025-01", "2025-12");
  const y2026 = sumForYearRange(rows, columns, "2026-01", "2026-04");

  const change2024 = formatChangePercent(
    y2024,
    sumForYearRange(rows, columns, "2023-01", "2023-12"),
  );
  const change2025 = formatChangePercent(
    y2025,
    sumForYearRange(rows, columns, "2024-01", "2024-12"),
  );
  const change2026 = formatChangePercent(
    y2026,
    sumForYearRange(rows, columns, "2025-01", "2025-04"),
  );

  const iconSrc = getIndustryKpiIconSrc("industry-carbon");

  return [
    {
      label: "2023 총량",
      value: formatInteger(y2023),
      unit: "tCO₂eq",
      unitOnLabel: true,
      icon: "industry-carbon",
      iconSrc,
    },
    {
      label: "2024 총량",
      value: formatInteger(y2024),
      unit: "tCO₂eq",
      unitOnLabel: true,
      change: change2024.text,
      changeDirection: change2024.direction,
      icon: "industry-carbon",
      iconSrc,
    },
    {
      label: "2025 총량",
      value: formatInteger(y2025),
      unit: "tCO₂eq",
      unitOnLabel: true,
      change: change2025.text,
      changeDirection: change2025.direction,
      icon: "industry-carbon",
      iconSrc,
    },
    {
      label: "2026.01~04 총량",
      value: formatInteger(y2026),
      unit: "tCO₂eq",
      unitOnLabel: true,
      change: change2026.text,
      changeDirection: change2026.direction,
      icon: "industry-carbon",
      iconSrc,
    },
  ];
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
      const ym = `${Number(year)}-${String(index + 1).padStart(2, "0")}`;
      if (!isYmInRange(ym, PERIOD_START, PERIOD_END)) return null;
      const value = monthlyTotals.get(`${Number(year)}-${index + 1}`);
      return value == null ? null : Math.round(value);
    });
  }
  return series;
}

function buildComposition(
  rows: RegionExcelRow[],
): IndustryDeepAnalysisData["composition"] {
  const majors = getMajorIndustryDefinitions();
  const industries = majors.map((major) => ({
    name: major.label,
    color: major.color,
  }));

  const buckets: IndustryCompositionBucket[] = COMPOSITION_MONTHS.map(
    (bucket) => {
      const ym = `${bucket.year}-${String(bucket.month).padStart(2, "0")}`;
      const monthRows = filterRowsPointInTime(
        rows.filter((row) => row.ym === ym),
      );
      const values = majors.map((major) =>
        sumIndustryColumns(monthRows, major.columns),
      );
      const total = values.reduce((sum, value) => sum + value, 0);
      const shares =
        total > 0
          ? values.map((value) => Math.round((value / total) * 1000) / 10)
          : values.map(() => 0);

      return { label: bucket.label, shares };
    },
  );

  return { industries, buckets };
}

function buildYoyGrowth(
  trend: RegionTrendSeries,
): IndustryDeepAnalysisData["yoyGrowth"] {
  return {
    "2024": trend["2024"].map((value, index) => {
      const prev = trend["2023"][index];
      if (value == null || prev == null || prev === 0) return null;
      return Math.round(((value - prev) / prev) * 1000) / 10;
    }),
    "2025": trend["2025"].map((value, index) => {
      const prev = trend["2024"][index];
      if (value == null || prev == null || prev === 0) return null;
      return Math.round(((value - prev) / prev) * 1000) / 10;
    }),
    "2026": trend["2026"].map((value, index) => {
      const prev = trend["2025"][index];
      if (value == null || prev == null || prev === 0) return null;
      return Math.round(((value - prev) / prev) * 1000) / 10;
    }),
  };
}

function formatChangeCell(
  current: number,
  previous: number,
): { text: string; direction: "up" | "down" | "neutral" } {
  const change = formatChangePercent(current, previous);
  return {
    text: change.text,
    direction: change.direction,
  };
}

function buildMonthlyAverageRow(
  rows: RegionExcelRow[],
  columns: string[],
): IndustryDeepAnalysisComparisonRow["values"] {
  const averages = [
    { year: 2023, months: 12 },
    { year: 2024, months: 12 },
    { year: 2025, months: 12 },
    { year: 2026, months: 4 },
  ].map(({ year, months }) => {
    const endMonth = year === 2026 ? 4 : 12;
    const total = sumForYearRange(
      rows,
      columns,
      `${year}-01`,
      `${year}-${String(endMonth).padStart(2, "0")}`,
    );
    return total / months;
  });

  const c2024 = formatChangeCell(averages[1], averages[0]);
  const c2025 = formatChangeCell(averages[2], averages[1]);
  const c2026 = formatChangeCell(
    averages[3],
    sumForYearRange(rows, columns, "2025-01", "2025-04") / 4,
  );

  return {
    y2023: formatInteger(averages[0]),
    y2024: formatInteger(averages[1]),
    y2024Change: c2024.text,
    y2024Direction: c2024.direction,
    y2025: formatInteger(averages[2]),
    y2025Change: c2025.text,
    y2025Direction: c2025.direction,
    y2026: formatInteger(averages[3]),
    y2026Change: c2026.text,
    y2026Direction: c2026.direction,
  };
}

function buildComparisonRows(
  rows: RegionExcelRow[],
  columns: string[],
): IndustryDeepAnalysisComparisonRow[] {
  const y2023 = sumForYearRange(rows, columns, "2023-01", "2023-12");
  const y2024 = sumForYearRange(rows, columns, "2024-01", "2024-12");
  const y2025 = sumForYearRange(rows, columns, "2025-01", "2025-12");
  const y2026 = sumForYearRange(rows, columns, "2026-01", "2026-04");

  const c2024 = formatChangeCell(y2024, y2023);
  const c2025 = formatChangeCell(y2025, y2024);
  const c2026 = formatChangeCell(
    y2026,
    sumForYearRange(rows, columns, "2025-01", "2025-04"),
  );

  return [
    {
      label: "총 탄소발자국",
      unit: "tCO₂eq",
      values: {
        y2023: formatInteger(y2023),
        y2024: formatInteger(y2024),
        y2024Change: c2024.text,
        y2024Direction: c2024.direction,
        y2025: formatInteger(y2025),
        y2025Change: c2025.text,
        y2025Direction: c2025.direction,
        y2026: formatInteger(y2026),
        y2026Change: c2026.text,
        y2026Direction: c2026.direction,
      },
    },
    {
      label: "월평균 탄소발자국",
      unit: "tCO₂eq",
      values: buildMonthlyAverageRow(rows, columns),
    },
  ];
}

export { parseIndustryDeepAnalysisQuery } from "@/lib/industry-excel/client";

export function queryIndustryDeepAnalysis(
  query: IndustryDeepAnalysisQuery,
): IndustryDeepAnalysisData {
  const allRows = loadRegionExcelRows();
  const rows = filterDeepAnalysisRows(allRows, query);
  const columns = getExcelColumnsForMajor(query.majorCode);
  const { compareReliability, boundaryWarnings } = buildIndustryCompareReliability({
    periodStart: PERIOD_START,
    periodEnd: PERIOD_END,
    compare: query.compare,
  });

  const monthlyTrend = buildMonthlyTrend(rows, columns);
  const major = INDUSTRY_CLASSIFICATION.find((item) => item.value === query.majorCode);

  return {
    periodLabel: formatPeriodLabel(PERIOD_START, PERIOD_END),
    scopeLabel: formatIndustryScopeLabel({
      sidoCode: query.sidoCode,
      regionLabel: query.regionLabel,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      compare: query.compare,
      majorCode: query.majorCode,
      midCode: "all",
    }),
    industryLabel: major?.label ?? "전체 업종",
    kpi: buildYearlyKpi(rows, columns),
    monthlyTrend,
    composition: buildComposition(rows),
    yoyGrowth: buildYoyGrowth(monthlyTrend),
    comparisonRows: buildComparisonRows(rows, columns),
    noticeItems: [
      "2026년은 4월까지 데이터이며, 동일기간 비교가 필요합니다.",
      "2023~2025년은 연간·동월 누적 기준입니다.",
      "업종별 구성비는 6대 대분류 합산 기준입니다.",
      "증감률은 전년 동기간(동월) 대비 기준입니다.",
    ],
    boundaryWarnings,
    compareReliability,
  };
}

export function buildFallbackIndustryDeepInsights(
  data: IndustryDeepAnalysisData,
): string[] {
  const totalRow = data.comparisonRows[0];
  if (!totalRow) {
    return ["업종 심화 분석 데이터가 충분하지 않습니다."];
  }

  return [
    `${data.scopeLabel}·${data.industryLabel} 기준 2025년 총 탄소발자국은 ${totalRow.values.y2025} tCO₂eq (${totalRow.values.y2025Change})입니다.`,
    `2026년 1~4월은 ${totalRow.values.y2026} tCO₂eq로 동기간 ${totalRow.values.y2026Change}입니다.`,
    `6대 업종 구성은 분기 월 기준으로 ${data.composition.industries[0]?.name ?? "—"} 등의 비중 변화를 확인할 수 있습니다.`,
  ].filter((line) => line.length >= 12);
}
