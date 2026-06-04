import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardRouteLoading } from "@/components/dashboard/DashboardRouteLoading";

export default function AiConsultingLoading() {
  return (
    <DashboardLayout theme="eco" activeNav="ai-consulting">
      <DashboardRouteLoading title="AI 컨설팅" />
    </DashboardLayout>
  );
}
