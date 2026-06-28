import type { Metadata } from "next";
import { Suspense } from "react";
import { AiConsultingContent } from "@/components/ai-consulting/AiConsultingContent";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";

export const metadata: Metadata = {
  title: "AI 컨설팅",
};

export default function AiConsultingPage() {
  return (
    <DashboardLayout theme="eco" activeNav="ai-consulting">
      <DashboardPageHeader
        title="AI 컨설팅"
        subtitle="선택 지역의 관광 탄소발자국 결과 해석 및 맞춤 제언"
        icon="ai-consulting"
      />

      <div className="dashboard-content">
        <Suspense fallback={<PanelSkeleton variant="chart" label="불러오는 중…" />}>
          <AiConsultingContent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
