"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildIndustryCompositionOptions } from "@/lib/charts/region-detail-chart-options";
import type { RegionDetailIndustryShare } from "@/lib/region-excel/types";

const TABLE_COLORS = [
  "#2563eb",
  "#60a5fa",
  "#4ade80",
  "#facc15",
  "#fb923c",
  "#94a3b8",
];

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

type IndustryCompositionPanelProps = {
  items: RegionDetailIndustryShare[];
};

export function IndustryCompositionPanel({ items }: IndustryCompositionPanelProps) {
  const option = useMemo(() => buildIndustryCompositionOptions(items), [items]);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (items.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        업종별 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="industry-composition">
      <div className="industry-composition__chart">
        <EChart option={option} height={220} ariaLabel="업종별 탄소발자국 구성 도넛 차트" />
      </div>
      <table className="industry-composition__table">
        <thead>
          <tr>
            <th scope="col">업종</th>
            <th scope="col">탄소발자국</th>
            <th scope="col">비중</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={row.name}>
              <td>
                <span
                  className="industry-composition__dot"
                  style={{
                    backgroundColor: TABLE_COLORS[index % TABLE_COLORS.length],
                  }}
                  aria-hidden="true"
                />
                {row.name}
              </td>
              <td className="industry-composition__num">{formatCo2(row.value)}</td>
              <td className="industry-composition__share">{row.share.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>총 합계</td>
            <td className="industry-composition__num">{formatCo2(total)}</td>
            <td className="industry-composition__share">100.0%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
