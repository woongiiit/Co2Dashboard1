"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildMajorIndustryStackedOptions } from "@/lib/charts/industry-chart-options";

export function MajorIndustryStackedChart() {
  const option = useMemo(() => buildMajorIndustryStackedOptions(), []);

  return (
    <EChart
      option={option}
      height={260}
      ariaLabel="6대 업종 월별 탄소발자국 구성 스택 차트"
    />
  );
}
