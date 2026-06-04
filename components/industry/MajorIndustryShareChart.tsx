"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildMajorIndustryTreemapOptions } from "@/lib/charts/industry-chart-options";

export function MajorIndustryShareChart() {
  const option = useMemo(() => buildMajorIndustryTreemapOptions(), []);

  return (
    <div className="industry-share-chart">
      <EChart
        option={option}
        fill
        ariaLabel="대분류 업종별 비중 treemap"
      />
    </div>
  );
}
