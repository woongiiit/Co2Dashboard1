import type { AiConsultingKpiIconVariant } from "@/components/dashboard/KpiIcon";

/**
 * AI 컨설팅 KPI 카드 아이콘 PNG 경로.
 * `public/images/ai-consulting/kpi/` 아래 파일명과 동일하게 넣으면 카드에 표시됩니다.
 */
export const AI_CONSULTING_KPI_ICON_DIR = "/images/ai-consulting/kpi";

const AI_CONSULTING_KPI_ICON_FILENAMES: Record<
  AiConsultingKpiIconVariant,
  string
> = {
  "ai-total-carbon": "ai-total-carbon.png",
  "ai-national-rank": "ai-national-rank.png",
  "ai-major-industry": "ai-major-industry.png",
  "ai-trend": "ai-trend.png",
};

export function getAiConsultingKpiIconSrc(
  variant: AiConsultingKpiIconVariant,
): string {
  return `${AI_CONSULTING_KPI_ICON_DIR}/${AI_CONSULTING_KPI_ICON_FILENAMES[variant]}`;
}

export const AI_CONSULTING_KPI_ICON_FILE_LIST = Object.values(
  AI_CONSULTING_KPI_ICON_FILENAMES,
);
