import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { RegionDetailContent } from "@/components/region/RegionDetailContent";
import { RegionDetailResourceWarmup } from "@/components/region/RegionDetailResourceWarmup";
import { decodeSigunguParam } from "@/lib/region-routes";

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
        meta="기준 기간: 2023.01 ~ 2026.04 · 엑셀 데이터"
        icon="region"
      />

      <div className="dashboard-content">
        <p className="detail-meta">
          선택된 시군구: <strong>{selectedSigungu}</strong>
        </p>

        <RegionDetailContent regionLabel={selectedSigungu} />
      </div>
    </DashboardLayout>
  );
}
