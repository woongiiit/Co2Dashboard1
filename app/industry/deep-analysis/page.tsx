import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { IndustryDeepAnalysisContent } from "@/components/industry/IndustryDeepAnalysisContent";

export const metadata: Metadata = {
  title: "업종 심화 분석",
};

export default function IndustryDeepAnalysisPage() {
  return (
    <DashboardLayout theme="eco" activeNav="industry">
      <DashboardPageHeader
        title="업종 심화 분석"
        subtitle="연도·업종·지역 관점의 관광 탄소발자국 심층 추세·구성·지표 비교"
        meta="기준 기간: 2023.01 ~ 2026.04 · 엑셀 데이터"
        icon="industry"
      />

      <div className="dashboard-content">
        <IndustryDeepAnalysisContent />
      </div>
    </DashboardLayout>
  );
}
