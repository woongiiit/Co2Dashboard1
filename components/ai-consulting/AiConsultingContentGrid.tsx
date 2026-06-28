import { GovernmentConsultingPanel } from "@/components/ai-consulting/GovernmentConsultingPanel";
import { OneLineRecommendationBar } from "@/components/ai-consulting/OneLineRecommendationBar";
import { PriorityActionTasksPanel } from "@/components/ai-consulting/PriorityActionTasksPanel";
import { RegionalEvaluationPanel } from "@/components/ai-consulting/RegionalEvaluationPanel";
import { TravelerGuidePanel } from "@/components/ai-consulting/TravelerGuidePanel";
import type {
  AiConsultingRadarData,
  PriorityActionTask,
  SectorEmissionItem,
  TravelerGuideItem,
} from "@/lib/ai-consulting/types";

type AiConsultingContentGridProps = {
  regionalEvaluation: string[];
  travelerGuide: TravelerGuideItem[];
  governmentConsulting: string[];
  priorityTasks: PriorityActionTask[];
  oneLineRecommendation: string;
  sectorEmission: SectorEmissionItem[];
  radar: AiConsultingRadarData;
  insightsLoading: boolean;
};

export function AiConsultingContentGrid({
  regionalEvaluation,
  travelerGuide,
  governmentConsulting,
  priorityTasks,
  oneLineRecommendation,
  sectorEmission,
  radar,
  insightsLoading,
}: AiConsultingContentGridProps) {
  return (
    <div className="ai-consult-grid">
      <RegionalEvaluationPanel
        points={regionalEvaluation}
        sectorEmission={sectorEmission}
        loading={insightsLoading}
      />
      <TravelerGuidePanel items={travelerGuide} loading={insightsLoading} />
      <GovernmentConsultingPanel
        points={governmentConsulting}
        radar={radar}
        loading={insightsLoading}
      />
      <PriorityActionTasksPanel tasks={priorityTasks} loading={insightsLoading} />
      <OneLineRecommendationBar
        text={oneLineRecommendation}
        loading={insightsLoading}
      />
    </div>
  );
}
