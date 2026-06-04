import type { Metadata } from "next";
import { AiConsultingContentGrid } from "@/components/ai-consulting/AiConsultingContentGrid";
import { AiConsultingFilterApplyButton } from "@/components/ai-consulting/AiConsultingFilterApplyButton";
import { AiConsultingPageFilters } from "@/components/ai-consulting/AiConsultingPageFilters";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { KpiCardRow } from "@/components/dashboard/KpiCardRow";
import { AI_CONSULTING_KPI, MOCK_PERIOD } from "@/lib/mock-dashboard-data";

export const metadata: Metadata = {
  title: "AI 컨설팅",
};

export default function AiConsultingPage() {
  return (
    <DashboardLayout theme="eco" activeNav="ai-consulting">
      <DashboardPageHeader
        title="AI 컨설팅"
        subtitle="선택 지역의 관광 탄소발자국 결과 해석 및 맞춤 제언"
        meta={`기준 기간: ${MOCK_PERIOD}`}
        icon="ai-consulting"
      />

      <div className="dashboard-content">
        <DashboardFilterBar>
          <AiConsultingPageFilters />
          <div className="dashboard-filter__apply">
            <AiConsultingFilterApplyButton />
          </div>
        </DashboardFilterBar>

        <KpiCardRow items={AI_CONSULTING_KPI} uniform />

        <AiConsultingContentGrid />
      </div>
    </DashboardLayout>
  );
}
