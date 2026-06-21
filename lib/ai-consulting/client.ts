import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
} from "@/lib/korea-admin-regions";

export const DEFAULT_AI_CONSULTING_FILTERS = {
  sidoCode: "39",
  sigunguValue: "제주특별자치도 제주시",
  periodStart: DEFAULT_PERIOD_START,
  periodEnd: DEFAULT_PERIOD_END,
} as const;

export function buildAiConsultingSearchParams(filters: {
  sigunguValue: string;
  periodStart: string;
  periodEnd: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set("region", filters.sigunguValue);
  params.set("start", filters.periodStart);
  params.set("end", filters.periodEnd);
  params.set("compare", "yoy");
  return params;
}
