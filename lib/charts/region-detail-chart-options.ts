import type { EChartsOption } from "echarts";
import type {
  RegionDetailComparisonItem,
  RegionDetailIndustryShare,
  RegionDetailMonthlyTrend,
} from "@/lib/region-excel/types";

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

export function buildIndustryCompositionOptions(
  items: RegionDetailIndustryShare[],
): EChartsOption {
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
        data: items.map((item) => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
  };
}

export function buildRegionComparisonOptions(
  items: RegionDetailComparisonItem[],
): EChartsOption {
  const labels = items.map((item) => item.label).reverse();
  const values = items.map((item) => item.value).reverse();
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return {
    grid: { left: 8, right: 72, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const idx = params[0].dataIndex as number;
        const item = items[items.length - 1 - idx];
        if (!item) return "";
        const arrow = item.changeDirection === "up" ? "▲" : "▼";
        return `${item.label}<br/>${formatCo2(item.value)} tCO₂eq<br/>${arrow} ${item.changePercent}%`;
      },
    },
    xAxis: {
      type: "value",
      max: Math.ceil(maxValue * 1.15),
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
            const item = items[items.length - 1 - idx];
            if (!item) return "";
            const arrow = item.changeDirection === "up" ? "▲" : "▼";
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

export function buildRegionMonthlyTrendOptions(
  trend: RegionDetailMonthlyTrend,
): EChartsOption {
  const allValues = [
    ...trend.selected,
    ...trend.prevYearSameMonth,
    ...trend.nationalAvg,
    ...trend.sidoAvg,
  ].filter((value): value is number => value != null && value > 0);

  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 80_000;
  const yMax = Math.ceil(maxValue * 1.2 / 10_000) * 10_000;
  const interval = Math.max(10_000, Math.ceil(yMax / 4 / 10_000) * 10_000);

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
      data: trend.months,
      boundaryGap: false,
      axisLabel: { fontSize: 10, color: "#64748b" },
    },
    yAxis: {
      type: "value",
      max: yMax,
      interval,
      axisLabel: {
        fontSize: 10,
        formatter: (v: number) => formatCo2(v),
      },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: [
      {
        name: trend.seriesLabels.selected,
        type: "line",
        data: trend.selected,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 2, color: "#2f8f5b" },
        itemStyle: { color: "#2f8f5b" },
      },
      {
        name: "전년(동월)",
        type: "line",
        data: trend.prevYearSameMonth,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 1.5, type: "dashed", color: "#94a3b8" },
        itemStyle: { color: "#94a3b8" },
      },
      {
        name: "전국 평균",
        type: "line",
        data: trend.nationalAvg,
        symbol: "none",
        lineStyle: { width: 1.5, color: "#4ade80" },
      },
      {
        name: trend.seriesLabels.sido,
        type: "line",
        data: trend.sidoAvg,
        symbol: "none",
        lineStyle: { width: 1.5, color: "#f97316" },
      },
    ],
  };
}
