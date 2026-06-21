"use client";

import { useEffect, useState } from "react";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { IndustryRankingTable } from "@/components/region-detail/IndustryRankingTable";
import { RegionDetailPageFilters } from "@/components/region-detail/RegionDetailPageFilters";
import { RegionDetailInsightPanel } from "@/components/region-detail/RegionDetailInsightPanel";
import {
  IndustryCompositionPanelLazy,
  RegionComparisonChartLazy,
  RegionDetailMapPanelLazy,
  RegionMonthlyTrendChartLazy,
} from "@/lib/lazy-dashboard-components";
import {
  buildRegionDetailSearchParams,
  DEFAULT_REGION_DETAIL_FILTERS,
  type RegionDetailFilters,
} from "@/lib/region-excel/client-detail";
import type {
  RegionDetailData,
  RegionDetailInsightsResponse,
} from "@/lib/region-excel/types";

type RegionDetailContentProps = {
  regionLabel: string;
};

export function RegionDetailContent({ regionLabel }: RegionDetailContentProps) {
  const [filters, setFilters] = useState<RegionDetailFilters>(
    DEFAULT_REGION_DETAIL_FILTERS,
  );
  const [data, setData] = useState<RegionDetailData | null>(null);
  const [insights, setInsights] = useState<RegionDetailInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildRegionDetailSearchParams(regionLabel, filters);

    setLoading(true);
    setError(null);

    fetch(`/api/region/detail?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "데이터를 불러오지 못했습니다.");
        }
        return response.json() as Promise<RegionDetailData>;
      })
      .then((nextData) => {
        setData(nextData);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
        );
        setLoading(false);
      });

    return () => controller.abort();
  }, [regionLabel, filters]);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildRegionDetailSearchParams(regionLabel, filters);

    setInsightsLoading(true);
    setInsightsError(null);
    setInsights(null);

    fetch(`/api/region/detail/insights?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "AI 요약을 생성하지 못했습니다.");
        }
        return response.json() as Promise<RegionDetailInsightsResponse>;
      })
      .then((nextInsights) => {
        setInsights(nextInsights);
        setInsightsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setInsightsError(
          err instanceof Error ? err.message : "AI 요약을 생성하지 못했습니다.",
        );
        setInsightsLoading(false);
      });

    return () => controller.abort();
  }, [regionLabel, filters]);

  const handleFiltersChange = (patch: Partial<RegionDetailFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const insightFooter = insights
    ? insights.source === "huggingface"
      ? `기준 기간: ${insights.periodLabel} · Hugging Face${insights.model ? ` (${insights.model})` : ""}`
      : `기준 기간: ${insights.periodLabel} · 규칙 기반 요약${insights.warning ? ` · ${insights.warning}` : ""}`
    : data?.periodLabel
      ? `기준 기간: ${data.periodLabel}`
      : undefined;

  const nationalRankKpi = data?.kpi[1];
  const trendDescription = data
    ? `선택 지역 · 전년(동월) · 전국 평균 · ${data.sidoNm} 평균`
    : "선택 지역 · 전년(동월) · 전국 평균 · 시도 평균";

  return (
    <>
      <DashboardFilterBar>
        <RegionDetailPageFilters
          selectedSigungu={regionLabel}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </DashboardFilterBar>

      {error ? (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <PanelSkeleton variant="chart" label="KPI 불러오는 중…" />
      ) : data ? (
        <KpiCardRow items={data.kpi} uniform />
      ) : null}

      <div className="dashboard-grid dashboard-grid--region-detail-2x3">
        <DashboardCard
          title="선택 지역 위치"
          description={regionLabel}
          className="dashboard-grid__cell"
        >
          {loading && !data ? (
            <PanelSkeleton variant="map" label="지도 불러오는 중…" />
          ) : (
            <RegionDetailMapPanelLazy
              regionLabel={regionLabel}
              periodLabel={data?.periodLabel ?? ""}
              mapValue={data?.mapValue ?? 0}
              nationalRank={nationalRankKpi?.value}
              nationalRankHint={nationalRankKpi?.hint}
              carbonByLabel={data?.mapByLabel}
            />
          )}
        </DashboardCard>

        <DashboardCard
          title="업종별 탄소발자국 구성"
          description="(tCO₂eq)"
          className="dashboard-grid__cell"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : (
            <IndustryCompositionPanelLazy items={data?.industryComposition ?? []} />
          )}
        </DashboardCard>

        <DashboardCard
          title="비교 분석 (관광 탄소발자국)"
          description="(tCO₂eq)"
          className="dashboard-grid__cell"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : (
            <RegionComparisonChartLazy items={data?.comparison ?? []} />
          )}
        </DashboardCard>

        <DashboardCard
          title="월별 관광 탄소발자국 추세"
          description={trendDescription}
          className="dashboard-grid__cell"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : data ? (
            <RegionMonthlyTrendChartLazy trend={data.monthlyTrend} />
          ) : null}
        </DashboardCard>

        <DashboardCard
          title="상위 업종(중분류) 순위"
          description="(tCO₂eq)"
          className="dashboard-grid__cell"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="표 불러오는 중…" />
          ) : (
            <IndustryRankingTable rows={data?.industryRanking ?? []} />
          )}
        </DashboardCard>

        <DashboardCard
          title="AI 인사이트"
          className="dashboard-grid__cell dashboard-grid__cell--insight"
        >
          <RegionDetailInsightPanel
            sections={
              insights?.sections ?? {
                evaluation: [],
                traveler: [],
                policy: [],
              }
            }
            loading={insightsLoading}
            error={insightsError}
            footer={insightFooter}
          />
        </DashboardCard>
      </div>
    </>
  );
}
