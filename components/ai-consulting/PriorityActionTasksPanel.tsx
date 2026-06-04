import { AiConsultingSection } from "@/components/ai-consulting/AiConsultingSection";
import { PRIORITY_ACTION_TASKS } from "@/lib/ai-consulting-mock";

function ActionTaskIcon({ id }: { id: "short" | "mid" | "long" }) {
  if (id === "short") {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="20" height="18" rx="2" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.2" />
        <path d="M4 11h20M9 4v4M19 4v4" stroke="#16A34A" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "mid") {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="16" width="4" height="8" rx="1" fill="#60A5FA" />
        <rect x="11" y="12" width="4" height="12" rx="1" fill="#3B82F6" />
        <rect x="18" y="8" width="4" height="16" rx="1" fill="#2563EB" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="10" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.2" />
      <circle cx="14" cy="14" r="5" fill="#A78BFA" />
      <circle cx="14" cy="14" r="1.5" fill="#fff" />
    </svg>
  );
}

export function PriorityActionTasksPanel() {
  return (
    <AiConsultingSection
      number={4}
      title="우선 실행 과제"
      className="ai-consult-grid__actions"
    >
      <div className="ai-consult-action-grid">
        {PRIORITY_ACTION_TASKS.map((task) => (
          <article
            key={task.id}
            className={`ai-consult-action-card ai-consult-action-card--${task.id}`}
          >
            <span className="ai-consult-action-card__icon" aria-hidden="true">
              <ActionTaskIcon id={task.id} />
            </span>
            <h3 className="ai-consult-action-card__label">{task.label}</h3>
            <ul className="ai-consult-action-card__list">
              {task.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </AiConsultingSection>
  );
}
