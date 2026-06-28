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
import { rowMatchesRegionLabel } from "@/lib/region-excel/admin-boundary-registry";
import {
  buildBoundaryWarningMessages,
  detectCompareReliability,
  filterRowsPointInTime,
} from "@/lib/region-excel/resolve-admin-boundary";
import type { RegionExcelRow } from "@/lib/region-excel/types";
import type { IndustryDashboardQuery } from "@/lib/industry-excel/types";

export function filterIndustryScopeRows(
  rows: RegionExcelRow[],
  query: Pick<
    IndustryDashboardQuery,
    "sidoCode" | "regionLabel" | "periodStart" | "periodEnd"
  >,
): RegionExcelRow[] {
  const sidoLabel = getSidoLabelFromCode(query.sidoCode);

  return rows.filter((row) => {
    if (sidoLabel && row.sidoNm !== sidoLabel) return false;
    if (query.regionLabel !== "all" && !rowMatchesRegionLabel(row, query.regionLabel)) {
      return false;
    }
    return isYmInRange(row.ym, query.periodStart, query.periodEnd);
  });
}

export function getComparePeriod(query: {
  periodStart: string;
  periodEnd: string;
  compare: "yoy" | "prev";
}): { start: string; end: string } {
  return query.compare === "prev"
    ? getPreviousPeriod(query.periodStart, query.periodEnd)
    : {
        start: shiftYmByYears(query.periodStart, 1),
        end: shiftYmByYears(query.periodEnd, 1),
      };
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

export function sumIndustryColumns(
  rows: RegionExcelRow[],
  columns: string[],
): number {
  let total = 0;
  for (const row of filterRowsPointInTime(rows)) {
    for (const column of columns) {
      total += rawCarbonToTco2eq(row.industries?.[column] ?? 0);
    }
  }
  return total;
}

export function weightedIndustryIndex(
  rows: RegionExcelRow[],
  columns: string[],
): number {
  let weighted = 0;
  let total = 0;

  for (const row of filterRowsPointInTime(rows)) {
    for (const column of columns) {
      const carbon = rawCarbonToTco2eq(row.industries?.[column] ?? 0);
      if (carbon <= 0) continue;
      weighted += carbon * row.carbonIndex;
      total += carbon;
    }
  }

  return total > 0 ? weighted / total : 0;
}

export function parseIndustryDashboardQuery(
  searchParams: URLSearchParams,
): IndustryDashboardQuery {
  return {
    sidoCode: searchParams.get("sido") ?? "all",
    regionLabel: searchParams.get("region") ?? "all",
    periodStart: searchParams.get("start") ?? "2023-01",
    periodEnd: searchParams.get("end") ?? "2026-04",
    compare: searchParams.get("compare") === "prev" ? "prev" : "yoy",
    majorCode: searchParams.get("major") ?? "all",
    midCode: searchParams.get("mid") ?? "all",
  };
}

export function buildIndustryCompareReliability(
  query: Pick<IndustryDashboardQuery, "periodStart" | "periodEnd" | "compare">,
) {
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

  return { comparePeriod, compareReliability, boundaryWarnings };
}

export function formatIndustryScopeLabel(query: IndustryDashboardQuery): string {
  if (query.regionLabel !== "all") return query.regionLabel;
  const sidoLabel = getSidoLabelFromCode(query.sidoCode);
  return sidoLabel ?? "전국";
}

export { formatPeriodLabel, loadRegionExcelRows };
