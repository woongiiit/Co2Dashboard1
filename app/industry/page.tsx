import type { Metadata } from "next";
import { NavigatingLink } from "@/components/common/NavigatingLink";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { IndustryPageFilters } from "@/components/industry/IndustryPageFilters";
import { IndustryMidRankingPanel } from "@/components/industry/IndustryMidRankingPanel";
import {
  IndustryMonthlyTrendChartLazy,
  MajorIndustryComparisonChartLazy,
  MajorIndustryShareChartLazy,
} from "@/lib/lazy-dashboard-components";
import { INDUSTRY_KPI, MOCK_PERIOD } from "@/lib/mock-dashboard-data";

export const metadata: Metadata = {
  title: "업종 중심 분석",
};

export default function IndustryPage() {
  return (
    <DashboardLayout theme="eco" activeNav="industry">
      <DashboardPageHeader
        title="업종 중심 분석"
        subtitle="6개 대분류·22개 중분류 업종별 관광 탄소발자국을 분석합니다."
        meta={`기준 기간: ${MOCK_PERIOD}`}
        icon="industry"
      />

      <div className="dashboard-content">
        <DashboardFilterBar
          actions={
            <NavigatingLink
              className="btn btn--primary"
              href="/industry/deep-analysis"
            >
              심화분석
            </NavigatingLink>
          }
        >
          <IndustryPageFilters />
        </DashboardFilterBar>

        <KpiCardRow items={INDUSTRY_KPI} uniform />

        <div className="industry-dashboard">
          <DashboardCard
            title="대분류 업종별 탄소발자국 비교"
            description="(tCO₂eq)"
            className="industry-dashboard__compare dashboard-card--fill"
          >
            <MajorIndustryComparisonChartLazy />
          </DashboardCard>

          <div className="industry-dashboard__right">
            <DashboardCard
              title="중분류 업종별 탄소발자국 순위"
              description="선택 기간 합계 기준 · (tCO₂eq)"
              className="industry-dashboard__ranking dashboard-card--fill"
            >
              <IndustryMidRankingPanel />
            </DashboardCard>

            <div className="industry-dashboard__ai">
              <AiInsightCard
                title="AI 인사이트 (Quick Summary)"
                items={[
                  "운송업(31.8%)이 전체 탄소발자국의 3분의 1 이상을 차지합니다.",
                  "항공운송이 단일 업종 중 가장 높은 배출(20.8%)을 기록하고 있습니다.",
                  "숙박업·식음료업 합산 비중 28.4%로 필수 업종 관리가 중요합니다.",
                  "여가서비스업(22.7%)은 관광유원시설·골프장 중심으로 높은 배출을 보입니다.",
                  "의료웰니스업(5.7%)은 비중은 낮으나 지속 모니터링이 필요합니다.",
                ]}
                footer="※ 2026년은 4월까지 데이터이며 동일기간 비교가 필요합니다."
              />
            </div>
          </div>

          <DashboardCard
            title="선택 업종 월별 탄소발자국 추이"
            description="2023년 · 2024년 · 2025년 · 2026년"
            className="industry-dashboard__trend dashboard-card--fill"
          >
            <IndustryMonthlyTrendChartLazy />
          </DashboardCard>

          <DashboardCard
            title="대분류 업종별 비중"
            description="전체 기간 · (tCO₂eq 비중)"
            className="industry-dashboard__share dashboard-card--fill"
          >
            <MajorIndustryShareChartLazy />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
