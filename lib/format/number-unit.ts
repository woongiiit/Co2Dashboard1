/** 숫자와 붙여 쓰는 한글·기호 단위 (띄어쓰기 없음) */
const ATTACHED_UNITS = new Set([
  "개",
  "위",
  "월",
  "%",
  "명",
  "건",
  "회",
  "배",
  "년",
  "지수",
]);

export function isAttachedUnit(unit: string | undefined | null): boolean {
  if (!unit) return false;
  return ATTACHED_UNITS.has(unit.trim());
}

/** 값+단위 표기: 개/%/위 등은 붙이고, tCO₂eq 등은 한 칸 띄움 */
export function formatNumberWithUnit(
  value: string | number,
  unit?: string | null,
): string {
  if (!unit) return String(value);
  const trimmed = unit.trim();
  if (!trimmed) return String(value);
  return isAttachedUnit(trimmed)
    ? `${value}${trimmed}`
    : `${value} ${trimmed}`;
}

/** AI/카피 문구에서 "12 월", "10 개" 형태를 붙여 씀으로 정규화 */
export function normalizeKoreanNumberUnitSpacing(text: string): string {
  return text.replace(
    /(\d+(?:[.,]\d+)?)\s+(개|위|월|%|명|건|회|배|년)/g,
    "$1$2",
  );
}

/** 차트 값축 눈금용 축약 (겹침 완화) */
export function formatAxisCo2(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const scaled = value / 1_000_000;
    const digits = Math.abs(scaled) >= 10 ? 0 : 1;
    return `${scaled.toFixed(digits)}백만`;
  }
  if (abs >= 10_000) {
    const scaled = value / 1_000;
    const digits = Math.abs(scaled) >= 100 ? 0 : 1;
    return `${scaled.toFixed(digits)}천`;
  }
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: abs >= 100 ? 0 : 1,
  }).format(value);
}
