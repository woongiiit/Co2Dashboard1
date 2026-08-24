"use client";

import { useState } from "react";
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
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={
        expanded
          ? "carbon-map-legend"
          : "carbon-map-legend carbon-map-legend--collapsed"
      }
    >
      <div className="carbon-map-legend__header">
        <p className="carbon-map-legend__title" id="carbon-map-legend-title">
          총 관광 탄소발자국 (tCO₂eq)
        </p>
        <button
          type="button"
          className="carbon-map-legend__toggle"
          aria-expanded={expanded}
          aria-controls="carbon-map-legend-body"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "접기" : "범례"}
        </button>
      </div>
      {expanded ? (
        <ul
          id="carbon-map-legend-body"
          className="carbon-map-legend__list"
          aria-labelledby="carbon-map-legend-title"
        >
          {stops.map((stop) => (
            <li key={stop.label}>
              <span
                className="carbon-map-legend__swatch"
                style={{ backgroundColor: stop.color }}
                aria-hidden="true"
              />
              <span className="carbon-map-legend__label">{stop.label}</span>
            </li>
          ))}
          <li>
            <span
              className="carbon-map-legend__swatch"
              style={{ backgroundColor: MAP_NO_DATA_COLOR }}
              aria-hidden="true"
            />
            <span className="carbon-map-legend__label">데이터 없음</span>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
