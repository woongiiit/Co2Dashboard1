export const COMPARE_CRITERIA_HINT =
  "전년 동기간(동월) 대비: 선택한 시작·종료 연월을 각각 1년 앞당긴 같은 구간과 비교합니다. (예: 2024.01~2025.04 → 2023.01~2024.04)\n" +
  "직전 기간 대비: 선택 기간과 같은 개월 수의 바로 앞 구간과 비교합니다. (예: 2024.01~2024.06 → 2023.07~2023.12)";

export function compareCriteriaLabel(compare: "yoy" | "prev"): string {
  return compare === "prev" ? "직전 기간 대비" : "전년 동기간 대비";
}
