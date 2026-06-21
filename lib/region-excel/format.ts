import { KOREA_SIDO_OPTIONS } from "@/lib/korea-admin-regions";
import { CARBON_RAW_TO_TCO2EQ } from "@/lib/region-excel/constants";

export function formatPeriodLabel(start: string, end: string): string {
  const fmt = (ym: string) => {
    const [year, month] = ym.split("-");
    return `${year}.${month}`;
  };
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatDecimal(value: number, digits = 2): string {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function rawCarbonToTco2eq(raw: number): number {
  return raw / CARBON_RAW_TO_TCO2EQ;
}

export function isYmInRange(ym: string, start: string, end: string): boolean {
  return ym >= start && ym <= end;
}

export function shiftYmByYears(ym: string, years: number): string {
  const [year, month] = ym.split("-");
  return `${Number(year) - years}-${month}`;
}

export function getSidoLabelFromCode(code: string): string | null {
  if (code === "all") return null;
  return KOREA_SIDO_OPTIONS.find((option) => option.value === code)?.label ?? null;
}

export function formatChangePercent(current: number, previous: number): {
  text: string;
  direction: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return current === 0
      ? { text: "0.0%", direction: "neutral" }
      : { text: "—", direction: "neutral" };
  }

  const delta = ((current - previous) / previous) * 100;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  const sign = delta > 0 ? "+" : "";
  return {
    text: `${sign}${delta.toFixed(1)}%`,
    direction,
  };
}

export function formatChangePoint(current: number, previous: number): {
  text: string;
  direction: "up" | "down" | "neutral";
} {
  const delta = current - previous;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  const sign = delta > 0 ? "+" : "";
  return {
    text: `${sign}${delta.toFixed(1)}%p`,
    direction,
  };
}
