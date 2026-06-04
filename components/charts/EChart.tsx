"use client";

import { useEffect, useRef } from "react";
import type { ECharts, EChartsOption } from "echarts";
import { loadEcharts } from "@/lib/echarts-loader";

type EChartProps = {
  option: EChartsOption;
  className?: string;
  /** Fixed pixel height. Omit when `fill` is true. */
  height?: number;
  /** Stretch chart to fill the parent flex area. */
  fill?: boolean;
  ariaLabel?: string;
};

export function EChart({
  option,
  className = "",
  height = 280,
  fill = false,
  ariaLabel = "차트",
}: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    loadEcharts().then((echarts) => {
      if (disposed || !containerRef.current) return;

      const instance = echarts.init(containerRef.current);
      chartRef.current = instance;
      instance.setOption(option, { notMerge: true });

      const resizeChart = () => {
        chartRef.current?.resize();
      };

      requestAnimationFrame(resizeChart);

      resizeObserver = new ResizeObserver(resizeChart);
      resizeObserver.observe(container);
    });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [option]);

  return (
    <div
      className={`echart-root${fill ? " echart-root--fill" : ""} ${className}`.trim()}
      style={fill ? undefined : { height }}
      role="img"
      aria-label={ariaLabel}
    >
      <div ref={containerRef} className="echart-root__canvas" />
    </div>
  );
}
