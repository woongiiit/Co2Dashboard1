import type { EChartsOption } from "echarts";
import {
  HIGHLIGHT_2026_APRIL,
  MONTH_LABELS,
  NATIONAL_MONTHLY_CARBON,
  TREND_YEAR_META,
  TREND_Y_AXIS_MAX,
  type TrendYear,
} from "./monthly-carbon-trend-data";

const YEARS: TrendYear[] = ["2023", "2024", "2025", "2026"];

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function buildNationalMonthlyCarbonTrendOptions(
  variant: "default" | "eco" = "default",
): EChartsOption {
  const isEco = variant === "eco";
  const yearMeta = isEco
    ? {
        ...TREND_YEAR_META,
        "2024": { ...TREND_YEAR_META["2024"], color: "#2F8F5B" },
      }
    : TREND_YEAR_META;

  const series = YEARS.map((year) => {
    const meta = yearMeta[year];
    const is2026 = year === "2026";

    return {
      name: meta.label,
      type: "line" as const,
      data: NATIONAL_MONTHLY_CARBON[year],
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
      emphasis: {
        focus: "series" as const,
      },
      markPoint: is2026
        ? {
            symbol: "roundRect",
            symbolSize: [120, 48],
            symbolOffset: [0, -28],
            itemStyle: {
              color: "#fff",
              borderColor: "#f97316",
              borderWidth: 1,
            },
            label: {
              show: true,
              formatter: () =>
                `{title|${HIGHLIGHT_2026_APRIL.label}}\n{value|${formatCo2(HIGHLIGHT_2026_APRIL.value)} tCO₂eq}`,
              rich: {
                title: {
                  fontSize: 11,
                  color: "#f97316",
                  fontWeight: 600,
                  lineHeight: 18,
                },
                value: {
                  fontSize: 12,
                  color: "#ea580c",
                  fontWeight: 700,
                  lineHeight: 20,
                },
              },
              padding: [6, 8],
            },
            data: [
              {
                name: HIGHLIGHT_2026_APRIL.label,
                coord: [
                  HIGHLIGHT_2026_APRIL.monthIndex,
                  HIGHLIGHT_2026_APRIL.value,
                ],
              },
            ],
          }
        : undefined,
    };
  });

  return {
    animationDuration: 600,
    grid: {
      left: 56,
      right: 16,
      top: 48,
      bottom: 28,
      containLabel: false,
    },
    legend: {
      top: 4,
      right: 0,
      itemWidth: 20,
      itemHeight: 10,
      textStyle: {
        fontSize: 11,
        color: isEco ? "#55735F" : "#475569",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: isEco ? "#BFEBD2" : "#e2e8f0",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: isEco ? "#1F3D2B" : "#334155", fontSize: 12 },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const first = params[0] as { axisValue?: string; name?: string };
        const month = first.axisValue ?? first.name ?? "";
        const lines = params
          .filter((p) => p.value != null && p.value !== "")
          .map((p) => {
            const color = p.color as string;
            return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;"></span>${p.seriesName}: <strong>${formatCo2(Number(p.value))}</strong> tCO₂eq`;
          });
        return `<div style="font-weight:600;margin-bottom:4px;">${month}</div>${lines.join("<br/>")}`;
      },
    },
    xAxis: {
      type: "category",
      data: [...MONTH_LABELS],
      boundaryGap: false,
      axisLine: { lineStyle: { color: isEco ? "#BFEBD2" : "#cbd5e1" } },
      axisTick: { show: false },
      axisLabel: { color: isEco ? "#55735F" : "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: TREND_Y_AXIS_MAX,
      interval: 500_000,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: isEco ? "#55735F" : "#64748b",
        fontSize: 11,
        formatter: (value: number) => formatCo2(value),
      },
      splitLine: {
        lineStyle: { color: isEco ? "#E7F1EA" : "#f1f5f9", type: "dashed" },
      },
    },
    series: series as EChartsOption["series"],
  };
}
