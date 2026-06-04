"use client";

import { useMemo } from "react";
import { EChart } from "./EChart";
import { buildNationalMonthlyCarbonTrendOptions } from "@/lib/charts/monthly-carbon-trend-options";

type NationalMonthlyCarbonTrendChartProps = {
  height?: number;
  className?: string;
  variant?: "default" | "eco";
};

export function NationalMonthlyCarbonTrendChart({
  height = 300,
  className = "",
  variant = "default",
}: NationalMonthlyCarbonTrendChartProps) {
  const option = useMemo(
    () => buildNationalMonthlyCarbonTrendOptions(variant),
    [variant],
  );

  return (
    <div className={`monthly-trend-chart ${className}`.trim()}>
      <p className="monthly-trend-chart__unit">(tCO₂eq)</p>
      <EChart
        option={option}
        height={height}
        ariaLabel="전국 월별 관광 탄소발자국 추세 차트"
      />
      <p className="monthly-trend-chart__note">
        ※ 2026년은 4월까지 데이터이며, 동일기간 비교가 필요합니다.
      </p>
    </div>
  );
}
