import fs from "fs";
import path from "path";
import {
  EXCEL_DATA_REGION_DIR,
  REGION_SOURCE_EXCEL,
  REGION_SOURCE_EXCEL_DOWNLOAD_NAME,
} from "@/lib/excel-data-paths";

export function getRegionSourceExcelPath(): string {
  return path.join(EXCEL_DATA_REGION_DIR, REGION_SOURCE_EXCEL);
}

export function readRegionSourceExcelBuffer(): Buffer {
  const filePath = getRegionSourceExcelPath();

  if (!fs.existsSync(filePath)) {
    throw new Error("원본 엑셀 파일을 찾을 수 없습니다.");
  }

  return fs.readFileSync(filePath);
}

export function buildRegionSourceExcelContentDisposition(): string {
  const asciiFallback = "carbon-footprint-source.xlsx";
  const encoded = encodeURIComponent(REGION_SOURCE_EXCEL_DOWNLOAD_NAME);

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
