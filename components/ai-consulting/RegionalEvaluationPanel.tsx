import { AiConsultingCheckList } from "@/components/ai-consulting/AiConsultingCheckList";
import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { SectorEmissionBarChartLazy } from "@/lib/lazy-dashboard-components";
import { REGIONAL_EVALUATION_POINTS } from "@/lib/ai-consulting-mock";

export function RegionalEvaluationPanel() {
  return (
    <AiConsultingSection
      number={1}
      title="지역 종합 평가"
      showDocIcon
      className="ai-consult-grid__eval"
    >
      <div className="ai-consult-split ai-consult-split--eval">
        <AiConsultingCheckList items={REGIONAL_EVALUATION_POINTS} />
        <SectorEmissionBarChartLazy />
      </div>
    </AiConsultingSection>
  );
}
