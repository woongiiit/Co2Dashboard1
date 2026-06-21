"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildDeepAnalysisIndustryCompositionOptions } from "@/lib/charts/deep-analysis-chart-options";
import type { IndustryDeepAnalysisData } from "@/lib/industry-excel/types";

type DeepAnalysisIndustryCompositionChartProps = {
  composition: IndustryDeepAnalysisData["composition"];
};

export function DeepAnalysisIndustryCompositionChart({
  composition,
}: DeepAnalysisIndustryCompositionChartProps) {
  const option = useMemo(
    () => buildDeepAnalysisIndustryCompositionOptions(composition),
    [composition],
  );

  return (
    <EChart
      option={option}
      height={280}
      ariaLabel="월별 업종별 구성 비중 차트"
    />
  );
}
