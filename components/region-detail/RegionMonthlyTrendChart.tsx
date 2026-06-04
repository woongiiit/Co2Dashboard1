"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildRegionMonthlyTrendOptions } from "@/lib/charts/region-detail-chart-options";

type RegionMonthlyTrendChartProps = {
  regionLabel: string;
};

export function RegionMonthlyTrendChart({ regionLabel }: RegionMonthlyTrendChartProps) {
  const option = useMemo(
    () => buildRegionMonthlyTrendOptions(regionLabel),
    [regionLabel],
  );

  return (
    <EChart
      option={option}
      height={240}
      ariaLabel="월별 관광 탄소발자국 추세 차트"
    />
  );
}
