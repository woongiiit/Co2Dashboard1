/** Shared async ECharts bundle — avoids duplicate full imports across chart chunks. */
let echartsModulePromise: Promise<typeof import("echarts")> | null = null;

export function loadEcharts() {
  if (!echartsModulePromise) {
    echartsModulePromise = import("echarts");
  }
  return echartsModulePromise;
}
