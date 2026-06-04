type AiConsultingCheckListProps = {
  items: readonly string[];
};

export function AiConsultingCheckList({ items }: AiConsultingCheckListProps) {
  return (
    <ul className="ai-consult-checklist">
      {items.map((item) => (
        <li key={item} className="ai-consult-checklist__item">
          <span className="ai-consult-checklist__mark" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
