type PlaceholderChartProps = {
  variant?: "bar" | "line" | "stacked" | "donut";
  height?: "sm" | "md" | "lg";
};

export function PlaceholderChart({
  variant = "line",
  height = "md",
}: PlaceholderChartProps) {
  return (
    <div
      className={`placeholder-chart placeholder-chart--${variant} placeholder-chart--${height}`}
      role="img"
      aria-label="차트 영역 (구현 예정)"
    >
      <div className="placeholder-chart__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="placeholder-chart__bars" aria-hidden="true">
        <span style={{ height: "45%" }} />
        <span style={{ height: "72%" }} />
        <span style={{ height: "58%" }} />
        <span style={{ height: "88%" }} />
        <span style={{ height: "64%" }} />
        <span style={{ height: "76%" }} />
        <span style={{ height: "52%" }} />
        <span style={{ height: "68%" }} />
      </div>
      <p className="placeholder-chart__caption">
        ECharts 차트가 이 영역에 연결됩니다.
      </p>
    </div>
  );
}
