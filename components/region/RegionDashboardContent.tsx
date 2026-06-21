"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { PlaceholderTable } from "@/components/dashboard/PlaceholderTable";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { RegionCarbonMapLazy } from "@/lib/lazy-dashboard-components";
import dynamic from "next/dynamic";
import { RegionPageFilters } from "@/components/region/RegionPageFilters";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import {
  buildRegionDashboardSearchParams,
  DEFAULT_REGION_DASHBOARD_QUERY,
} from "@/lib/region-excel/client";
import { buildRegionTrendChartOptions } from "@/lib/region-excel/build-region-trend-chart";
import type { RegionDashboardData, RegionDashboardQuery, RegionInsightsResponse } from "@/lib/region-excel/types";

const RegionMonthlyTrendChart = dynamic(
  () =>
    import("@/components/charts/RegionMonthlyTrendChart").then(
      (mod) => mod.RegionMonthlyTrendChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" label="차트 불러오는 중…" />,
  },
);

export function RegionDashboardContent() {
  const [filters, setFilters] = useState<RegionDashboardQuery>(
    DEFAULT_REGION_DASHBOARD_QUERY,
  );
  const [data, setData] = useState<RegionDashboardData | null>(null);
  const [insights, setInsights] = useState<RegionInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildRegionDashboardSearchParams(filters);

    setLoading(true);
    setError(null);

    fetch(`/api/region/dashboard?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "데이터를 불러오지 못했습니다.");
        }
        return response.json() as Promise<RegionDashboardData>;
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
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildRegionDashboardSearchParams(filters);

    setInsightsLoading(true);
    setInsightsError(null);
    setInsights(null);

    fetch(`/api/region/insights?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "AI 요약을 생성하지 못했습니다.");
        }
        return response.json() as Promise<RegionInsightsResponse>;
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
  }, [filters]);

  const trendOption = useMemo(
    () => (data ? buildRegionTrendChartOptions(data.trend) : null),
    [data],
  );

  const handleFiltersChange = (patch: Partial<RegionDashboardQuery>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const insightFooter = insights
    ? insights.source === "huggingface"
      ? `기준 기간: ${insights.periodLabel} · Hugging Face${insights.model ? ` (${insights.model})` : ""}`
      : `기준 기간: ${insights.periodLabel} · 규칙 기반 요약${insights.warning ? ` · ${insights.warning}` : ""}`
    : data?.periodLabel
      ? `기준 기간: ${data.periodLabel}`
      : undefined;

  return (
    <>
      <DashboardFilterBar>
        <RegionPageFilters filters={filters} onFiltersChange={handleFiltersChange} />
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

      <div className="dashboard-grid dashboard-grid--region">
        <DashboardCard
          title="시군구 관광 탄소발자국 분포 지도"
          description="지도를 클릭하여 시도·시군구를 선택할 수 있습니다."
          className="dashboard-grid__tall"
        >
          {loading && !data ? (
            <PanelSkeleton variant="map" label="지도 불러오는 중…" />
          ) : (
            <RegionCarbonMapLazy carbonByLabel={data?.mapByLabel} />
          )}
        </DashboardCard>

        <DashboardCard
          title="시군구 탄소발자국 순위 (Top 10)"
          description="선택한 기간·지표 기준 총 관광 탄소발자국"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="순위 불러오는 중…" />
          ) : (
            <PlaceholderTable
              columns={["순위", "시군구", "총 관광 탄소발자국", "전년 대비"]}
              rows={data?.ranking ?? []}
            />
          )}
        </DashboardCard>

        <DashboardCard
          title="전국 월별 관광 탄소발자국 추세"
          description="2023년 · 2024년 · 2025년 · 2026년"
        >
          {loading && !trendOption ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : trendOption ? (
            <RegionMonthlyTrendChart option={trendOption} />
          ) : null}
        </DashboardCard>

        <div className="dashboard-grid__pair-side">
          <AiInsightCard
            title="AI 한줄 요약 (Quick Summary)"
            items={insights?.items ?? []}
            loading={insightsLoading}
            loadingLabel="Hugging Face API로 관광경영 인사이트 생성 중…"
            error={insightsError}
            footer={insightFooter}
          />
        </div>
      </div>
    </>
  );
}
