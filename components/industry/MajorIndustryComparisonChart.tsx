"use client";

import { useMemo, useState } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildMajorIndustryBarOptions } from "@/lib/charts/industry-chart-options";
import type { IndustryMajorItem } from "@/lib/industry-excel/types";
import { ChartModeToggle } from "./ChartModeToggle";

type MajorIndustryComparisonChartProps = {
  items: IndustryMajorItem[];
};

export function MajorIndustryComparisonChart({
  items,
}: MajorIndustryComparisonChartProps) {
  const [mode, setMode] = useState<"absolute" | "percent">("absolute");
  const option = useMemo(
    () => buildMajorIndustryBarOptions(items, mode),
    [items, mode],
  );

  if (items.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        업종 비교 데이터가 없습니다.
      </p>
    );
  }

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
