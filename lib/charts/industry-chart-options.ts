import type { EChartsOption } from "echarts";
import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import { INDUSTRY_YEAR_META } from "@/lib/industry-chart-data";
import type {
  IndustryMajorItem,
  IndustryMonthlyHighlight,
} from "@/lib/industry-excel/types";
import type { RegionTrendSeries } from "@/lib/region-excel/types";
import { formatScaledCarbonMass } from "@/lib/region-excel/format";

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

/** 관측값 min/max 기준 Y축 — 0 고정 대신 데이터 구간에 맞춰 확대 */
function computeObservedYAxisRange(values: number[]): {
  min: number;
  max: number;
  interval: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 800_000, interval: 200_000 };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = Math.max(maxValue - minValue, maxValue * 0.02);
  const padding = span * 0.08;

  const interval = niceTickStep(span + padding * 2, 4);
  const min = Math.floor((minValue - padding) / interval) * interval;
  const max = Math.ceil((maxValue + padding) / interval) * interval;

  return { min: Math.max(0, min), max, interval };
}

function niceTickStep(span: number, targetTicks: number): number {
  const rough = span / Math.max(1, targetTicks);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const niceUnit =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceUnit * magnitude;
}

export function buildMajorIndustryBarOptions(
  items: IndustryMajorItem[],
  mode: "absolute" | "percent",
): EChartsOption {
  const names = items.map((item) => item.name);
  const values =
    mode === "absolute"
      ? items.map((item) => item.value)
      : items.map((item) => item.share);
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const yMax =
    mode === "absolute"
      ? Math.ceil(maxValue * 1.15 / 100_000) * 100_000
      : 100;

  return {
    grid: { left: 56, right: 16, top: 24, bottom: 48 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const idx = params[0].dataIndex as number;
        const item = items[idx];
        if (!item) return "";
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
          itemStyle: { color: items[idx]?.color ?? "#2f8f5b" },
        })),
        barWidth: "48%",
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#1f3d2b",
          formatter: (p: unknown) => {
            const param = p as { dataIndex?: number };
            const item = items[param.dataIndex ?? 0];
            if (!item) return "";
            if (mode === "percent") return `${item.share}%`;
            return `${formatCo2(item.value)}\n(${item.share}%)`;
          },
        },
      },
    ],
  };
}

function formatMidBarLabel(
  item: IndustryMajorItem,
  mode: "absolute" | "percent",
): string {
  if (mode === "percent") return `${item.share}%`;
  const scaled = formatScaledCarbonMass(item.value);
  return `${scaled.value} ${scaled.unit} (${item.share}%)`;
}

/** 좌우 스크롤 시 라벨·막대가 잘리지 않도록 최소 차트 너비(px) */
export function getMidIndustryChartMinWidth(
  items: IndustryMajorItem[],
  mode: "absolute" | "percent",
): number {
  if (items.length === 0) return 280;

  const longestLabel = items.reduce(
    (max, item) => Math.max(max, formatMidBarLabel(item, mode).length),
    8,
  );
  const labelPx = Math.round(longestLabel * 6.8) + 20;
  const barFillRatio = 0.36;
  const plotWidth = Math.max(200, Math.ceil(labelPx / (1 - barFillRatio)));

  return 76 + plotWidth + 16;
}

export function buildMidIndustryBarOptions(
  items: IndustryMajorItem[],
  mode: "absolute" | "percent",
): EChartsOption {
  const names = items.map((item) => item.name);
  const values =
    mode === "absolute"
      ? items.map((item) => item.value)
      : items.map((item) => item.share);
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const maxShare = Math.max(...items.map((item) => item.share), 1);

  // 막대는 plot 왼쪽 ~36%까지만 쓰고, 오른쪽은 숫자 라벨 전용 공간으로 둠
  const barFillRatio = 0.36;
  const xMax =
    mode === "absolute"
      ? Math.ceil(maxValue / barFillRatio / 100_000) * 100_000
      : Math.max(100, Math.ceil(maxShare / barFillRatio));

  return {
    grid: { left: 76, right: 12, top: 8, bottom: 8, containLabel: false },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const idx = params[0].dataIndex as number;
        const item = items[idx];
        if (!item) return "";
        return `${item.name}<br/>${formatCo2(item.value)} tCO₂eq (${item.share}%)`;
      },
    },
    xAxis: {
      type: "value",
      max: xMax,
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    },
    yAxis: {
      type: "category",
      data: names,
      inverse: true,
      axisLabel: { fontSize: 10, color: "#475569", width: 72, overflow: "truncate" },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: "bar",
        data: values.map((val, idx) => ({
          value: val,
          itemStyle: { color: items[idx]?.color ?? "#2f8f5b" },
        })),
        barWidth: 14,
        label: {
          show: true,
          position: "right",
          distance: 6,
          fontSize: 10,
          color: "#1f3d2b",
          formatter: (p: unknown) => {
            const param = p as { dataIndex?: number };
            const item = items[param.dataIndex ?? 0];
            if (!item) return "";
            return formatMidBarLabel(item, mode);
          },
        },
      },
    ],
  };
}

export function buildIndustryMonthlyTrendOptions(
  trend: RegionTrendSeries,
  highlight: IndustryMonthlyHighlight | null,
): EChartsOption {
  const years = ["2023", "2024", "2025", "2026"] as const;
  const allValues = years.flatMap((year) =>
    (trend[year] ?? []).filter((value): value is number => value != null && value > 0),
  );
  const { min: yMin, max: yMax, interval } = computeObservedYAxisRange(allValues);

  return {
    legend: {
      top: 0,
      right: 0,
      itemWidth: 16,
      textStyle: { fontSize: 10, color: "#475569" },
    },
    grid: { left: 56, right: 12, top: 36, bottom: 28 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: [...MONTH_LABELS],
      boundaryGap: false,
      axisLabel: { fontSize: 10, color: "#64748b" },
    },
    yAxis: {
      type: "value",
      min: yMin,
      max: yMax,
      interval,
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
        data: [...(trend[year] ?? [])],
        connectNulls: false,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 2, color: meta.color },
        itemStyle: { color: meta.color },
        markPoint:
          is2026 && highlight
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
                    `{t|${highlight.label}}\n{v|${formatCo2(highlight.value)} tCO₂eq}`,
                  rich: {
                    t: { fontSize: 10, color: "#f97316", fontWeight: 600 },
                    v: { fontSize: 11, color: "#ea580c", fontWeight: 700 },
                  },
                  padding: [4, 6],
                },
                data: [
                  {
                    name: highlight.label,
                    coord: [highlight.monthIndex, highlight.value],
                  },
                ],
              }
            : undefined,
      };
    }),
  };
}

export function buildMajorIndustryTreemapOptions(
  items: IndustryMajorItem[],
): EChartsOption {
  return {
    tooltip: {
      formatter: (info: unknown) => {
        const p = info as { name?: string };
        const item = items.find((entry) => entry.name === p.name);
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
            const p = params as { name?: string };
            const item = items.find((entry) => entry.name === p.name);
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
        data: items.map((item) => ({
          name: item.name,
          value: item.value,
          share: item.share,
          itemStyle: { color: item.color },
        })),
      },
    ],
  };
}
