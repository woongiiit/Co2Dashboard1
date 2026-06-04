import type { RegionKpiIconVariant } from "@/components/dashboard/KpiIcon";

/**
 * 지역 중심 KPI 카드 아이콘 PNG 경로.
 * `public/images/region/kpi/` 아래 파일명과 동일하게 넣으면 카드에 표시됩니다.
 */
export const REGION_KPI_ICON_DIR = "/images/region/kpi";

const REGION_KPI_ICON_FILENAMES: Record<RegionKpiIconVariant, string> = {
  "region-total-carbon": "region-total-carbon.png",
  "region-per-capita": "region-per-capita.png",
  "region-spend-intensity": "region-spend-intensity.png",
  "region-top-share": "region-top-share.png",
  "region-priority": "region-priority.png",
};

export function getRegionKpiIconSrc(variant: RegionKpiIconVariant): string {
  return `${REGION_KPI_ICON_DIR}/${REGION_KPI_ICON_FILENAMES[variant]}`;
}

export const REGION_KPI_ICON_FILE_LIST = Object.values(REGION_KPI_ICON_FILENAMES);
