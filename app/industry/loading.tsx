import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardRouteLoading } from "@/components/dashboard/DashboardRouteLoading";

export default function IndustryLoading() {
  return (
    <DashboardLayout theme="eco" activeNav="industry">
      <DashboardRouteLoading title="업종 중심 분석" />
    </DashboardLayout>
  );
}
