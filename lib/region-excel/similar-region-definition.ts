/** findSimilarRegionLabels()와 동일 — 배출량 차이 기준 상위 N개 */
export const SIMILAR_REGION_PEER_COUNT = 3;

export const SIMILAR_REGION_DEFINITION_LINES = [
  `유사 지역은 선택 지역과 기간 종료 시점의 총 관광 탄소발자국(tCO₂eq) 규모가 가장 비슷한 전국 시군구 ${SIMILAR_REGION_PEER_COUNT}곳입니다.`,
  "전국 시군구 중 선택 지역과 배출량 차이(절대값)가 작은 순으로 자동 선정됩니다.",
  `‘유사 지역 평균’은 위 ${SIMILAR_REGION_PEER_COUNT}개 지역 배출량의 산술 평균입니다.`,
] as const;

export function getSimilarRegionDefinitionAriaLabel(): string {
  return SIMILAR_REGION_DEFINITION_LINES.join(" ");
}
