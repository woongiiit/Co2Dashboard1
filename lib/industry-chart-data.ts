/** Temporary mock data for industry page charts. */

export type MajorIndustryItem = {
  name: string;
  value: number;
  share: number;
  color: string;
};

/** Pastel palette aligned with eco dashboard theme */
export const MAJOR_INDUSTRY_ITEMS: MajorIndustryItem[] = [
  { name: "숙박업", value: 3_011_245, share: 16.3, color: "#9DD9B8" },
  { name: "운송업", value: 5_876_412, share: 31.8, color: "#C4B8EA" },
  { name: "쇼핑업", value: 1_638_292, share: 8.9, color: "#9ADFD8" },
  { name: "여가서비스업", value: 4_187_516, share: 22.7, color: "#F5C9A8" },
  { name: "의료웰니스업", value: 1_052_743, share: 5.7, color: "#B5E6C8" },
  { name: "식음료업", value: 2_243_503, share: 12.1, color: "#F2B8D4" },
];

export const INDUSTRY_MONTHLY_BY_YEAR = {
  2023: [
    380_000, 400_000, 420_000, 440_000, 460_000, 500_000, 580_000, 620_000, 540_000,
    480_000, 420_000, 400_000,
  ],
  2024: [
    400_000, 420_000, 450_000, 470_000, 490_000, 530_000, 610_000, 650_000, 580_000,
    510_000, 450_000, 430_000,
  ],
  2025: [
    420_000, 440_000, 470_000, 490_000, 520_000, 560_000, 640_000, 680_000, 610_000,
    540_000, 480_000, 460_000,
  ],
  2026: [
    430_000, 450_000, 460_000, 268_451, null, null, null, null, null, null, null, null,
  ],
} as const;

export const INDUSTRY_MONTHLY_HIGHLIGHT = {
  monthIndex: 3,
  value: 268_451,
  label: "2026년 4월",
};

export const INDUSTRY_YEAR_META = {
  2023: { label: "2023년", color: "#94a3b8" },
  2024: { label: "2024년", color: "#2f8f5b" },
  2025: { label: "2025년", color: "#4ade80" },
  2026: { label: "2026년", color: "#f97316" },
} as const;

/** 2025년 월별 합계 × 대분류 비중 — 심화 분석 스택 차트용 */
export const MAJOR_INDUSTRY_MONTHLY_STACKED = MAJOR_INDUSTRY_ITEMS.map(
  (item) => ({
    name: item.name,
    color: item.color,
    data: INDUSTRY_MONTHLY_BY_YEAR["2025"].map((monthTotal) =>
      Math.round(monthTotal * (item.share / 100)),
    ),
  }),
);
