"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildSectorEmissionBarOptions } from "@/lib/charts/ai-consulting-chart-options";

export function SectorEmissionBarChart() {
  const option = useMemo(() => buildSectorEmissionBarOptions(), []);

  return (
    <div className="ai-consult-sector-chart">
      <p className="ai-consult-sector-chart__title">주요 부문별 배출 비중 (tCO₂eq)</p>
      <EChart
        option={option}
        height={220}
        ariaLabel="주요 부문별 배출 비중 가로 막대 차트"
      />
      <p className="ai-consult-sector-chart__note">* 선택 기간 종합 기준</p>
    </div>
  );
}
