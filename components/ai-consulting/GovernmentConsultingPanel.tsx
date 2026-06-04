import { AiConsultingCheckList } from "@/components/ai-consulting/AiConsultingCheckList";
import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { ComparisonRadarChartLazy } from "@/lib/lazy-dashboard-components";
import { GOVERNMENT_CONSULTING_POINTS } from "@/lib/ai-consulting-mock";

export function GovernmentConsultingPanel() {
  return (
    <AiConsultingSection
      number={3}
      title="지자체 관점 친환경 행정 컨설팅"
      className="ai-consult-grid__government"
    >
      <div className="ai-consult-split ai-consult-split--government">
        <AiConsultingCheckList items={GOVERNMENT_CONSULTING_POINTS} />
        <ComparisonRadarChartLazy />
      </div>
    </AiConsultingSection>
  );
}
