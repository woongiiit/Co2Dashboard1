"use client";

import { useMemo, useState } from "react";
import { EChart } from "@/components/charts/EChart";
import {
  buildMidIndustryBarOptions,
  getMidIndustryChartMinWidth,
} from "@/lib/charts/industry-chart-options";
import type { IndustryMidItem } from "@/lib/industry-excel/types";
import { ChartModeToggle } from "./ChartModeToggle";

type MidIndustryComparisonChartProps = {
  items: IndustryMidItem[];
};

export function MidIndustryComparisonChart({
  items,
}: MidIndustryComparisonChartProps) {
  const [mode, setMode] = useState<"absolute" | "percent">("absolute");
  const option = useMemo(
    () => buildMidIndustryBarOptions(items, mode),
    [items, mode],
  );
  const chartMinWidth = useMemo(
    () => getMidIndustryChartMinWidth(items, mode),
    [items, mode],
  );
  const chartHeight = Math.max(280, items.length * 28);

  if (items.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        업종 비교 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="industry-chart-panel industry-chart-panel--scroll">
      <div className="industry-chart-panel__toolbar">
        <ChartModeToggle mode={mode} onChange={setMode} />
      </div>
      <div className="industry-mid-compare-scroll">
        <div
          className="industry-mid-compare-scroll__inner"
          style={{ minWidth: `max(100%, ${chartMinWidth}px)` }}
        >
          <EChart
            option={option}
            height={chartHeight}
            ariaLabel="중분류 업종별 탄소발자국 비교 차트"
          />
        </div>
      </div>
    </div>
  );
}
