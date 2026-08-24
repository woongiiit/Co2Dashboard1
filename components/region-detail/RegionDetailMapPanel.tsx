"use client";

import { CarbonMapLegend } from "@/components/map/CarbonMapLegend";
import { RegionDetailMap } from "@/components/map/RegionDetailMap";

type RegionDetailMapPanelProps = {
  regionLabel: string;
  carbonByLabel?: Record<string, number>;
};

export function RegionDetailMapPanel({
  regionLabel,
  carbonByLabel,
}: RegionDetailMapPanelProps) {
  return (
    <div className="region-detail-map">
      <RegionDetailMap regionLabel={regionLabel} carbonByLabel={carbonByLabel} />
      <CarbonMapLegend
        idPrefix="region-detail-map-legend"
        variant="standalone"
      />
    </div>
  );
}
