import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  NationalMonthlyCarbonTrendChartLazy,
  RegionCarbonMapLazy,
} from "@/lib/lazy-dashboard-components";
import { PlaceholderTable } from "@/components/dashboard/PlaceholderTable";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { RegionDetailResourceWarmup } from "@/components/region/RegionDetailResourceWarmup";
import { RegionPageFilters } from "@/components/region/RegionPageFilters";
import {
  MOCK_PERIOD,
  REGION_KPI,
  REGION_RANKING_ROWS,
} from "@/lib/mock-dashboard-data";

export const metadata: Metadata = {
  title: "지역 중심 분석",
};

export default function RegionPage() {
  return (
    <DashboardLayout theme="eco" activeNav="region">
      <RegionDetailResourceWarmup />
      <DashboardPageHeader
        title="지역 중심 분석"
        subtitle="전국·시도·시군구 단위 관광 탄소발자국 현황을 조회합니다."
        meta={`기준 기간: ${MOCK_PERIOD}`}
        icon="region"
      />

      <div className="dashboard-content">
        <DashboardFilterBar>
          <RegionPageFilters />
        </DashboardFilterBar>

        <KpiCardRow items={REGION_KPI} uniform />

        <div className="dashboard-grid dashboard-grid--region">
          <DashboardCard
            title="시군구 관광 탄소발자국 분포 지도"
            description="지도를 클릭하여 시도·시군구를 선택할 수 있습니다."
            className="dashboard-grid__tall"
          >
            <RegionCarbonMapLazy />
          </DashboardCard>

          <DashboardCard
            title="시군구 탄소발자국 순위 (Top 10)"
            description="선택한 기간·지표 기준 총 관광 탄소발자국"
          >
            <PlaceholderTable
              columns={["순위", "시군구", "총 관광 탄소발자국", "전년 대비"]}
              rows={REGION_RANKING_ROWS}
            />
          </DashboardCard>

          <DashboardCard
            title="전국 월별 관광 탄소발자국 추세"
            description="2023년 · 2024년 · 2025년 · 2026년"
          >
            <NationalMonthlyCarbonTrendChartLazy variant="eco" />
          </DashboardCard>

          <div className="dashboard-grid__pair-side">
            <AiInsightCard
              title="AI 한줄 요약 (Quick Summary)"
              items={[
                "전국 총 관광 탄소발자국은 전년 동기간 대비 8.7% 증가했습니다.",
                "관광객 1인당 탄소발자국은 0.621 kgCO₂eq로 전년 대비 2.6% 감소했습니다.",
                "상위 20% 시군구가 전체의 28.6%를 차지하여 편중도가 높습니다.",
              ]}
              footer="기준일: 2026.04.30 · 실제 AI 연동 예정"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
