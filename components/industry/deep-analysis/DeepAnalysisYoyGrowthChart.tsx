"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildDeepAnalysisYoyGrowthOptions } from "@/lib/charts/deep-analysis-chart-options";
import type { IndustryDeepAnalysisData } from "@/lib/industry-excel/types";

type DeepAnalysisYoyGrowthChartProps = {
  yoyGrowth: IndustryDeepAnalysisData["yoyGrowth"];
};

export function DeepAnalysisYoyGrowthChart({
  yoyGrowth,
}: DeepAnalysisYoyGrowthChartProps) {
  const option = useMemo(
    () => buildDeepAnalysisYoyGrowthOptions(yoyGrowth),
    [yoyGrowth],
  );

  return (
    <EChart
      option={option}
      height={280}
      ariaLabel="전년 동월 대비 증감률 추세 차트"
    />
  );
}
