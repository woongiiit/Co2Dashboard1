import { AiConsultingCheckList } from "@/components/ai-consulting/AiConsultingCheckList";
import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { SectorEmissionBarChartLazy } from "@/lib/lazy-dashboard-components";
import type { SectorEmissionItem } from "@/lib/ai-consulting/types";

type RegionalEvaluationPanelProps = {
  points: string[];
  sectorEmission: SectorEmissionItem[];
  loading?: boolean;
};

export function RegionalEvaluationPanel({
  points,
  sectorEmission,
  loading = false,
}: RegionalEvaluationPanelProps) {
  return (
    <AiConsultingSection
      number={1}
      title="지역 종합 평가"
      showDocIcon
      className="ai-consult-grid__eval"
    >
      <div className="ai-consult-split ai-consult-split--eval">
        {loading && points.length === 0 ? (
          <p className="ai-consult-loading" aria-live="polite">
            AI 지역 평가 생성 중…
          </p>
        ) : (
          <AiConsultingCheckList items={points} />
        )}
        <SectorEmissionBarChartLazy items={sectorEmission} />
      </div>
    </AiConsultingSection>
  );
}
