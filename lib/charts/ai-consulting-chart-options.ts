import type { EChartsOption } from "echarts";
import type {
  AiConsultingRadarData,
  SectorEmissionItem,
} from "@/lib/ai-consulting/types";

function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

export function buildSectorEmissionBarOptions(
  items: SectorEmissionItem[],
): EChartsOption {
  const sorted = [...items].sort((a, b) => b.share - a.share);
  const maxShare = Math.max(...sorted.map((item) => item.share), 10);

  return {
    grid: { left: 88, right: 52, top: 8, bottom: 8 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const idx = params[0].dataIndex as number;
        const item = sorted[idx];
        if (!item) return "";
        return `${item.name}<br/>${formatCo2(item.value)} tCO₂eq (${item.share}%)`;
      },
    },
    xAxis: {
      type: "value",
      max: Math.ceil(maxShare * 1.15),
      axisLabel: {
        fontSize: 10,
        color: "#64748b",
        formatter: (v: number) => `${v}%`,
      },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    },
    yAxis: {
      type: "category",
      data: sorted.map((item) => item.name),
      inverse: true,
      axisLabel: { fontSize: 10, color: "#334155" },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: "bar",
        data: sorted.map((item) => ({
          value: item.share,
          itemStyle: { color: "#5B9BD5", borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 14,
        label: {
          show: true,
          position: "right",
          fontSize: 10,
          color: "#475569",
          formatter: (p: unknown) => {
            const param = p as { dataIndex?: number };
            const item = sorted[param.dataIndex ?? 0];
            return item ? `${item.share}%` : "";
          },
        },
      },
    ],
  };
}

export function buildComparisonRadarOptions(
  radar: AiConsultingRadarData,
): EChartsOption {
  return {
    legend: {
      bottom: 0,
      itemWidth: 14,
      textStyle: { fontSize: 10, color: "#475569" },
    },
    radar: {
      center: ["50%", "46%"],
      radius: "58%",
      indicator: radar.indicators.map((name) => ({ name, max: 100 })),
      axisName: { fontSize: 10, color: "#64748b" },
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            name: "선택 지역",
            value: [...radar.region],
            areaStyle: { color: "rgba(91, 155, 213, 0.25)" },
            lineStyle: { color: "#5B9BD5", width: 2 },
            itemStyle: { color: "#5B9BD5" },
          },
          {
            name: "전국 평균",
            value: [...radar.national],
            lineStyle: { color: "#94a3b8", type: "dashed", width: 2 },
            itemStyle: { color: "#94a3b8" },
            areaStyle: { opacity: 0 },
          },
        ],
      },
    ],
  };
}
