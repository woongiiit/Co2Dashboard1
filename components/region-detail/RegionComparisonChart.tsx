"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildRegionComparisonOptions } from "@/lib/charts/region-detail-chart-options";
import type { RegionDetailComparisonItem } from "@/lib/region-excel/types";

type RegionComparisonChartProps = {
  items: RegionDetailComparisonItem[];
};

export function RegionComparisonChart({ items }: RegionComparisonChartProps) {
  const option = useMemo(() => buildRegionComparisonOptions(items), [items]);

  if (items.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        비교 데이터가 없습니다.
      </p>
    );
  }

  return (
    <EChart
      option={option}
      height={220}
      ariaLabel="관광 탄소발자국 비교 분석 차트"
    />
  );
}
