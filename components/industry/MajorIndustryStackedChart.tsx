"use client";

import type { IndustryMajorItem } from "@/lib/industry-excel/types";

type MajorIndustryStackedChartProps = {
  items?: IndustryMajorItem[];
};

/** 스택 차트는 현재 대시보드 그리드에서 미사용 — API 연동 시 확장 */
export function MajorIndustryStackedChart(_props: MajorIndustryStackedChartProps) {
  return (
    <p className="dashboard-empty" role="status">
      스택 차트 데이터가 없습니다.
    </p>
  );
}
