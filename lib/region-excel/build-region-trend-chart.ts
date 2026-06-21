import type { EChartsOption } from "echarts";
import {
  MONTH_LABELS,
  TREND_Y_AXIS_MAX,
  TREND_YEAR_META,
  type TrendYear,
} from "@/lib/charts/monthly-carbon-trend-data";
import { formatInteger } from "@/lib/region-excel/format";
import type { RegionTrendSeries } from "@/lib/region-excel/types";

const TREND_YEARS: TrendYear[] = ["2023", "2024", "2025", "2026"];

export function buildRegionTrendChartOptions(trend: RegionTrendSeries): EChartsOption {
  const yearMeta = {
    ...TREND_YEAR_META,
    "2024": { ...TREND_YEAR_META["2024"], color: "#2F8F5B" },
  };

  const series = TREND_YEARS.map((year) => {
    const meta = yearMeta[year];
    return {
      name: meta.label,
      type: "line" as const,
      data: trend[year],
      connectNulls: false,
      symbol: "circle",
      symbolSize: 6,
      showSymbol: true,
      lineStyle: {
        width: 2,
        color: meta.color,
        type: meta.dashed ? ("dashed" as const) : ("solid" as const),
      },
      itemStyle: {
        color: meta.color,
        borderColor: "#fff",
        borderWidth: 1,
      },
      emphasis: { focus: "series" as const },
    };
  });

  const maxValue = Math.max(
    0,
    ...TREND_YEARS.flatMap((year) =>
      (trend[year] ?? []).filter((value): value is number => value != null),
    ),
  );
  const yMax = Math.max(
    TREND_Y_AXIS_MAX,
    Math.ceil(maxValue / 500_000) * 500_000,
  );

  return {
    animationDuration: 600,
    grid: { left: 56, right: 16, top: 48, bottom: 28, containLabel: false },
    legend: {
      top: 4,
      right: 0,
      itemWidth: 20,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: "#55735F" },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#BFEBD2",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: "#1F3D2B", fontSize: 12 },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const first = params[0] as { axisValue?: string };
        const month = first.axisValue ?? "";
        const lines = params
          .filter((p) => p.value != null && p.value !== "")
          .map((p) => {
            const color = p.color as string;
            return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;"></span>${p.seriesName}: <strong>${formatInteger(Number(p.value))}</strong> tCO₂eq`;
          });
        return `<div style="font-weight:600;margin-bottom:4px;">${month}</div>${lines.join("<br/>")}`;
      },
    },
    xAxis: {
      type: "category",
      data: [...MONTH_LABELS],
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#BFEBD2" } },
      axisTick: { show: false },
      axisLabel: { color: "#55735F", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: yMax,
      interval: Math.max(500_000, yMax / 5),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#55735F",
        fontSize: 11,
        formatter: (value: number) => formatInteger(value),
      },
      splitLine: {
        lineStyle: { color: "#E7F1EA", type: "dashed" },
      },
    },
    series: series as EChartsOption["series"],
  };
}
