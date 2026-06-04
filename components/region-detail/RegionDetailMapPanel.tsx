"use client";

import { useState } from "react";
import { RegionDetailMap } from "@/components/map/RegionDetailMap";

type RegionDetailMapPanelProps = {
  regionLabel: string;
};

export function RegionDetailMapPanel({ regionLabel }: RegionDetailMapPanelProps) {
  const [view, setView] = useState<"map" | "info">("map");

  return (
    <div className="region-detail-map">
      <div className="region-detail-map__toolbar">
        <div className="region-detail-map__tabs" role="tablist" aria-label="지도 보기 전환">
          <button
            type="button"
            role="tab"
            aria-selected={view === "map"}
            className={
              view === "map"
                ? "region-detail-map__tab region-detail-map__tab--active"
                : "region-detail-map__tab"
            }
            onClick={() => setView("map")}
          >
            지도
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "info"}
            className={
              view === "info"
                ? "region-detail-map__tab region-detail-map__tab--active"
                : "region-detail-map__tab"
            }
            onClick={() => setView("info")}
          >
            지역 정보
          </button>
        </div>
      </div>

      {view === "map" ? (
        <RegionDetailMap regionLabel={regionLabel} />
      ) : (
        <dl className="region-detail-map__info">
          <div>
            <dt>선택 시군구</dt>
            <dd>{regionLabel}</dd>
          </div>
          <div>
            <dt>기준 기간</dt>
            <dd>2023.01 ~ 2026.04</dd>
          </div>
          <div>
            <dt>총 관광 탄소발자국</dt>
            <dd>412,875 tCO₂eq</dd>
          </div>
          <div>
            <dt>전국 순위</dt>
            <dd>28위 / 250개 시군구</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
