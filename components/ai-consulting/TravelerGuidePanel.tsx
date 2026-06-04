import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { TravelerGuideIcon } from "@/components/ai-consulting/TravelerGuideIcon";
import { TRAVELER_GUIDE_ITEMS } from "@/lib/ai-consulting-mock";

export function TravelerGuidePanel() {
  return (
    <AiConsultingSection
      number={2}
      title="여행자 관점 탄소중립 가이드"
      className="ai-consult-grid__traveler"
    >
      <ul className="ai-consult-guide-list">
        {TRAVELER_GUIDE_ITEMS.map((item) => (
          <li key={item.id} className="ai-consult-guide-list__item">
            <span className="ai-consult-guide-list__icon" aria-hidden="true">
              <TravelerGuideIcon id={item.id} />
            </span>
            <div className="ai-consult-guide-list__text">
              <p className="ai-consult-guide-list__title">{item.title}</p>
              <p className="ai-consult-guide-list__desc">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </AiConsultingSection>
  );
}
