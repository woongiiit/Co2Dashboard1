import type { RegionDetailKpiIconVariant } from "@/components/dashboard/KpiIcon";

/**
 * 지역 상세 분석 KPI 카드 아이콘 PNG 경로.
 * `public/images/region-detail/kpi/` 아래 파일명과 동일하게 넣으면 카드에 표시됩니다.
 */
export const REGION_DETAIL_KPI_ICON_DIR = "/images/region-detail/kpi";

const REGION_DETAIL_KPI_ICON_FILENAMES: Record<
  RegionDetailKpiIconVariant,
  string
> = {
  "detail-region-carbon": "detail-region-carbon.png",
  "detail-national-rank": "detail-national-rank.png",
  "detail-sido-rank": "detail-sido-rank.png",
  "detail-spend-intensity": "detail-spend-intensity.png",
};

export function getRegionDetailKpiIconSrc(
  variant: RegionDetailKpiIconVariant,
): string {
  return `${REGION_DETAIL_KPI_ICON_DIR}/${REGION_DETAIL_KPI_ICON_FILENAMES[variant]}`;
}

export const REGION_DETAIL_KPI_ICON_FILE_LIST = Object.values(
  REGION_DETAIL_KPI_ICON_FILENAMES,
);
