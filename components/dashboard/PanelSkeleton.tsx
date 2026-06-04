type PanelSkeletonProps = {
  variant?: "map" | "chart";
  label?: string;
};

export function PanelSkeleton({
  variant = "chart",
  label = "불러오는 중…",
}: PanelSkeletonProps) {
  return (
    <div
      className={`panel-skeleton panel-skeleton--${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span className="panel-skeleton__shimmer" aria-hidden="true" />
      <span className="panel-skeleton__text">{label}</span>
    </div>
  );
}
