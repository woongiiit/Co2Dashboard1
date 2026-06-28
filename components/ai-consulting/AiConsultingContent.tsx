"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { AiConsultingContentGrid } from "@/components/ai-consulting/AiConsultingContentGrid";
import { AiConsultingFilterApplyButton } from "@/components/ai-consulting/AiConsultingFilterApplyButton";
import {
  AiConsultingPageFilters,
  type AiConsultingFilterState,
} from "@/components/ai-consulting/AiConsultingPageFilters";
import {
  buildAiConsultingSearchParams,
  DEFAULT_AI_CONSULTING_FILTERS,
  resolveAiConsultingFiltersFromRegionLabel,
} from "@/lib/ai-consulting/client";
import type {
  AiConsultingDashboardData,
  AiConsultingInsightsResponse,
  PriorityActionTask,
} from "@/lib/ai-consulting/types";

const EMPTY_TASKS: PriorityActionTask[] = [
  { id: "short", label: "단기 (~ 1년)", items: [] },
  { id: "mid", label: "중기 (1 ~ 3년)", items: [] },
  { id: "long", label: "장기 (3년 ~)", items: [] },
];

function buildInitialFilters(searchParams: URLSearchParams): AiConsultingFilterState {
  const region = searchParams.get("region");
  if (!region) {
    return { ...DEFAULT_AI_CONSULTING_FILTERS };
  }

  const patch = resolveAiConsultingFiltersFromRegionLabel(region);
  if (!patch) {
    return { ...DEFAULT_AI_CONSULTING_FILTERS };
  }

  return {
    ...DEFAULT_AI_CONSULTING_FILTERS,
    ...patch,
  };
}

export function AiConsultingContent() {
  const searchParams = useSearchParams();

  const [draftFilters, setDraftFilters] = useState<AiConsultingFilterState>(() =>
    buildInitialFilters(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<AiConsultingFilterState>(() =>
    buildInitialFilters(searchParams),
  );
  const [dashboard, setDashboard] = useState<AiConsultingDashboardData | null>(null);
  const [insights, setInsights] = useState<AiConsultingInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const handleFiltersChange = useCallback(
    (patch: Partial<AiConsultingFilterState>) => {
      setDraftFilters((prev) => {
        const next = { ...prev, ...patch };
        const unchanged =
          next.sidoCode === prev.sidoCode &&
          next.sigunguValue === prev.sigunguValue &&
          next.periodStart === prev.periodStart &&
          next.periodEnd === prev.periodEnd;
        return unchanged ? prev : next;
      });
    },
    [],
  );

  const fetchData = useCallback(async (filters: AiConsultingFilterState) => {
    const params = buildAiConsultingSearchParams(filters);
    setError(null);
    setLoading(true);
    setInsightsLoading(true);
    setDashboard(null);
    setInsights(null);

    try {
      const [dashboardRes, insightsRes] = await Promise.all([
        fetch(`/api/ai-consulting/dashboard?${params.toString()}`),
        fetch(`/api/ai-consulting/insights?${params.toString()}`),
      ]);

      if (!dashboardRes.ok) {
        const body = (await dashboardRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "데이터를 불러오지 못했습니다.");
      }

      const dashboardData = (await dashboardRes.json()) as AiConsultingDashboardData;
      setDashboard(dashboardData);
      setLoading(false);

      if (!insightsRes.ok) {
        const body = (await insightsRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "AI 컨설팅을 생성하지 못했습니다.");
      }

      const insightsData = (await insightsRes.json()) as AiConsultingInsightsResponse;
      setInsights(insightsData);
      setInsightsLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
      setLoading(false);
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(appliedFilters);
  }, [appliedFilters, fetchData]);

  const handleApply = () => {
    setError(null);
    setAppliedFilters({ ...draftFilters });
  };

  const priorityTasks = useMemo((): PriorityActionTask[] => {
    const actions = insights?.sections.priorityActions;
    if (!actions) return EMPTY_TASKS;
    return [
      { id: "short", label: "단기 (~ 1년)", items: actions.short },
      { id: "mid", label: "중기 (1 ~ 3년)", items: actions.mid },
      { id: "long", label: "장기 (3년 ~)", items: actions.long },
    ];
  }, [insights]);

  const radar = dashboard?.radar ?? {
    indicators: ["총 배출량", "1인당 배출", "산업 집중도", "증가 추세", "감축 잠재력"],
    region: [50, 50, 50, 50, 50],
    national: [50, 50, 50, 50, 50],
  };

  return (
    <>
      <DashboardFilterBar>
        <AiConsultingPageFilters
          filters={draftFilters}
          onFiltersChange={handleFiltersChange}
        />
        <div className="dashboard-filter__apply">
          <AiConsultingFilterApplyButton
            onApply={handleApply}
            loading={loading || insightsLoading}
          />
        </div>
      </DashboardFilterBar>

      {error ? (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <PanelSkeleton variant="chart" label="KPI 불러오는 중…" />
      ) : dashboard ? (
        <KpiCardRow items={dashboard.kpi} uniform />
      ) : null}

      <AiConsultingContentGrid
        regionalEvaluation={insights?.sections.regionalEvaluation ?? []}
        travelerGuide={insights?.sections.travelerGuide ?? []}
        governmentConsulting={insights?.sections.governmentConsulting ?? []}
        priorityTasks={priorityTasks}
        oneLineRecommendation={insights?.sections.oneLineRecommendation ?? ""}
        sectorEmission={dashboard?.sectorEmission ?? []}
        radar={radar}
        insightsLoading={insightsLoading}
      />
    </>
  );
}
