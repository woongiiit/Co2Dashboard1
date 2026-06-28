import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";

/** 중분류 filter value → Excel 컬럼명 */
export const EXCEL_COLUMN_BY_MID_VALUE: Record<string, string> = {
  hotel: "호텔",
  condo: "콘도",
  "camping-pension": "캠핑장/펜션",
  "other-lodging": "기타숙박",
  "land-transport": "육상운송",
  "water-transport": "수상운송",
  "air-transport": "항공운송",
  "rental-car": "렌터카",
  "duty-free": "면세점",
  "large-mall": "대형쇼핑몰",
  "leisure-goods-shopping": "레저용품쇼핑",
  "other-tourism-shopping": "기타관광쇼핑",
  casino: "카지노",
  "amusement-facility": "관광유원시설",
  golf: "골프장",
  ski: "스키장",
  "other-leisure": "기타레저",
  "cultural-services": "문화서비스",
  "medical-tourism": "의료관광",
  beauty: "뷰티",
  "general-restaurant": "일반외식업",
  "bakery-beverage": "제과음료업",
};

export const MAJOR_INDUSTRY_COLORS: Record<string, string> = {
  lodging: "#9DD9B8",
  transport: "#C4B8EA",
  shopping: "#9ADFD8",
  leisure: "#F5C9A8",
  "medical-wellness": "#B5E6C8",
  "food-beverage": "#F2B8D4",
};

export const ALL_EXCEL_INDUSTRY_COLUMNS = [
  ...new Set([...Object.values(EXCEL_COLUMN_BY_MID_VALUE), "여행업"]),
];

export function getExcelColumnsForMajor(majorValue: string): string[] {
  if (majorValue === "all") return ALL_EXCEL_INDUSTRY_COLUMNS;

  const major = INDUSTRY_CLASSIFICATION.find((item) => item.value === majorValue);
  if (!major) return ALL_EXCEL_INDUSTRY_COLUMNS;

  return major.mid
    .map((mid) => EXCEL_COLUMN_BY_MID_VALUE[mid.value])
    .filter((column): column is string => Boolean(column));
}

export function resolveIndustryColumns(
  majorCode: string,
  midCode: string,
): string[] {
  if (midCode !== "all") {
    const column = EXCEL_COLUMN_BY_MID_VALUE[midCode];
    return column ? [column] : getExcelColumnsForMajor(majorCode);
  }
  return getExcelColumnsForMajor(majorCode);
}

export function getMajorIndustryDefinitions(): Array<{
  value: string;
  label: string;
  columns: string[];
  color: string;
}> {
  return INDUSTRY_CLASSIFICATION.map((major) => ({
    value: major.value,
    label: major.label,
    columns: major.mid
      .map((mid) => EXCEL_COLUMN_BY_MID_VALUE[mid.value])
      .filter((column): column is string => Boolean(column)),
    color: MAJOR_INDUSTRY_COLORS[major.value] ?? "#94a3b8",
  }));
}

export function getMidIndustryDefinitions(): Array<{
  value: string;
  label: string;
  column: string;
  majorLabel: string;
}> {
  return INDUSTRY_CLASSIFICATION.flatMap((major) =>
    major.mid
      .map((mid) => {
        const column = EXCEL_COLUMN_BY_MID_VALUE[mid.value];
        if (!column) return null;
        return {
          value: mid.value,
          label: mid.label,
          column,
          majorLabel: major.label,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item != null),
  );
}

/** @deprecated 심화분석은 sidoCode·regionLabel 사용. 구 URL 호환용 */
export function resolveDeepAnalysisRegionLabel(regionValue: string): string | null {
  switch (regionValue) {
    case "gangwon-gangneung":
      return "강원특별자치도 강릉시";
    case "jeju-jeju":
      return "제주특별자치도 제주시";
    default:
      return null;
  }
}
