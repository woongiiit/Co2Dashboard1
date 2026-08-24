import type { KpiItem } from "@/lib/mock-dashboard-data";

/** KPI 표시값(value+unit)을 tCO₂eq 원값으로 환산 */
export function kpiDisplayValueToTco2eq(value: string, unit?: string): number {
  const amount = Number.parseFloat(value.replace(/,/g, "") || "0");
  const normalizedUnit = unit ?? "";
  if (normalizedUnit.includes("백만")) return amount * 1_000_000;
  if (normalizedUnit.includes("천")) return amount * 1_000;
  return amount;
}

/** tCO₂eq 질량 KPI 여부 (지수·비중·순위 등 제외) */
export function isCarbonFootprintMassKpi(
  item: Pick<KpiItem, "label" | "unit">,
): boolean {
  const { label, unit = "" } = item;
  const isMassUnit =
    unit.includes("tCO₂eq") ||
    unit.includes("tCO2eq") ||
    unit.includes("tCO");

  if (!isMassUnit) return false;
  if (
    label.includes("지수") ||
    label.includes("1인당") ||
    label.includes("소비액당") ||
    label.includes("증감률") ||
    label.includes("비중") ||
    label.includes("순위")
  ) {
    return false;
  }

  return (
    label.includes("탄소발자국") ||
    label.includes("총량")
  );
}

export function resolveKpiCarbonTco2eq(
  item: Pick<KpiItem, "label" | "value" | "unit" | "carbonTco2eq">,
): number | null {
  if (item.carbonTco2eq != null && item.carbonTco2eq > 0) {
    return item.carbonTco2eq;
  }
  if (!isCarbonFootprintMassKpi(item)) return null;

  const tco2eq = kpiDisplayValueToTco2eq(item.value, item.unit);
  return tco2eq > 0 ? tco2eq : null;
}
