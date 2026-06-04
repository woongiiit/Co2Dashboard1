import { GovernmentConsultingPanel } from "@/components/ai-consulting/GovernmentConsultingPanel";
import { OneLineRecommendationBar } from "@/components/ai-consulting/OneLineRecommendationBar";
import { PriorityActionTasksPanel } from "@/components/ai-consulting/PriorityActionTasksPanel";
import { RegionalEvaluationPanel } from "@/components/ai-consulting/RegionalEvaluationPanel";
import { TravelerGuidePanel } from "@/components/ai-consulting/TravelerGuidePanel";

export function AiConsultingContentGrid() {
  return (
    <div className="ai-consult-grid">
      <RegionalEvaluationPanel />
      <TravelerGuidePanel />
      <GovernmentConsultingPanel />
      <PriorityActionTasksPanel />
      <OneLineRecommendationBar />
    </div>
  );
}
