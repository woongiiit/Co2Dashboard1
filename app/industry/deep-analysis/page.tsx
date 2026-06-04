import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { IndustryClassificationFilters } from "@/components/industry/IndustryClassificationFilters";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { IndustryMidRankingPanel } from "@/components/industry/IndustryMidRankingPanel";
import {
  COMPARE_OPTIONS,
  PERIOD_OPTIONS,
  REGION_FILTER_OPTIONS,
} from "@/components/dashboard/filter-options";
import {
  IndustryMonthlyTrendChartLazy,
  MajorIndustryComparisonChartLazy,
  MajorIndustryStackedChartLazy,
} from "@/lib/lazy-dashboard-components";
import { INDUSTRY_KPI, MOCK_PERIOD } from "@/lib/mock-dashboard-data";

export const metadata: Metadata = {
  title: "업종 심화 분석",
};

export default function IndustryDeepAnalysisPage() {
  return (
    <DashboardLayout theme="eco" activeNav="industry">
      <DashboardPageHeader
        title="업종 심화 분석"
        subtitle="대분류·중분류 업종별 심층 비교 및 추세·구성 분석"
        meta={`기준 기간: ${MOCK_PERIOD}`}
        icon="industry"
      />

      <div className="dashboard-content">
        <DashboardFilterBar>
          <FilterSelect
            id="deep-region"
            label="지역"
            options={REGION_FILTER_OPTIONS}
          />
          <FilterSelect id="deep-period" label="기간" options={PERIOD_OPTIONS} />
          <IndustryClassificationFilters
            majorId="deep-major"
            midId="deep-mid"
          />
          <FilterSelect
            id="deep-compare"
            label="비교 기준"
            options={COMPARE_OPTIONS}
          />
        </DashboardFilterBar>

        <KpiCardRow items={INDUSTRY_KPI} uniform />

        <div className="industry-dashboard industry-dashboard--deep">
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
            title="6대 업종 월별 구성"
            description="2025년 기준 · (tCO₂eq)"
            className="industry-dashboard__stack dashboard-card--fill"
          >
            <MajorIndustryStackedChartLazy />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
