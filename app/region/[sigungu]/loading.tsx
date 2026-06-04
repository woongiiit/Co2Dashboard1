import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardRouteLoading } from "@/components/dashboard/DashboardRouteLoading";

export default function RegionDetailLoading() {
  return (
    <DashboardLayout theme="eco" activeNav="region">
      <DashboardRouteLoading title="지역 상세 분석" />
    </DashboardLayout>
  );
}
