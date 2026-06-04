import type { ReactNode } from "react";

type AiConsultingSectionProps = {
  number: 1 | 2 | 3 | 4;
  title: string;
  showDocIcon?: boolean;
  children: ReactNode;
  className?: string;
};

export function AiConsultingSection({
  number,
  title,
  showDocIcon = false,
  children,
  className = "",
}: AiConsultingSectionProps) {
  return (
    <section
      className={`ai-consult-section ${className}`.trim()}
      aria-labelledby={`ai-consult-section-${number}`}
    >
      <header className="ai-consult-section__head">
        <span className="ai-consult-section__num" aria-hidden="true">
          {number}
        </span>
        <h2 id={`ai-consult-section-${number}`} className="ai-consult-section__title">
          {title}
        </h2>
        {showDocIcon ? (
          <span className="ai-consult-section__doc-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <rect
                x="4"
                y="3"
                width="12"
                height="14"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M7 7h6M7 10h6M7 13h4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ) : null}
      </header>
      <div className="ai-consult-section__body">{children}</div>
    </section>
  );
}
