import { CARBON_LEGEND_STOPS, MAP_NO_DATA_COLOR } from "@/lib/sigungu-map";

type LegendStop = {
  min: number;
  label: string;
  color: string;
};

type CarbonMapLegendProps = {
  stops?: LegendStop[];
};

export function CarbonMapLegend({ stops = [...CARBON_LEGEND_STOPS] }: CarbonMapLegendProps) {
  return (
    <div className="carbon-map-legend" aria-label="총 관광 탄소발자국 범례">
      <p className="carbon-map-legend__title">총 관광 탄소발자국 (tCO₂eq)</p>
      <ul className="carbon-map-legend__list">
        {stops.map((stop) => (
          <li key={stop.label}>
            <span
              className="carbon-map-legend__swatch"
              style={{ backgroundColor: stop.color }}
              aria-hidden="true"
            />
            {stop.label}
          </li>
        ))}
        <li>
          <span
            className="carbon-map-legend__swatch"
            style={{ backgroundColor: MAP_NO_DATA_COLOR }}
            aria-hidden="true"
          />
          데이터 없음
        </li>
      </ul>
    </div>
  );
}
