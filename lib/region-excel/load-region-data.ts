import fs from "fs";
import path from "path";
import { EXCEL_DATA_REGION_DIR } from "@/lib/excel-data-paths";
import type { RegionExcelRow } from "@/lib/region-excel/types";

export const REGION_DASHBOARD_JSON = "region-dashboard.json";

type RegionDashboardJsonFile = {
  meta?: {
    sourceFile?: string;
    generatedAt?: string;
    rowCount?: number;
    formatVersion?: number;
  };
  rows: RegionExcelRow[];
};

function resolveRegionJsonPath(): string {
  const jsonPath = path.join(EXCEL_DATA_REGION_DIR, REGION_DASHBOARD_JSON);

  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `지역 JSON 데이터가 없습니다: ${jsonPath}\n` +
        "python data/processor/convert_region_excel.py 를 실행해 변환하세요.",
    );
  }

  return jsonPath;
}

function validateRow(row: RegionExcelRow, index: number): RegionExcelRow {
  if (
    !row.sidoNm ||
    !row.sggNm ||
    !row.regionLabel ||
    !row.ym ||
    !Number.isFinite(row.year) ||
    !Number.isFinite(row.month) ||
    !Number.isFinite(row.carbonRaw) ||
    !Number.isFinite(row.carbonIndex)
  ) {
    throw new Error(`JSON 행 ${index + 1} 형식이 올바르지 않습니다.`);
  }

  if (row.industries != null && typeof row.industries !== "object") {
    throw new Error(`JSON 행 ${index + 1} industries 형식이 올바르지 않습니다.`);
  }

  return {
    ...row,
    industries: row.industries ?? {},
  };
}

let cachedRows: RegionExcelRow[] | null = null;

export function loadRegionExcelRows(): RegionExcelRow[] {
  if (cachedRows) return cachedRows;

  const filePath = resolveRegionJsonPath();
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as RegionDashboardJsonFile;

  if (!Array.isArray(parsed.rows) || parsed.rows.length === 0) {
    throw new Error("JSON rows 배열이 비어 있습니다.");
  }

  cachedRows = parsed.rows.map(validateRow);

  return cachedRows;
}

export function clearRegionExcelCache(): void {
  cachedRows = null;
}
