import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";
import { MAJOR_INDUSTRY_COLORS } from "@/lib/industry-excel/excel-columns";

/**
 * 업종 중심 페이지 6대분류와 동일한 묶음.
 * 컬럼명은 지역 JSON(엑셀) 중분류명 — 분류 라벨과 표기가 다른 경우만 보정.
 */
const REGION_JSON_COLUMN_BY_MID_LABEL: Record<string, string> = {
  기타숙박: "기타숙박",
  "캠핑장/펜션": "캠핑장/펜션",
  일반외식업: "일반외식업",
  제과음료업: "제과음료업",
  관광유원시설: "관광유원시설",
  대형쇼핑몰: "대형쇼핑몰",
  레저용품쇼핑: "레저용품쇼핑",
  기타관광쇼핑: "기타관광쇼핑",
};

function toRegionJsonColumn(midLabel: string): string {
  return REGION_JSON_COLUMN_BY_MID_LABEL[midLabel] ?? midLabel;
}

export type RegionIndustryMajorGroup = {
  value: string;
  label: string;
  columns: readonly string[];
  color: string;
};

export const REGION_INDUSTRY_MAJOR_GROUPS: readonly RegionIndustryMajorGroup[] =
  INDUSTRY_CLASSIFICATION.map((major) => ({
    value: major.value,
    label: major.label,
    columns: major.mid.map((mid) => toRegionJsonColumn(mid.label)),
    color: MAJOR_INDUSTRY_COLORS[major.value] ?? "#94a3b8",
  }));

/** Excel 업종(중분류) 컬럼 → 상세 화면 표시 그룹 (6대분류) */
export const REGION_INDUSTRY_COLUMN_GROUPS: Record<string, readonly string[]> =
  Object.fromEntries(
    REGION_INDUSTRY_MAJOR_GROUPS.map((group) => [group.label, group.columns]),
  );

export const REGION_INDUSTRY_COLUMNS = [
  ...new Set(REGION_INDUSTRY_MAJOR_GROUPS.flatMap((group) => [...group.columns])),
];

/** 중분류 22개 목록 (엑셀 컬럼명 + 표시 라벨) — 상위업종 순위 테이블용 */
export type RegionIndustryMidItem = {
  label: string;
  column: string;
  majorLabel: string;
};

export const REGION_MID_INDUSTRY_ITEMS: readonly RegionIndustryMidItem[] =
  INDUSTRY_CLASSIFICATION.flatMap((major) =>
    major.mid.map((mid) => ({
      label: mid.label,
      column: toRegionJsonColumn(mid.label),
      majorLabel: major.label,
    })),
  );
