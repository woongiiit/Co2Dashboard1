/** Temporary mock monthly series for wireframe / until API is connected. */

export const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
] as const;

export type TrendYear = "2023" | "2024" | "2025" | "2026";

/** tCO₂eq — seasonal curve aligned with design wireframe */
export const NATIONAL_MONTHLY_CARBON: Record<TrendYear, (number | null)[]> = {
  2023: [
    1_020_000, 1_080_000, 1_150_000, 1_220_000, 1_320_000, 1_480_000, 1_720_000,
    1_872_312, 1_650_000, 1_420_000, 1_180_000, 1_050_000,
  ],
  2024: [
    1_100_000, 1_180_000, 1_260_000, 1_340_000, 1_450_000, 1_620_000, 1_880_000,
    2_112_845, 1_900_000, 1_620_000, 1_350_000, 1_200_000,
  ],
  2025: [
    1_150_000, 1_230_000, 1_310_000, 1_390_000, 1_500_000, 1_680_000, 1_950_000,
    2_268_709, 2_040_000, 1_740_000, 1_450_000, 1_280_000,
  ],
  2026: [
    1_180_000, 1_240_000, 1_290_000, 1_324_551, null, null, null, null, null, null,
    null, null,
  ],
};

export const TREND_YEAR_META: Record<
  TrendYear,
  { label: string; color: string; dashed?: boolean }
> = {
  2023: { label: "2023년", color: "#94a3b8", dashed: true },
  2024: { label: "2024년", color: "#2563eb" },
  2025: { label: "2025년", color: "#4ade80" },
  2026: { label: "2026년", color: "#f97316" },
};

export const TREND_Y_AXIS_MAX = 2_500_000;

export const HIGHLIGHT_2026_APRIL = {
  monthIndex: 3,
  value: 1_324_551,
  label: "2026년 4월",
};
