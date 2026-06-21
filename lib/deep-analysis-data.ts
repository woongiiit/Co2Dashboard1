/** Mock data for 업종 심화분석 wireframe UI. */

import type { KpiItem } from "@/lib/mock-dashboard-data";
import { getIndustryKpiIconSrc } from "@/lib/industry-kpi-icons";

export type DeepAnalysisYearKey = "2023" | "2024" | "2025" | "2026-ytd";

export type DeepAnalysisComparisonRow = {
  label: string;
  unit: string;
  values: {
    y2023: string;
    y2024: string;
    y2024Change: string;
    y2024Direction: "up" | "down";
    y2025: string;
    y2025Change: string;
    y2025Direction: "up" | "down";
    y2026: string;
    y2026Change: string;
    y2026Direction: "up" | "down";
  };
};

export const DEEP_ANALYSIS_FILTER_DEFAULTS = {
  region: "all",
  industry: "all",
  compare: "yoy",
} as const;

export const DEEP_ANALYSIS_YEARLY_KPI: KpiItem[] = [
  {
    label: "2023 총량",
    value: "16,842,190",
    unit: "tCO₂eq",
    unitOnLabel: true,
    icon: "industry-carbon",
    iconSrc: getIndustryKpiIconSrc("industry-carbon"),
  },
  {
    label: "2024 총량",
    value: "18,732,341",
    unit: "tCO₂eq",
    unitOnLabel: true,
    change: "11.2% (+1,890,151)",
    changeDirection: "up",
    icon: "industry-carbon",
    iconSrc: getIndustryKpiIconSrc("industry-carbon"),
  },
  {
    label: "2025 총량",
    value: "19,852,614",
    unit: "tCO₂eq",
    unitOnLabel: true,
    change: "6.0% (+1,120,273)",
    changeDirection: "up",
    icon: "industry-carbon",
    iconSrc: getIndustryKpiIconSrc("industry-carbon"),
  },
  {
    label: "2026.01~04 총량",
    value: "6,123,998",
    unit: "tCO₂eq",
    unitOnLabel: true,
    change: "8.3% (+468,783)",
    changeDirection: "up",
    icon: "industry-carbon",
    iconSrc: getIndustryKpiIconSrc("industry-carbon"),
  },
];

export const DEEP_ANALYSIS_COMPARISON_ROWS: DeepAnalysisComparisonRow[] = [
  {
    label: "총 탄소발자국",
    unit: "tCO₂eq",
    values: {
      y2023: "16,842,190",
      y2024: "18,732,341",
      y2024Change: "+11.2%",
      y2024Direction: "up",
      y2025: "19,852,614",
      y2025Change: "+6.0%",
      y2025Direction: "up",
      y2026: "6,123,998",
      y2026Change: "+8.3%",
      y2026Direction: "up",
    },
  },
  {
    label: "관광객 수",
    unit: "명",
    values: {
      y2023: "28,412,580",
      y2024: "30,186,420",
      y2024Change: "+6.2%",
      y2024Direction: "up",
      y2025: "31,548,960",
      y2025Change: "+4.5%",
      y2025Direction: "up",
      y2026: "10,842,310",
      y2026Change: "+5.1%",
      y2026Direction: "up",
    },
  },
  {
    label: "관광소비액",
    unit: "억원",
    values: {
      y2023: "842,610",
      y2024: "918,420",
      y2024Change: "+9.0%",
      y2024Direction: "up",
      y2025: "986,350",
      y2025Change: "+7.4%",
      y2025Direction: "up",
      y2026: "328,740",
      y2026Change: "+8.6%",
      y2026Direction: "up",
    },
  },
  {
    label: "1인당 탄소발자국",
    unit: "kgCO₂eq/인",
    values: {
      y2023: "0.593",
      y2024: "0.621",
      y2024Change: "+4.7%",
      y2024Direction: "up",
      y2025: "0.629",
      y2025Change: "+1.3%",
      y2025Direction: "up",
      y2026: "0.565",
      y2026Change: "-2.6%",
      y2026Direction: "down",
    },
  },
];

export const DEEP_ANALYSIS_NOTICE_ITEMS = [
  "2026년은 4월까지 데이터이며, 동일기간 비교가 필요합니다.",
  "2023~2025년은 연간·동월 누적 기준입니다.",
  "업종별 구성비는 6대 업종(숙박·음식·교통·여행·레저·기타) 합산입니다.",
  "증감률은 전년 동기간(동월) 대비 기준입니다.",
];

export const DEEP_ANALYSIS_AI_SUMMARY = [
  "전국 관광 탄소발자국은 2025년 8월 2,268,709 tCO₂eq로 정점을 기록했습니다.",
  "2024년 대비 2025년 연간 총량은 +6.0%, 2026년 1~4월은 동기간 +8.3% 증가했습니다.",
  "여행·운송·숙박 3대 업종이 전체의 70% 이상을 차지합니다.",
  "6~8월 성수기에 전체 배출의 35% 이상이 집중됩니다.",
  "레저·오락업 비중은 완만히 증가 추세이며, 기타 업종은 소폭 감소했습니다.",
];

/** 6대 업종 — 심화분석 구성비 차트용 */
export const DEEP_ANALYSIS_INDUSTRY_COMPOSITION = [
  { name: "숙박업", color: "#60A5FA", baseShare: 18 },
  { name: "음식업", color: "#4ADE80", baseShare: 14 },
  { name: "교통업", color: "#A78BFA", baseShare: 28 },
  { name: "여행업", color: "#FB923C", baseShare: 12 },
  { name: "레저·오락", color: "#2DD4BF", baseShare: 20 },
  { name: "기타", color: "#94A3B8", baseShare: 8 },
] as const;

/** 분기 월(1·4·7·10월) × 연도 — 2026은 1·4월만 */
export const DEEP_ANALYSIS_COMPOSITION_BUCKETS = [
  { label: "23.01", year: "2023", monthIndex: 0, seasonBoost: 0 },
  { label: "23.04", year: "2023", monthIndex: 3, seasonBoost: 1 },
  { label: "23.07", year: "2023", monthIndex: 6, seasonBoost: 3 },
  { label: "23.10", year: "2023", monthIndex: 9, seasonBoost: 1 },
  { label: "24.01", year: "2024", monthIndex: 0, seasonBoost: 0 },
  { label: "24.04", year: "2024", monthIndex: 3, seasonBoost: 1 },
  { label: "24.07", year: "2024", monthIndex: 6, seasonBoost: 3 },
  { label: "24.10", year: "2024", monthIndex: 9, seasonBoost: 1 },
  { label: "25.01", year: "2025", monthIndex: 0, seasonBoost: 0 },
  { label: "25.04", year: "2025", monthIndex: 3, seasonBoost: 1 },
  { label: "25.07", year: "2025", monthIndex: 6, seasonBoost: 3 },
  { label: "25.10", year: "2025", monthIndex: 9, seasonBoost: 1 },
  { label: "26.01", year: "2026", monthIndex: 0, seasonBoost: 0 },
  { label: "26.04", year: "2026", monthIndex: 3, seasonBoost: 1 },
] as const;

export const DEEP_ANALYSIS_YOY_YEARS = ["2024", "2025", "2026"] as const;

export const DEEP_ANALYSIS_YOY_COLORS: Record<
  (typeof DEEP_ANALYSIS_YOY_YEARS)[number],
  string
> = {
  "2024": "#2563eb",
  "2025": "#7c3aed",
  "2026": "#f97316",
};
