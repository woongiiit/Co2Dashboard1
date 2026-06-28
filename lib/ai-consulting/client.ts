import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
  KOREA_SIDO_OPTIONS,
} from "@/lib/korea-admin-regions";

export const DEFAULT_AI_CONSULTING_FILTERS = {
  sidoCode: "all",
  sigunguValue: "all",
  periodStart: DEFAULT_PERIOD_START,
  periodEnd: DEFAULT_PERIOD_END,
} as const;

export type AiConsultingFilterParams = {
  sidoCode: string;
  sigunguValue: string;
  periodStart: string;
  periodEnd: string;
};

/** regionLabel(예: 제주특별자치도 제주시) → AI 컨설팅 필터 */
export function resolveAiConsultingFiltersFromRegionLabel(
  regionLabel: string,
): Partial<AiConsultingFilterParams> | null {
  const trimmed = regionLabel.trim();
  if (!trimmed) return null;

  const sido = KOREA_SIDO_OPTIONS.find(
    (option) => option.value !== "all" && trimmed.startsWith(option.label),
  );
  if (!sido) return null;

  return {
    sidoCode: sido.value,
    sigunguValue: trimmed,
  };
}

export function buildAiConsultingSearchParams(filters: {
  sidoCode: string;
  sigunguValue: string;
  periodStart: string;
  periodEnd: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set("region", filters.sigunguValue);
  params.set("sido", filters.sidoCode);
  params.set("start", filters.periodStart);
  params.set("end", filters.periodEnd);
  params.set("compare", "yoy");
  return params;
}
