import { AiConsultingCheckList } from "@/components/ai-consulting/AiConsultingCheckList";
import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { ComparisonRadarChartLazy } from "@/lib/lazy-dashboard-components";
import type { AiConsultingRadarData } from "@/lib/ai-consulting/types";

type GovernmentConsultingPanelProps = {
  points: string[];
  radar: AiConsultingRadarData;
  loading?: boolean;
};

export function GovernmentConsultingPanel({
  points,
  radar,
  loading = false,
}: GovernmentConsultingPanelProps) {
  return (
    <AiConsultingSection
      number={3}
      title="지자체 관점 친환경 행정 컨설팅"
      className="ai-consult-grid__government"
    >
      <div className="ai-consult-split ai-consult-split--government">
        {loading && points.length === 0 ? (
          <p className="ai-consult-loading" aria-live="polite">
            AI 지자체 컨설팅 생성 중…
          </p>
        ) : (
          <AiConsultingCheckList items={points} />
        )}
        <ComparisonRadarChartLazy radar={radar} />
      </div>
    </AiConsultingSection>
  );
}
