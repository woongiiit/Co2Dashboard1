import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardRouteLoading } from "@/components/dashboard/DashboardRouteLoading";

export default function RegionLoading() {
  return (
    <DashboardLayout theme="eco" activeNav="region">
      <DashboardRouteLoading title="지역 중심 분석" />
    </DashboardLayout>
  );
}
