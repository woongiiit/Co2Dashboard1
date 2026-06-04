type AiInsightCardProps = {
  title?: string;
  items: string[];
  variant?: "default" | "traveler" | "government";
  footer?: string;
};

export function AiInsightCard({
  title = "AI 인사이트",
  items,
  variant = "default",
  footer,
}: AiInsightCardProps) {
  return (
    <aside className={`ai-insight ai-insight--${variant}`}>
      <div className="ai-insight__badge" aria-hidden="true">
        AI
      </div>
      <h3 className="ai-insight__title">{title}</h3>
      <ul className="ai-insight__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {footer ? <p className="ai-insight__footer">{footer}</p> : null}
    </aside>
  );
}
