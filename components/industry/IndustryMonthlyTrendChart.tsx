"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildIndustryMonthlyTrendOptions } from "@/lib/charts/industry-chart-options";
import type {
  IndustryMonthlyHighlight,
} from "@/lib/industry-excel/types";
import type { RegionTrendSeries } from "@/lib/region-excel/types";

type IndustryMonthlyTrendChartProps = {
  trend: RegionTrendSeries;
  highlight: IndustryMonthlyHighlight | null;
};

export function IndustryMonthlyTrendChart({
  trend,
  highlight,
}: IndustryMonthlyTrendChartProps) {
  const option = useMemo(
    () => buildIndustryMonthlyTrendOptions(trend, highlight),
    [trend, highlight],
  );

  return (
    <EChart
      option={option}
      height={280}
      ariaLabel="선택 업종 월별 탄소발자국 추세 차트"
    />
  );
}
