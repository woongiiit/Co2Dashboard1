"use client";

import dynamic from "next/dynamic";
import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";

export const RegionCarbonMapLazy = dynamic(
  () =>
    import("@/components/map/RegionCarbonMap").then((mod) => mod.RegionCarbonMap),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="map" label="지도 불러오는 중…" />,
  },
);

export const NationalMonthlyCarbonTrendChartLazy = dynamic(
  () =>
    import("@/components/charts/NationalMonthlyCarbonTrendChart").then(
      (mod) => mod.NationalMonthlyCarbonTrendChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" label="차트 불러오는 중…" />,
  },
);

export const MajorIndustryComparisonChartLazy = dynamic(
  () =>
    import("@/components/industry/MajorIndustryComparisonChart").then(
      (mod) => mod.MajorIndustryComparisonChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const IndustryMonthlyTrendChartLazy = dynamic(
  () =>
    import("@/components/industry/IndustryMonthlyTrendChart").then(
      (mod) => mod.IndustryMonthlyTrendChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const MidIndustryComparisonChartLazy = dynamic(
  () =>
    import("@/components/industry/MidIndustryComparisonChart").then(
      (mod) => mod.MidIndustryComparisonChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const MajorIndustryShareChartLazy = dynamic(
  () =>
    import("@/components/industry/MajorIndustryShareChart").then(
      (mod) => mod.MajorIndustryShareChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const MajorIndustryStackedChartLazy = dynamic(
  () =>
    import("@/components/industry/MajorIndustryStackedChart").then(
      (mod) => mod.MajorIndustryStackedChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const RegionDetailMapPanelLazy = dynamic(
  () =>
    import("@/components/region-detail/RegionDetailMapPanel").then(
      (mod) => mod.RegionDetailMapPanel,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="map" label="지도 불러오는 중…" />,
  },
);

export const IndustryCompositionPanelLazy = dynamic(
  () =>
    import("@/components/region-detail/IndustryCompositionPanel").then(
      (mod) => mod.IndustryCompositionPanel,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" label="차트 불러오는 중…" />,
  },
);

export const RegionComparisonChartLazy = dynamic(
  () =>
    import("@/components/region-detail/RegionComparisonChart").then(
      (mod) => mod.RegionComparisonChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" label="차트 불러오는 중…" />,
  },
);

export const RegionMonthlyTrendChartLazy = dynamic(
  () =>
    import("@/components/region-detail/RegionMonthlyTrendChart").then(
      (mod) => mod.RegionMonthlyTrendChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" label="차트 불러오는 중…" />,
  },
);

export const SectorEmissionBarChartLazy = dynamic(
  () =>
    import("@/components/ai-consulting/SectorEmissionBarChart").then(
      (mod) => mod.SectorEmissionBarChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const ComparisonRadarChartLazy = dynamic(
  () =>
    import("@/components/ai-consulting/ComparisonRadarChart").then(
      (mod) => mod.ComparisonRadarChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const DeepAnalysisMonthlyTrendChartLazy = dynamic(
  () =>
    import("@/components/industry/deep-analysis/DeepAnalysisMonthlyTrendChart").then(
      (mod) => mod.DeepAnalysisMonthlyTrendChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" label="추세 차트 불러오는 중…" />,
  },
);

export const DeepAnalysisIndustryCompositionChartLazy = dynamic(
  () =>
    import("@/components/industry/deep-analysis/DeepAnalysisIndustryCompositionChart").then(
      (mod) => mod.DeepAnalysisIndustryCompositionChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);

export const DeepAnalysisYoyGrowthChartLazy = dynamic(
  () =>
    import("@/components/industry/deep-analysis/DeepAnalysisYoyGrowthChart").then(
      (mod) => mod.DeepAnalysisYoyGrowthChart,
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton variant="chart" />,
  },
);
