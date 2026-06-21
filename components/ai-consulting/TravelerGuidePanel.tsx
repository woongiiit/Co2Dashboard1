import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { TravelerGuideIcon } from "@/components/ai-consulting/TravelerGuideIcon";
import type { TravelerGuideItem } from "@/lib/ai-consulting/types";

type TravelerGuidePanelProps = {
  items: TravelerGuideItem[];
  loading?: boolean;
};

export function TravelerGuidePanel({ items, loading = false }: TravelerGuidePanelProps) {
  return (
    <AiConsultingSection
      number={2}
      title="여행자 관점 탄소중립 가이드"
      className="ai-consult-grid__traveler"
    >
      {loading && items.length === 0 ? (
        <p className="ai-consult-loading" aria-live="polite">
          AI 여행자 가이드 생성 중…
        </p>
      ) : (
        <ul className="ai-consult-guide-list">
          {items.map((item) => (
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
      )}
    </AiConsultingSection>
  );
}
