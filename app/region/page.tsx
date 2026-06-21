import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { RegionDetailResourceWarmup } from "@/components/region/RegionDetailResourceWarmup";
import { RegionDashboardContent } from "@/components/region/RegionDashboardContent";

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
        meta="기준 기간: 2023.01 ~ 2026.04 · 엑셀 데이터"
        icon="region"
      />

      <div className="dashboard-content">
        <RegionDashboardContent />
      </div>
    </DashboardLayout>
  );
}
