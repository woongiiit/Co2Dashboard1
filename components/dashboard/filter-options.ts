/** Temporary filter option lists for wireframe controls. */

import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";

export const PERIOD_OPTIONS = [
  { value: "2023-2026", label: "2023.01 ~ 2026.04" },
  { value: "2025", label: "2025년" },
  { value: "2024", label: "2024년" },
];

export const COMPARE_OPTIONS = [
  { value: "yoy", label: "전년 동기간(동월) 대비" },
  { value: "prev", label: "직전 기간 대비" },
];

export const CARBON_METRIC_OPTIONS = [
  { value: "total", label: "총 관광 탄소발자국" },
  { value: "per-capita", label: "관광객 1인당" },
  { value: "per-spend", label: "관광소비액당" },
];

export const SIDO_OPTIONS = [
  { value: "all", label: "전국" },
  { value: "gangwon", label: "강원특별자치도" },
  { value: "jeju", label: "제주특별자치도" },
  { value: "busan", label: "부산광역시" },
];

export const REGION_FILTER_OPTIONS = [
  { value: "all", label: "전국" },
  { value: "gangwon-gangneung", label: "강원특별자치도 강릉시" },
  { value: "jeju-jeju", label: "제주특별자치도 제주시" },
];

export {
  INDUSTRY_MAJOR_OPTIONS,
  INDUSTRY_MID_OPTIONS,
  getIndustryMidOptionsForMajor,
} from "@/lib/industry-classification";

export const INDUSTRY_FILTER_OPTIONS = [
  { value: "all", label: "전체 업종" },
  ...INDUSTRY_CLASSIFICATION.map((major) => ({
    value: major.value,
    label: major.label,
  })),
];
