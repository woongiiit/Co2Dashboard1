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
  /** 같은 페이지에 범례가 여러 개일 때 id 충돌 방지 */
  idPrefix?: string;
  /** overlay: 지도 위 오버레이, standalone: 지도 바깥 */
  variant?: "overlay" | "standalone";
};

export function CarbonMapLegend({
  stops = [...CARBON_LEGEND_STOPS],
  idPrefix = "carbon-map-legend",
  variant = "overlay",
}: CarbonMapLegendProps) {
  const [expanded, setExpanded] = useState(true);
  const titleId = `${idPrefix}-title`;
  const bodyId = `${idPrefix}-body`;
  const variantClass =
    variant === "standalone" ? " carbon-map-legend--standalone" : "";

  return (
    <div
      className={
        expanded
          ? `carbon-map-legend${variantClass}`
          : `carbon-map-legend carbon-map-legend--collapsed${variantClass}`
      }
    >
      <div className="carbon-map-legend__header">
        <p className="carbon-map-legend__title" id={titleId}>
          총 관광 탄소발자국 (tCO₂eq)
        </p>
        <button
          type="button"
          className="carbon-map-legend__toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "접기" : "범례"}
        </button>
      </div>
      {expanded ? (
        <ul
          id={bodyId}
          className="carbon-map-legend__list"
          aria-labelledby={titleId}
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
