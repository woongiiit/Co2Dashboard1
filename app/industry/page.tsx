import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { IndustryDashboardContent } from "@/components/industry/IndustryDashboardContent";

export const metadata: Metadata = {
  title: "업종 중심 분석",
};

export default function IndustryPage() {
  return (
    <DashboardLayout theme="eco" activeNav="industry">
      <DashboardPageHeader
        title="업종 중심 분석"
        subtitle="6개 대분류·22개 중분류 업종별 관광 탄소발자국을 분석합니다."
        icon="industry"
      />

      <div className="dashboard-content">
        <IndustryDashboardContent />
      </div>
    </DashboardLayout>
  );
}
