"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildIndustryMonthlyTrendOptions } from "@/lib/charts/industry-chart-options";

export function IndustryMonthlyTrendChart() {
  const option = useMemo(() => buildIndustryMonthlyTrendOptions(), []);

  return (
    <EChart
      option={option}
      height={260}
      ariaLabel="선택 업종 월별 탄소발자국 추세 차트"
    />
  );
}
