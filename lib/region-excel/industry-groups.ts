/** Excel 업종(중분류) 컬럼 → 상세 화면 표시 그룹 */
export const REGION_INDUSTRY_COLUMN_GROUPS: Record<string, readonly string[]> = {
  숙박업: ["기타숙박", "캠핑장/펜션", "콘도", "호텔"],
  음식점업: ["일반외식업", "제과음료업"],
  교통업: ["렌터카", "수상운송", "육상운송", "항공운송"],
  "여가·오락·문화업": [
    "골프장",
    "관광유원시설",
    "기타레저",
    "문화서비스",
    "스키장",
    "카지노",
    "뷰티",
    "의료관광",
  ],
  도소매업: ["기타관광쇼핑", "대형쇼핑몰", "레저용품쇼핑", "면세점"],
  "기타 업종": ["여행업"],
};

export const REGION_INDUSTRY_COLUMNS = [
  ...new Set(Object.values(REGION_INDUSTRY_COLUMN_GROUPS).flat()),
];
