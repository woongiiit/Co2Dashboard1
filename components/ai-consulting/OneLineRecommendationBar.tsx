type OneLineRecommendationBarProps = {
  text: string;
  loading?: boolean;
};

export function OneLineRecommendationBar({
  text,
  loading = false,
}: OneLineRecommendationBarProps) {
  return (
    <div className="ai-consult-oneline" role="note">
      <span className="ai-consult-oneline__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path
            d="M12 3a7 7 0 0 0-4 12.7V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.3A7 7 0 0 0 12 3Z"
            fill="#DBEAFE"
            stroke="#2563EB"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M10 21h4" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <p className="ai-consult-oneline__text">
          <strong className="ai-consult-oneline__label">한 줄 제언</strong>
          {loading && !text ? "AI 한 줄 제언 생성 중…" : text}
        </p>
      </div>
    </div>
  );
}
