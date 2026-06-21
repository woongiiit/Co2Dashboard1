"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildRegionMonthlyTrendOptions } from "@/lib/charts/region-detail-chart-options";
import type { RegionDetailMonthlyTrend } from "@/lib/region-excel/types";

type RegionMonthlyTrendChartProps = {
  trend: RegionDetailMonthlyTrend;
};

export function RegionMonthlyTrendChart({ trend }: RegionMonthlyTrendChartProps) {
  const option = useMemo(() => buildRegionMonthlyTrendOptions(trend), [trend]);

  return (
    <EChart
      option={option}
      height={240}
      ariaLabel="월별 관광 탄소발자국 추세 차트"
    />
  );
}
