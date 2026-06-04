/** Temporary sample 시군구 options for P1 filter navigation. */
export const SIGUNGU_OPTIONS = [
  "서울특별시 중구",
  "서울특별시 강남구",
  "부산광역시 해운대구",
  "제주특별자치도 제주시",
  "강원특별자치도 강릉시",
] as const;

export type SigunguOption = (typeof SIGUNGU_OPTIONS)[number];
