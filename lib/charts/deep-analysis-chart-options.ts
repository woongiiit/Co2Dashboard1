import type { EChartsOption } from "echarts";
import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import type { IndustryDeepAnalysisData } from "@/lib/industry-excel/types";
import type { RegionTrendSeries } from "@/lib/region-excel/types";

const YOY_COLORS = {
  "2024": "#2563eb",
  "2025": "#7c3aed",
  "2026": "#f97316",
} as const;

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function computeYAxisMax(trend: RegionTrendSeries): number {
  const values = (["2023", "2024", "2025", "2026"] as const).flatMap((year) =>
    (trend[year] ?? []).filter((value): value is number => value != null),
  );
  const max = values.length > 0 ? Math.max(...values) : 500_000;
  return Math.ceil(max * 1.15 / 100_000) * 100_000;
}

export function buildDeepAnalysisMonthlyTrendOptions(
  trend: RegionTrendSeries,
): EChartsOption {
  const years = ["2023", "2024", "2025", "2026"] as const;
  const colors: Record<(typeof years)[number], string> = {
    "2023": "#94a3b8",
    "2024": "#2F8F5B",
    "2025": "#7c3aed",
    "2026": "#f97316",
  };
  const yMax = computeYAxisMax(trend);
  const interval = Math.max(100_000, Math.ceil(yMax / 4 / 100_000) * 100_000);

  const series = years.map((year) => ({
    name: `${year}년`,
    type: "line" as const,
    data: trend[year] ?? [],
    connectNulls: false,
    symbol: "circle",
    symbolSize: 6,
    lineStyle: { width: 2, color: colors[year] },
    itemStyle: { color: colors[year], borderColor: "#fff", borderWidth: 1 },
  }));

  return {
    animationDuration: 600,
    grid: { left: 56, right: 16, top: 72, bottom: 28, containLabel: false },
    legend: {
      top: 4,
      right: 0,
      itemWidth: 20,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: "#55735F" },
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: [...MONTH_LABELS],
      boundaryGap: false,
      axisLabel: { color: "#55735F", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: yMax,
      interval,
      axisLabel: {
        color: "#55735F",
        fontSize: 11,
        formatter: (value: number) => formatCo2(value),
      },
      splitLine: { lineStyle: { color: "#E7F1EA", type: "dashed" } },
    },
    series,
  };
}

export function buildDeepAnalysisIndustryCompositionOptions(
  composition: IndustryDeepAnalysisData["composition"],
): EChartsOption {
  const labels = composition.buckets.map((bucket) => bucket.label);
  const industries = composition.industries;

  return {
    legend: {
      top: 0,
      left: 0,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { fontSize: 10, color: "#475569" },
    },
    grid: { left: 44, right: 12, top: 40, bottom: 36 },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { fontSize: 9, color: "#64748b", interval: 0, rotate: 45 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        fontSize: 10,
        color: "#64748b",
        formatter: (value: number) => `${value}%`,
      },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: industries.map((industry, industryIndex) => ({
      name: industry.name,
      type: "bar" as const,
      stack: "composition",
      emphasis: { focus: "series" as const },
      barWidth: "58%",
      itemStyle: { color: industry.color },
      data: composition.buckets.map((bucket) => bucket.shares[industryIndex] ?? 0),
    })),
  };
}

export function buildDeepAnalysisYoyGrowthOptions(
  yoyGrowth: IndustryDeepAnalysisData["yoyGrowth"],
): EChartsOption {
  const years = ["2024", "2025", "2026"] as const;
  const allValues = years.flatMap((year) =>
    yoyGrowth[year].filter((value): value is number => value != null),
  );
  const maxAbs = allValues.length > 0 ? Math.max(...allValues.map(Math.abs)) : 30;
  const bound = Math.ceil((maxAbs + 5) / 10) * 10;

  return {
    legend: {
      top: 0,
      right: 0,
      itemWidth: 14,
      itemHeight: 8,
      textStyle: { fontSize: 10, color: "#475569" },
    },
    grid: { left: 44, right: 12, top: 40, bottom: 28 },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: [...MONTH_LABELS],
      axisLabel: { fontSize: 10, color: "#64748b" },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: -bound,
      max: bound,
      interval: bound / 2,
      axisLabel: {
        fontSize: 10,
        color: "#64748b",
        formatter: (value: number) => `${value}%`,
      },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: years.map((year) => ({
      name: `${year}년`,
      type: "bar" as const,
      barGap: "10%",
      barWidth: "18%",
      itemStyle: { color: YOY_COLORS[year] },
      data: yoyGrowth[year],
    })),
  };
}

export { formatPercent };
