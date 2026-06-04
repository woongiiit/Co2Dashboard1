"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { buildIndustryCompositionOptions } from "@/lib/charts/region-detail-chart-options";
import { REGION_INDUSTRY_COMPOSITION } from "@/lib/region-detail-mock";

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function IndustryCompositionPanel() {
  const option = useMemo(() => buildIndustryCompositionOptions(), []);

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
          {REGION_INDUSTRY_COMPOSITION.map((row, index) => (
            <tr key={row.name}>
              <td>
                <span
                  className="industry-composition__dot"
                  style={{
                    backgroundColor: [
                      "#2563eb",
                      "#60a5fa",
                      "#4ade80",
                      "#facc15",
                      "#fb923c",
                      "#94a3b8",
                    ][index],
                  }}
                  aria-hidden="true"
                />
                {row.name}
              </td>
              <td className="industry-composition__num">{formatCo2(row.value)}</td>
              <td className="industry-composition__share">{row.share}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>총 합계</td>
            <td className="industry-composition__num">412,875</td>
            <td className="industry-composition__share">100.0%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
