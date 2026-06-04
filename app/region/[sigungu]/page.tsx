import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IndustryRankingTable } from "@/components/region-detail/IndustryRankingTable";
import { RegionDetailPageFilters } from "@/components/region-detail/RegionDetailPageFilters";
import { RegionDetailInsightPanel } from "@/components/region-detail/RegionDetailInsightPanel";
import { RegionDetailResourceWarmup } from "@/components/region/RegionDetailResourceWarmup";
import {
  IndustryCompositionPanelLazy,
  RegionComparisonChartLazy,
  RegionDetailMapPanelLazy,
  RegionMonthlyTrendChartLazy,
} from "@/lib/lazy-dashboard-components";
import { decodeSigunguParam } from "@/lib/region-routes";
import { MOCK_PERIOD, REGION_DETAIL_KPI } from "@/lib/mock-dashboard-data";

type RegionDetailPageProps = {
  params: Promise<{ sigungu: string }>;
};

export async function generateMetadata({
  params,
}: RegionDetailPageProps): Promise<Metadata> {
  const { sigungu } = await params;
  const label = decodeSigunguParam(sigungu);
  return {
    title: `지역 상세 분석 — ${label}`,
  };
}

export default async function RegionDetailPage({
  params,
}: RegionDetailPageProps) {
  const { sigungu } = await params;
  const selectedSigungu = decodeSigunguParam(sigungu);

  return (
    <DashboardLayout theme="eco" activeNav="region">
      <RegionDetailResourceWarmup sampleSigungu={selectedSigungu} />
      <DashboardPageHeader
        title="지역 상세 분석"
        subtitle="선택 시도·시군구의 관광 탄소발자국 진단"
        meta={`기준 기간: ${MOCK_PERIOD}`}
        icon="region"
      />

      <div className="dashboard-content">
        <p className="detail-meta">
          선택된 시군구: <strong>{selectedSigungu}</strong>
        </p>

        <DashboardFilterBar>
          <RegionDetailPageFilters selectedSigungu={selectedSigungu} />
        </DashboardFilterBar>

        <KpiCardRow items={REGION_DETAIL_KPI} uniform />

        <div className="dashboard-grid dashboard-grid--region-detail-2x3">
          <DashboardCard
            title="선택 지역 위치"
            description={selectedSigungu}
            className="dashboard-grid__cell"
          >
            <RegionDetailMapPanelLazy regionLabel={selectedSigungu} />
          </DashboardCard>

          <DashboardCard
            title="업종별 탄소발자국 구성"
            description="(tCO₂eq)"
            className="dashboard-grid__cell"
          >
            <IndustryCompositionPanelLazy />
          </DashboardCard>

          <DashboardCard
            title="비교 분석 (관광 탄소발자국)"
            description="(tCO₂eq)"
            className="dashboard-grid__cell"
          >
            <RegionComparisonChartLazy />
          </DashboardCard>

          <DashboardCard
            title="월별 관광 탄소발자국 추세"
            description={`선택 지역 · 전년(동월) · 전국 평균 · 강원도 평균`}
            className="dashboard-grid__cell"
          >
            <RegionMonthlyTrendChartLazy regionLabel={selectedSigungu} />
          </DashboardCard>

          <DashboardCard
            title="상위 업종(중분류) 순위"
            description="(tCO₂eq)"
            className="dashboard-grid__cell"
          >
            <IndustryRankingTable />
          </DashboardCard>

          <DashboardCard
            title="AI 인사이트"
            className="dashboard-grid__cell dashboard-grid__cell--insight"
          >
            <RegionDetailInsightPanel regionLabel={selectedSigungu} />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
