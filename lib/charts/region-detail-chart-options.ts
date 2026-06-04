import type { EChartsOption } from "echarts";
import {
  REGION_COMPARISON_ITEMS,
  REGION_INDUSTRY_COMPOSITION,
} from "@/lib/region-detail-mock";

const PIE_COLORS = [
  "#2f8f5b",
  "#7dd3a8",
  "#9adfd8",
  "#f5c9a8",
  "#c4b8ea",
  "#94a3b8",
];

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function buildIndustryCompositionOptions(): EChartsOption {
  return {
    color: PIE_COLORS,
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name?: string; value?: number; percent?: number };
        return `${p.name}<br/>${formatCo2(Number(p.value))} tCO₂eq (${p.percent}%)`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        data: REGION_INDUSTRY_COMPOSITION.map((item) => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
  };
}

export function buildRegionComparisonOptions(): EChartsOption {
  const labels = REGION_COMPARISON_ITEMS.map((i) => i.label).reverse();
  const values = REGION_COMPARISON_ITEMS.map((i) => i.value).reverse();

  return {
    grid: { left: 8, right: 72, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const idx = params[0].dataIndex as number;
        const item = REGION_COMPARISON_ITEMS[REGION_COMPARISON_ITEMS.length - 1 - idx];
        const arrow = item.changeDirection === "up" ? "▲" : "▼";
        return `${item.label}<br/>${formatCo2(item.value)} tCO₂eq<br/>${arrow} ${item.changePercent}%`;
      },
    },
    xAxis: {
      type: "value",
      max: 500_000,
      axisLabel: {
        fontSize: 10,
        color: "#64748b",
        formatter: (v: number) => formatCo2(v),
      },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    yAxis: {
      type: "category",
      data: labels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { fontSize: 11, color: "#334155" },
    },
    series: [
      {
        type: "bar",
        data: values,
        barWidth: 18,
        itemStyle: { color: "#2f8f5b", borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: "right",
          fontSize: 10,
          formatter: (p: { dataIndex?: number }) => {
            const idx = p.dataIndex ?? 0;
            const item =
              REGION_COMPARISON_ITEMS[REGION_COMPARISON_ITEMS.length - 1 - idx];
            const arrow = item.changeDirection === "up" ? "▲" : "▼";
            const color = item.changeDirection === "up" ? "#dc2626" : "#16a34a";
            return `{val|${formatCo2(item.value)}}\n{chg|${arrow} ${item.changePercent}%}`;
          },
          rich: {
            val: { fontSize: 10, color: "#334155", fontWeight: 600 },
            chg: { fontSize: 9, color: "#dc2626", lineHeight: 16 },
          },
        },
      },
    ],
  };
}

/** Regional monthly trend — mock series for detail page */
export function buildRegionMonthlyTrendOptions(
  regionName: string,
): EChartsOption {
  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const selected = [
    42_000, 38_000, 45_000, 48_000, 52_000, 58_000, 68_000, 60_842, 55_000, 48_000,
    44_000, 40_000,
  ];
  const prevYear = selected.map((v) => Math.round(v * 0.88));
  const national = selected.map((v) => Math.round(v * 1.15));
  const sido = selected.map((v) => Math.round(v * 1.05));

  return {
    legend: {
      top: 0,
      right: 0,
      itemWidth: 16,
      textStyle: { fontSize: 10, color: "#475569" },
    },
    grid: { left: 48, right: 12, top: 36, bottom: 28 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
      axisLabel: { fontSize: 10, color: "#64748b" },
    },
    yAxis: {
      type: "value",
      max: 80_000,
      interval: 20_000,
      axisLabel: {
        fontSize: 10,
        formatter: (v: number) => formatCo2(v),
      },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: [
      {
        name: regionName,
        type: "line",
        data: selected,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 2, color: "#2f8f5b" },
        itemStyle: { color: "#2f8f5b" },
      },
      {
        name: "전년(동월)",
        type: "line",
        data: prevYear,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 1.5, type: "dashed", color: "#94a3b8" },
        itemStyle: { color: "#94a3b8" },
      },
      {
        name: "전국 평균",
        type: "line",
        data: national,
        symbol: "none",
        lineStyle: { width: 1.5, color: "#4ade80" },
      },
      {
        name: "강원도 평균",
        type: "line",
        data: sido,
        symbol: "none",
        lineStyle: { width: 1.5, color: "#f97316" },
      },
    ],
  };
}
