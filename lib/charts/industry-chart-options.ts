import type { EChartsOption } from "echarts";
import {
  INDUSTRY_MONTHLY_BY_YEAR,
  INDUSTRY_MONTHLY_HIGHLIGHT,
  INDUSTRY_YEAR_META,
  MAJOR_INDUSTRY_ITEMS,
  MAJOR_INDUSTRY_MONTHLY_STACKED,
} from "@/lib/industry-chart-data";
import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

export function buildMajorIndustryBarOptions(
  mode: "absolute" | "percent",
): EChartsOption {
  const names = MAJOR_INDUSTRY_ITEMS.map((i) => i.name);
  const values =
    mode === "absolute"
      ? MAJOR_INDUSTRY_ITEMS.map((i) => i.value)
      : MAJOR_INDUSTRY_ITEMS.map((i) => i.share);

  const yMax = mode === "absolute" ? 3_500_000 : 40;

  return {
    grid: { left: 56, right: 16, top: 24, bottom: 48 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const idx = params[0].dataIndex as number;
        const item = MAJOR_INDUSTRY_ITEMS[idx];
        return `${item.name}<br/>${formatCo2(item.value)} tCO₂eq (${item.share}%)`;
      },
    },
    xAxis: {
      type: "category",
      data: names,
      axisLabel: { fontSize: 11, color: "#475569", interval: 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: mode === "absolute" ? "(tCO₂eq)" : "(%)",
      nameTextStyle: { fontSize: 10, color: "#64748b", padding: [0, 0, 0, 0] },
      max: yMax,
      interval: mode === "absolute" ? 500_000 : 10,
      axisLabel: {
        fontSize: 10,
        color: "#64748b",
        formatter: (v: number) =>
          mode === "absolute" ? formatCo2(v) : `${v}%`,
      },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    },
    series: [
      {
        type: "bar",
        data: values.map((val, idx) => ({
          value: val,
          itemStyle: { color: MAJOR_INDUSTRY_ITEMS[idx].color },
        })),
        barWidth: "48%",
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#1f3d2b",
          formatter: (p: unknown) => {
            const param = p as { dataIndex?: number };
            const item = MAJOR_INDUSTRY_ITEMS[param.dataIndex ?? 0];
            if (mode === "percent") {
              return `${item.share}%`;
            }
            return `${formatCo2(item.value)}\n(${item.share}%)`;
          },
        },
      },
    ],
  };
}

export function buildIndustryMonthlyTrendOptions(): EChartsOption {
  const years = ["2023", "2024", "2025", "2026"] as const;

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
      data: [...MONTH_LABELS],
      boundaryGap: false,
      axisLabel: { fontSize: 10, color: "#64748b" },
    },
    yAxis: {
      type: "value",
      max: 800_000,
      interval: 200_000,
      axisLabel: {
        fontSize: 10,
        formatter: (v: number) => formatCo2(v),
      },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: years.map((year) => {
      const meta = INDUSTRY_YEAR_META[year];
      const is2026 = year === "2026";
      return {
        name: meta.label,
        type: "line" as const,
        data: [...INDUSTRY_MONTHLY_BY_YEAR[year]],
        connectNulls: false,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 2, color: meta.color },
        itemStyle: { color: meta.color },
        markPoint: is2026
          ? {
              symbol: "roundRect",
              symbolSize: [110, 44],
              symbolOffset: [0, -24],
              itemStyle: {
                color: "#fff",
                borderColor: "#f97316",
                borderWidth: 1,
              },
              label: {
                show: true,
                formatter: () =>
                  `{t|${INDUSTRY_MONTHLY_HIGHLIGHT.label}}\n{v|${formatCo2(INDUSTRY_MONTHLY_HIGHLIGHT.value)} tCO₂eq}`,
                rich: {
                  t: { fontSize: 10, color: "#f97316", fontWeight: 600 },
                  v: { fontSize: 11, color: "#ea580c", fontWeight: 700 },
                },
                padding: [4, 6],
              },
              data: [
                {
                  name: INDUSTRY_MONTHLY_HIGHLIGHT.label,
                  coord: [
                    INDUSTRY_MONTHLY_HIGHLIGHT.monthIndex,
                    INDUSTRY_MONTHLY_HIGHLIGHT.value,
                  ],
                },
              ],
            }
          : undefined,
      };
    }),
  };
}

export function buildMajorIndustryStackedOptions(): EChartsOption {
  return {
    legend: {
      top: 0,
      left: 0,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { fontSize: 10, color: "#475569" },
    },
    grid: { left: 48, right: 12, top: 40, bottom: 28 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const month = params[0].axisValue as string;
        const lines = params
          .map((p) => {
            const s = p as { seriesName?: string; value?: number; color?: string };
            return `${s.seriesName}: ${formatCo2(s.value ?? 0)} tCO₂eq`;
          })
          .join("<br/>");
        const total = params.reduce(
          (sum, p) => sum + ((p as { value?: number }).value ?? 0),
          0,
        );
        return `${month}<br/>${lines}<br/><b>합계: ${formatCo2(total)} tCO₂eq</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: [...MONTH_LABELS],
      axisLabel: { fontSize: 10, color: "#64748b" },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      max: 800_000,
      interval: 200_000,
      axisLabel: {
        fontSize: 10,
        formatter: (v: number) => formatCo2(v),
      },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: MAJOR_INDUSTRY_MONTHLY_STACKED.map((item) => ({
      name: item.name,
      type: "bar" as const,
      stack: "total",
      emphasis: { focus: "series" as const },
      barWidth: "52%",
      itemStyle: { color: item.color },
      data: [...item.data],
    })),
  };
}

export function buildMajorIndustryTreemapOptions(): EChartsOption {
  return {
    tooltip: {
      formatter: (info: unknown) => {
        const p = info as { name?: string; value?: number; data?: { share?: number } };
        const item = MAJOR_INDUSTRY_ITEMS.find((i) => i.name === p.name);
        if (!item) return "";
        return `${item.name}<br/>${formatCo2(item.value)} tCO₂eq<br/>${item.share}%`;
      },
    },
    series: [
      {
        type: "treemap",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: (params: unknown) => {
            const p = params as { name?: string; data?: { share?: number; value?: number } };
            const item = MAJOR_INDUSTRY_ITEMS.find((i) => i.name === p.name);
            if (!item) return "";
            return `{pct|${item.share}%}\n{name|${item.name}}\n{val|${formatCo2(item.value)}}`;
          },
          rich: {
            pct: { fontSize: 18, fontWeight: 700, color: "#1f3d2b", lineHeight: 24 },
            name: { fontSize: 11, color: "#2f4f3f", lineHeight: 16 },
            val: { fontSize: 10, color: "#55735f", lineHeight: 14 },
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
          gapWidth: 2,
        },
        data: MAJOR_INDUSTRY_ITEMS.map((item) => ({
          name: item.name,
          value: item.value,
          share: item.share,
          itemStyle: { color: item.color },
        })),
      },
    ],
  };
}
