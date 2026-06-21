"use client";

import { useEffect, useState } from "react";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { DeepAnalysisPageFilters } from "@/components/industry/deep-analysis/DeepAnalysisPageFilters";
import { DeepAnalysisComparisonTable } from "@/components/industry/deep-analysis/DeepAnalysisComparisonTable";
import { DeepAnalysisNoticeBox } from "@/components/industry/deep-analysis/DeepAnalysisNoticeBox";
import {
  DeepAnalysisIndustryCompositionChartLazy,
  DeepAnalysisMonthlyTrendChartLazy,
  DeepAnalysisYoyGrowthChartLazy,
} from "@/lib/lazy-dashboard-components";
import {
  buildIndustryDeepAnalysisSearchParams,
  DEFAULT_INDUSTRY_DEEP_ANALYSIS_QUERY,
} from "@/lib/industry-excel/client";
import type {
  IndustryDeepAnalysisData,
  IndustryDeepAnalysisQuery,
  IndustryDeepInsightsResponse,
} from "@/lib/industry-excel/types";

export function IndustryDeepAnalysisContent() {
  const [filters, setFilters] = useState<IndustryDeepAnalysisQuery>({
    ...DEFAULT_INDUSTRY_DEEP_ANALYSIS_QUERY,
  });
  const [resetKey, setResetKey] = useState(0);
  const [data, setData] = useState<IndustryDeepAnalysisData | null>(null);
  const [insights, setInsights] = useState<IndustryDeepInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildIndustryDeepAnalysisSearchParams(filters);

    setLoading(true);
    setError(null);

    fetch(`/api/industry/deep-analysis?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "데이터를 불러오지 못했습니다.");
        }
        return response.json() as Promise<IndustryDeepAnalysisData>;
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
    const params = buildIndustryDeepAnalysisSearchParams(filters);

    setInsightsLoading(true);
    setInsightsError(null);
    setInsights(null);

    fetch(`/api/industry/deep-analysis/insights?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "AI 요약을 생성하지 못했습니다.");
        }
        return response.json() as Promise<IndustryDeepInsightsResponse>;
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
        <DeepAnalysisPageFilters
          filters={filters}
          onFiltersChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => {
            setFilters({ ...DEFAULT_INDUSTRY_DEEP_ANALYSIS_QUERY });
            setResetKey((prev) => prev + 1);
          }}
          resetKey={resetKey}
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

      <div className="deep-analysis-dashboard">
        <DashboardCard
          title="월별 관광 탄소발자국 추세 (2023.01 ~ 2026.04)"
          className="deep-analysis-dashboard__trend dashboard-card--fill"
        >
          {loading && !data ? (
            <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
          ) : data ? (
            <DeepAnalysisMonthlyTrendChartLazy trend={data.monthlyTrend} />
          ) : null}
        </DashboardCard>

        <div className="deep-analysis-dashboard__middle">
          <DashboardCard
            title="월별 업종별 구성 비중 (6대 업종)"
            description="분기 월(1·4·7·10월) 기준 · (%)"
            className="dashboard-card--fill"
          >
            {loading && !data ? (
              <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
            ) : data ? (
              <DeepAnalysisIndustryCompositionChartLazy
                composition={data.composition}
              />
            ) : null}
          </DashboardCard>

          <DashboardCard
            title="전년 동월 대비 증감률 추이 (%)"
            description="2024 · 2025 · 2026년"
            className="dashboard-card--fill"
          >
            {loading && !data ? (
              <PanelSkeleton variant="chart" label="차트 불러오는 중…" />
            ) : data ? (
              <DeepAnalysisYoyGrowthChartLazy yoyGrowth={data.yoyGrowth} />
            ) : null}
          </DashboardCard>
        </div>

        <div className="deep-analysis-dashboard__bottom">
          <DashboardCard
            title="연도별 주요 지표 비교"
            className="deep-analysis-dashboard__table dashboard-card--fill"
          >
            {loading && !data ? (
              <PanelSkeleton variant="chart" label="표 불러오는 중…" />
            ) : (
              <DeepAnalysisComparisonTable rows={data?.comparisonRows ?? []} />
            )}
          </DashboardCard>

          <div className="deep-analysis-dashboard__bottom-side">
            <AiInsightCard
              title="AI 한줄 요약 (Quick Summary)"
              items={insights?.items ?? []}
              loading={insightsLoading}
              loadingLabel="Hugging Face API로 심화 분석 요약 생성 중…"
              error={insightsError}
              footer={insightFooter}
            />
            <DeepAnalysisNoticeBox items={data?.noticeItems ?? []} />
          </div>
        </div>
      </div>
    </>
  );
}
