/** 관광 업종 분류: 대분류 6 · 중분류 22 */

export type FilterOption = { value: string; label: string };

export type IndustryMidDefinition = {
  value: string;
  label: string;
};

export type IndustryMajorDefinition = {
  value: string;
  label: string;
  mid: readonly IndustryMidDefinition[];
};

export const INDUSTRY_CLASSIFICATION: readonly IndustryMajorDefinition[] = [
  {
    value: "lodging",
    label: "숙박업",
    mid: [
      { value: "hotel", label: "호텔" },
      { value: "condo", label: "콘도" },
      { value: "camping-pension", label: "캠핑장/펜션" },
      { value: "other-lodging", label: "기타숙박" },
    ],
  },
  {
    value: "transport",
    label: "운송업",
    mid: [
      { value: "land-transport", label: "육상운송" },
      { value: "water-transport", label: "수상운송" },
      { value: "air-transport", label: "항공운송" },
      { value: "rental-car", label: "렌터카" },
    ],
  },
  {
    value: "shopping",
    label: "쇼핑업",
    mid: [
      { value: "duty-free", label: "면세점" },
      { value: "large-mall", label: "대형쇼핑몰" },
      { value: "leisure-goods-shopping", label: "레저용품쇼핑" },
      { value: "other-tourism-shopping", label: "기타관광쇼핑" },
    ],
  },
  {
    value: "leisure",
    label: "여가서비스업",
    mid: [
      { value: "casino", label: "카지노" },
      { value: "amusement-facility", label: "관광유원시설" },
      { value: "golf", label: "골프장" },
      { value: "ski", label: "스키장" },
      { value: "other-leisure", label: "기타레저" },
      { value: "cultural-services", label: "문화서비스" },
    ],
  },
  {
    value: "medical-wellness",
    label: "의료웰니스업",
    mid: [
      { value: "medical-tourism", label: "의료관광" },
      { value: "beauty", label: "뷰티" },
    ],
  },
  {
    value: "food-beverage",
    label: "식음료업",
    mid: [
      { value: "general-restaurant", label: "일반외식업" },
      { value: "bakery-beverage", label: "제과음료업" },
    ],
  },
] as const;

const ALL_MID_OPTIONS: FilterOption[] = INDUSTRY_CLASSIFICATION.flatMap(
  (major) => major.mid.map((mid) => ({ value: mid.value, label: mid.label })),
);

export const INDUSTRY_MAJOR_OPTIONS: FilterOption[] = [
  { value: "all", label: "전체" },
  ...INDUSTRY_CLASSIFICATION.map((major) => ({
    value: major.value,
    label: major.label,
  })),
];

export const INDUSTRY_MID_OPTIONS: FilterOption[] = [
  { value: "all", label: "전체" },
  ...ALL_MID_OPTIONS,
];

export function getIndustryMidOptionsForMajor(majorValue: string): FilterOption[] {
  if (majorValue === "all") {
    return INDUSTRY_MID_OPTIONS;
  }

  const major = INDUSTRY_CLASSIFICATION.find((item) => item.value === majorValue);
  if (!major) {
    return INDUSTRY_MID_OPTIONS;
  }

  return [
    { value: "all", label: "전체" },
    ...major.mid.map((mid) => ({ value: mid.value, label: mid.label })),
  ];
}

export function isMidValidForMajor(majorValue: string, midValue: string): boolean {
  if (midValue === "all") return true;
  return getIndustryMidOptionsForMajor(majorValue).some((opt) => opt.value === midValue);
}
