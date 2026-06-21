"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildDeepAnalysisMonthlyTrendOptions } from "@/lib/charts/deep-analysis-chart-options";
import type { RegionTrendSeries } from "@/lib/region-excel/types";

type DeepAnalysisMonthlyTrendChartProps = {
  trend: RegionTrendSeries;
};

export function DeepAnalysisMonthlyTrendChart({
  trend,
}: DeepAnalysisMonthlyTrendChartProps) {
  const option = useMemo(
    () => buildDeepAnalysisMonthlyTrendOptions(trend),
    [trend],
  );

  return (
    <EChart
      option={option}
      height={320}
      ariaLabel="월별 관광 탄소발자국 추세 차트"
    />
  );
}
