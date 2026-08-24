import fs from "fs";
import path from "path";
import {
  EXCEL_DATA_SHARED_DIR,
  POI_RUNTIME_JSON,
} from "@/lib/excel-data-paths";
import type { PoiRecord } from "@/lib/poi/types";

let cachedPois: PoiRecord[] | null = null;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizePoi(raw: Record<string, unknown>): PoiRecord | null {
  const id = String(raw.id ?? "").trim();
  const nm = String(raw.nm ?? "").trim();
  const sido = String(raw.sido ?? "").trim();
  const sgg = String(raw.sgg ?? "").trim();
  if (!id || !nm || !sido || !sgg) return null;

  return {
    id,
    nm,
    sido,
    sgg,
    lcls: String(raw.lcls ?? "").trim(),
    mcls: String(raw.mcls ?? "").trim(),
    scls: String(raw.scls ?? "").trim(),
    v: isFiniteNumber(raw.v) ? raw.v : 0,
    e: isFiniteNumber(raw.e) ? raw.e : 0,
    pc: isFiniteNumber(raw.pc) ? raw.pc : 0,
  };
}

export function loadPoiRecords(): PoiRecord[] {
  if (cachedPois) return cachedPois;

  const filePath = path.join(EXCEL_DATA_SHARED_DIR, POI_RUNTIME_JSON);
  if (!fs.existsSync(filePath)) {
    cachedPois = [];
    return cachedPois;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
  if (!Array.isArray(raw)) {
    cachedPois = [];
    return cachedPois;
  }

  cachedPois = raw
    .map((item) =>
      item && typeof item === "object"
        ? normalizePoi(item as Record<string, unknown>)
        : null,
    )
    .filter((item): item is PoiRecord => item != null);

  return cachedPois;
}

/** 테스트·핫리로드용 */
export function clearPoiCache(): void {
  cachedPois = null;
}
