import type { KpiItem } from "@/lib/mock-dashboard-data";
import type { CompareReliability } from "@/lib/region-excel/admin-boundary-types";

export type AiConsultingQuery = {
  regionLabel: string;
  periodStart: string;
  periodEnd: string;
  compare: "yoy" | "prev";
};

export type SectorEmissionItem = {
  name: string;
  value: number;
  share: number;
};

export type TravelerGuideItem = {
  id: "transport" | "lodging" | "food" | "waste" | "activity";
  title: string;
  description: string;
};

export type PriorityActionTask = {
  id: "short" | "mid" | "long";
  label: string;
  items: string[];
};

export type AiConsultingRadarData = {
  indicators: string[];
  region: number[];
  national: number[];
};

export type AiConsultingDashboardData = {
  regionLabel: string;
  periodLabel: string;
  kpi: KpiItem[];
  sectorEmission: SectorEmissionItem[];
  radar: AiConsultingRadarData;
  compareReliability: CompareReliability;
};

export type AiConsultingInsightsSections = {
  regionalEvaluation: string[];
  travelerGuide: TravelerGuideItem[];
  governmentConsulting: string[];
  priorityActions: {
    short: string[];
    mid: string[];
    long: string[];
  };
  oneLineRecommendation: string;
};

export type AiConsultingInsightsResponse = {
  sections: AiConsultingInsightsSections;
  source: "huggingface" | "fallback";
  periodLabel: string;
  regionLabel: string;
  model?: string;
  warning?: string;
};
