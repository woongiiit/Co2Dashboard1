"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildMajorIndustryTreemapOptions } from "@/lib/charts/industry-chart-options";
import type { IndustryMajorItem } from "@/lib/industry-excel/types";

type MajorIndustryShareChartProps = {
  items: IndustryMajorItem[];
};

export function MajorIndustryShareChart({ items }: MajorIndustryShareChartProps) {
  const option = useMemo(() => buildMajorIndustryTreemapOptions(items), [items]);

  if (items.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        업종 비중 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="industry-share-chart">
      <EChart option={option} fill ariaLabel="대분류 업종별 비중 treemap" />
    </div>
  );
}
