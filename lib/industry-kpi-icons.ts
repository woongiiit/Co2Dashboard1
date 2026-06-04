import type { IndustryKpiIconVariant } from "@/components/dashboard/KpiIcon";

/**
 * 업종 중심 KPI 카드 아이콘 PNG 경로.
 * `public/images/industry/kpi/` 아래 파일명과 동일하게 넣으면 카드에 표시됩니다.
 */
export const INDUSTRY_KPI_ICON_DIR = "/images/industry/kpi";

const INDUSTRY_KPI_ICON_FILENAMES: Record<IndustryKpiIconVariant, string> = {
  "industry-carbon": "industry-carbon.png",
  "share-pie": "share-pie.png",
  "tourism-spend": "tourism-spend.png",
  "carbon-intensity": "carbon-intensity.png",
  "yoy-trend": "yoy-trend.png",
};

export function getIndustryKpiIconSrc(variant: IndustryKpiIconVariant): string {
  return `${INDUSTRY_KPI_ICON_DIR}/${INDUSTRY_KPI_ICON_FILENAMES[variant]}`;
}

export const INDUSTRY_KPI_ICON_FILE_LIST = Object.values(
  INDUSTRY_KPI_ICON_FILENAMES,
);
