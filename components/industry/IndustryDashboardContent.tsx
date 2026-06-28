"use client";

import { useEffect, useMemo, useState } from "react";
import { NavigatingLink } from "@/components/common/NavigatingLink";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { IndustryPageFilters } from "@/components/industry/IndustryPageFilters";
import { IndustryMidRankingPanel } from "@/components/industry/IndustryMidRankingPanel";
import {
  IndustryMonthlyTrendChartLazy,
  MajorIndustryComparisonChartLazy,
  MidIndustryComparisonChartLazy,
} from "@/lib/lazy-dashboard-components";
import {
  buildIndustryDashboardSearchParams,
  buildIndustryDeepAnalysisHref,
  DEFAULT_INDUSTRY_DASHBOARD_QUERY,
} from "@/lib/industry-excel/client";
import type {
  IndustryDashboardData,
  IndustryDashboardQuery,
  IndustryInsightsResponse,
} from "@/lib/industry-excel/types";

export function IndustryDashboardContent() {
  const [filters, setFilters] = useState<IndustryDashboardQuery>(
    DEFAULT_INDUSTRY_DASHBOARD_QUERY,
  );
  const [data, setData] = useState<IndustryDashboardData | null>(null);
  const [insights, setInsights] = useState<IndustryInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildIndustryDashboardSearchParams(filters);

    setLoading(true);
    setError(null);

    fetch(`/api/industry/dashboard?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "데이터를 불러오지 못했습니다.");
        }
        return response.json() as Promise<IndustryDashboardData>;
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
    const params = buildIndustryDashboardSearchParams(filters);

    setInsightsLoading(true);
    setInsightsError(null);
    setInsights(null);

    fetch(`/api/industry/insights?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "AI 요약을 생성하지 못했습니다.");
        }
        return response.json() as Promise<IndustryInsightsResponse>;
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

  const deepAnalysisHref = useMemo(
    () => buildIndustryDeepAnalysisHref(filters),
    [filters],
  );

  return (
    <>
      <DashboardFilterBar
        actions={
          <NavigatingLink
            className="btn btn--primary"
            href={deepAnalysisHref}
          >
            심화분석
          </NavigatingLink>
        }
      >
        <IndustryPageFilters
          filters={filters}
          onFiltersChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
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

      <div className="industry-dashboard">
        <DashboardCard
          title="대분류 업종별 탄소발자국 비교"
          className="industry-dashboard__compare dashboard-card--fill"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : (
            <MajorIndustryComparisonChartLazy items={data?.majorIndustries ?? []} />
          )}
        </DashboardCard>

        <div className="industry-dashboard__right">
          <DashboardCard
            title="중분류 업종별 탄소발자국 순위"
            className="industry-dashboard__ranking dashboard-card--fill"
          >
            {loading && !data ? (
              <PanelSkeleton variant="chart" label="순위 불러오는 중…" />
            ) : (
              <IndustryMidRankingPanel rows={data?.midRanking ?? []} />
            )}
          </DashboardCard>

          <div className="industry-dashboard__ai">
            <AiInsightCard
              title="AI 인사이트 (Quick Summary)"
              items={insights?.items ?? []}
              loading={insightsLoading}
              loadingLabel="Hugging Face API로 업종 인사이트 생성 중…"
              error={insightsError}
            />
          </div>
        </div>

        <DashboardCard
          title="선택 업종 월별 탄소발자국 추이"
          className="industry-dashboard__trend dashboard-card--fill"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : data ? (
            <IndustryMonthlyTrendChartLazy
              trend={data.monthlyTrend}
              highlight={data.monthlyHighlight}
            />
          ) : null}
        </DashboardCard>

        <DashboardCard
          title="중분류 업종별 탄소발자국 비교"
          className="industry-dashboard__share dashboard-card--fill"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : (
            <MidIndustryComparisonChartLazy items={data?.midIndustries ?? []} />
          )}
        </DashboardCard>
      </div>
    </>
  );
}
