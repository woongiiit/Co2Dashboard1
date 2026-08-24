import { formatDecimal, formatInteger } from "@/lib/region-excel/format";

/** 소나무 1그루 연간 CO₂ 흡수량(kg) */
export const TREE_ANNUAL_CO2_ABSORPTION_KG = 22;

/** 승용차 1대 연간 배출량(tCO₂eq) — 국내 평균 가정 */
export const PASSENGER_CAR_ANNUAL_TCO2 = 4.6;

/** 승용차 1대 연간 주행거리(km) */
export const PASSENGER_CAR_ANNUAL_KM = 12_000;

/** 가구 1채 연간 전력 사용 탄소(tCO₂eq) */
export const HOUSEHOLD_ANNUAL_ELECTRICITY_TCO2 = 0.6;

/** 서울↔제주 왕복 1회 1인 탄소(tCO₂eq) */
export const SEOUL_JEJU_ROUNDTRIP_TCO2 = 0.2;

/** 일반쓰레기 1톤 매립 시 탄소(tCO₂eq) */
export const LANDFILL_EMISSION_PER_TON_WASTE = 0.46;

export function formatEquivalentMagnitude(value: number): string {
  if (value <= 0) return "0";
  if (value >= 100_000_000) {
    const eok = value / 100_000_000;
    return `${formatDecimal(eok, eok >= 10 ? 0 : 1)}억`;
  }
  if (value >= 10_000) {
    const man = value / 10_000;
    return `${formatDecimal(man, man >= 100 ? 0 : 1)}만`;
  }
  return formatInteger(value);
}

export function estimateTreeEquivalentCount(tco2eq: number): number {
  if (!Number.isFinite(tco2eq) || tco2eq <= 0) return 0;
  return Math.round((tco2eq * 1000) / TREE_ANNUAL_CO2_ABSORPTION_KG);
}

export function buildCarbonEquivalentMessages(tco2eq: number): string[] {
  if (!Number.isFinite(tco2eq) || tco2eq <= 0) return [];

  const trees = estimateTreeEquivalentCount(tco2eq);
  const carKm = Math.round(
    (tco2eq * PASSENGER_CAR_ANNUAL_KM) / PASSENGER_CAR_ANNUAL_TCO2,
  );
  const households = Math.round(tco2eq / HOUSEHOLD_ANNUAL_ELECTRICITY_TCO2);
  const flights = Math.round(tco2eq / SEOUL_JEJU_ROUNDTRIP_TCO2);
  const wasteTons = Math.round(tco2eq / LANDFILL_EMISSION_PER_TON_WASTE);

  return [
    `나무 ${formatEquivalentMagnitude(trees)}그루를 심었을 때 가치와 같아요.`,
    `승용차 1대가 약 ${formatEquivalentMagnitude(carKm)}km 주행할 때 나오는 배출량과 같아요.`,
    `가구 ${formatEquivalentMagnitude(households)}채가 1년 쓰는 전력의 탄소와 비슷해요.`,
    `서울↔제주 왕복 약 ${formatEquivalentMagnitude(flights)}회 분량과 같아요.`,
    `일반쓰레기 ${formatEquivalentMagnitude(wasteTons)}톤 매립 시 발생 탄소와 비슷해요.`,
  ];
}

/** @deprecated buildCarbonEquivalentMessages 사용 */
export function buildTreeEquivalentMessage(tco2eq: number): string {
  return buildCarbonEquivalentMessages(tco2eq)[0] ?? "";
}
