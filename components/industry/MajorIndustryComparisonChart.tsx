"use client";

import { useMemo, useState } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildMajorIndustryBarOptions } from "@/lib/charts/industry-chart-options";
import { ChartModeToggle } from "./ChartModeToggle";

export function MajorIndustryComparisonChart() {
  const [mode, setMode] = useState<"absolute" | "percent">("absolute");
  const option = useMemo(() => buildMajorIndustryBarOptions(mode), [mode]);

  return (
    <div className="industry-chart-panel">
      <div className="industry-chart-panel__toolbar">
        <ChartModeToggle mode={mode} onChange={setMode} />
      </div>
      <EChart
        option={option}
        height={280}
        ariaLabel="대분류 업종별 탄소발자국 비교 차트"
      />
    </div>
  );
}
