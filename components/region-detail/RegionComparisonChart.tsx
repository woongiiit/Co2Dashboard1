"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildRegionComparisonOptions } from "@/lib/charts/region-detail-chart-options";

export function RegionComparisonChart() {
  const option = useMemo(() => buildRegionComparisonOptions(), []);

  return (
    <EChart
      option={option}
      height={220}
      ariaLabel="관광 탄소발자국 비교 분석 차트"
    />
  );
}
