"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";

type RegionMonthlyTrendChartProps = {
  option: EChartsOption;
  className?: string;
};

export function RegionMonthlyTrendChart({
  option,
  className = "",
}: RegionMonthlyTrendChartProps) {
  const stableOption = useMemo(() => option, [option]);

  return (
    <div className={`monthly-trend-chart ${className}`.trim()}>
      <p className="monthly-trend-chart__unit">(tCO₂eq)</p>
      <EChart
        option={stableOption}
        height={300}
        ariaLabel="전국 월별 관광 탄소발자국 추세 차트"
      />
      <p className="monthly-trend-chart__note">
        ※ 2026년은 4월까지 데이터이며, 동일기간 비교가 필요합니다.
      </p>
    </div>
  );
}
