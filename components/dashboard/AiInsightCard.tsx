type AiInsightCardProps = {
  title?: string;
  items: string[];
  variant?: "default" | "traveler" | "government";
  footer?: string;
  loading?: boolean;
  loadingLabel?: string;
  error?: string | null;
};

export function AiInsightCard({
  title = "AI 인사이트",
  items,
  variant = "default",
  footer,
  loading = false,
  loadingLabel = "AI 요약 생성 중…",
  error = null,
}: AiInsightCardProps) {
  return (
    <aside className={`ai-insight ai-insight--${variant}`}>
      <div className="ai-insight__badge" aria-hidden="true">
        AI
      </div>
      <h3 className="ai-insight__title">{title}</h3>

      {loading ? (
        <p className="ai-insight__status" role="status">
          {loadingLabel}
        </p>
      ) : error ? (
        <p className="ai-insight__status ai-insight__status--error" role="alert">
          {error}
        </p>
      ) : (
        <ul className="ai-insight__list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {footer && !loading ? <p className="ai-insight__footer">{footer}</p> : null}
    </aside>
  );
}
