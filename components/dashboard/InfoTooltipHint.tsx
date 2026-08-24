"use client";

type InfoTooltipHintProps = {
  label: string;
  lines: readonly string[];
  title?: string;
  /** 트리거에 표시할 짧은 라벨 (예: 유사지역) */
  triggerLabel?: string;
  /** right: 트리거 오른쪽, left: 트리거 왼쪽(우측 정렬 UI용) */
  placement?: "left" | "right";
};

function InfoIcon() {
  return (
    <svg
      className="info-tooltip-hint__icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 9v5M10 6.5v.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InfoTooltipHint({
  label,
  lines,
  title,
  triggerLabel,
  placement = "right",
}: InfoTooltipHintProps) {
  if (lines.length === 0) return null;

  const placementClass =
    placement === "left"
      ? " info-tooltip-hint--placement-left"
      : " info-tooltip-hint--placement-right";
  const triggerClass = triggerLabel
    ? "info-tooltip-hint__trigger info-tooltip-hint__trigger--labeled"
    : "info-tooltip-hint__trigger";

  return (
    <span className={`info-tooltip-hint${placementClass}`.trim()}>
      <button type="button" className={triggerClass} aria-label={label}>
        {triggerLabel ? (
          <span className="info-tooltip-hint__trigger-label">{triggerLabel}</span>
        ) : null}
        <InfoIcon />
      </button>
      <span className="info-tooltip-hint__tooltip" role="tooltip">
        {title ? (
          <p className="info-tooltip-hint__tooltip-title">{title}</p>
        ) : null}
        <ul className="info-tooltip-hint__list">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </span>
    </span>
  );
}
