"use client";

type ChartModeToggleProps = {
  mode: "absolute" | "percent";
  onChange: (mode: "absolute" | "percent") => void;
};

export function ChartModeToggle({ mode, onChange }: ChartModeToggleProps) {
  return (
    <div className="chart-mode-toggle" role="group" aria-label="차트 표시 방식">
      <button
        type="button"
        className={
          mode === "absolute"
            ? "chart-mode-toggle__btn chart-mode-toggle__btn--active"
            : "chart-mode-toggle__btn"
        }
        onClick={() => onChange("absolute")}
      >
        절대량
      </button>
      <button
        type="button"
        className={
          mode === "percent"
            ? "chart-mode-toggle__btn chart-mode-toggle__btn--active"
            : "chart-mode-toggle__btn"
        }
        onClick={() => onChange("percent")}
      >
        비중 (%)
      </button>
    </div>
  );
}
