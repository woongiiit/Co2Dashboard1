"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildComparisonRadarOptions } from "@/lib/charts/ai-consulting-chart-options";

export function ComparisonRadarChart() {
  const option = useMemo(() => buildComparisonRadarOptions(), []);

  return (
    <div className="ai-consult-radar-chart">
      <p className="ai-consult-radar-chart__title">비교 수준 (전국 평균 대비)</p>
      <EChart
        option={option}
        height={240}
        ariaLabel="전국 평균 대비 비교 레이더 차트"
      />
    </div>
  );
}
