/** Temporary mock data for wireframe UI only. */

import type { KpiIconVariant } from "@/components/dashboard/KpiIcon";
import { getAiConsultingKpiIconSrc } from "@/lib/ai-consulting-kpi-icons";
import { getIndustryKpiIconSrc } from "@/lib/industry-kpi-icons";
import { getRegionDetailKpiIconSrc } from "@/lib/region-detail-kpi-icons";
import { getRegionKpiIconSrc } from "@/lib/region-kpi-icons";

export type KpiItem = {
  label: string;
  value: string;
  unit?: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  hint?: string;
  icon?: KpiIconVariant;
  /** PNG under public/images/{industry|region|region-detail}/kpi/ */
  iconSrc?: string;
  /** Unit shown under label, e.g. (tCO₂eq) */
  unitOnLabel?: boolean;
  /** Unit beside main value (e.g. %) */
  unitOnValue?: boolean;
  /** Main value uses up/down accent (e.g. 전년 대비 증감률) */
  valueTone?: "up" | "down" | "neutral";
};

export const MOCK_PERIOD = "2023.01 ~ 2026.04";

export const REGION_KPI: KpiItem[] = [
  {
    label: "총 관광 탄소발자국",
    value: "18,732,341",
    unit: "tCO₂eq",
    change: "8.7%",
    changeDirection: "up",
    hint: "전년 동기간 대비",
    icon: "region-total-carbon",
    iconSrc: getRegionKpiIconSrc("region-total-carbon"),
  },
  {
    label: "관광객 1인당 탄소발자국",
    value: "0.621",
    unit: "kgCO₂eq/인",
    change: "2.6%",
    changeDirection: "down",
    hint: "전년 동기간 대비",
    icon: "region-per-capita",
    iconSrc: getRegionKpiIconSrc("region-per-capita"),
  },
  {
    label: "관광소비액당 탄소발자국",
    value: "0.78",
    unit: "kgCO₂eq/만원",
    change: "1.8%",
    changeDirection: "up",
    hint: "전년 동기간 대비",
    icon: "region-spend-intensity",
    iconSrc: getRegionKpiIconSrc("region-spend-intensity"),
  },
  {
    label: "상위 20% 시군구 비중",
    value: "28.6",
    unit: "%",
    change: "2.1%p",
    changeDirection: "up",
    hint: "전년 동기간 대비",
    icon: "region-top-share",
    iconSrc: getRegionKpiIconSrc("region-top-share"),
  },
  {
    label: "우선관리 지역 수",
    value: "45",
    unit: "개",
    change: "3",
    changeDirection: "up",
    hint: "전년 동기간 대비",
    icon: "region-priority",
    iconSrc: getRegionKpiIconSrc("region-priority"),
  },
];

export const REGION_DETAIL_KPI: KpiItem[] = [
  {
    label: "선택 지역 총 탄소발자국",
    value: "412,875",
    unit: "tCO₂eq",
    change: "9.4%",
    changeDirection: "up",
    hint: "전년 동기간 대비",
    icon: "detail-region-carbon",
    iconSrc: getRegionDetailKpiIconSrc("detail-region-carbon"),
  },
  {
    label: "전국 순위",
    value: "28",
    unit: "위",
    hint: "250개 시군구 중",
    icon: "detail-national-rank",
    iconSrc: getRegionDetailKpiIconSrc("detail-national-rank"),
  },
  {
    label: "시도 내 순위",
    value: "3",
    unit: "위",
    hint: "강원도 18개 시군구 중",
    icon: "detail-sido-rank",
    iconSrc: getRegionDetailKpiIconSrc("detail-sido-rank"),
  },
  {
    label: "관광소비액당 탄소발자국",
    value: "0.82",
    unit: "kgCO₂eq/만원",
    change: "0.07",
    changeDirection: "up",
    hint: "전년 동기간 대비",
    icon: "detail-spend-intensity",
    iconSrc: getRegionDetailKpiIconSrc("detail-spend-intensity"),
  },
];

export const INDUSTRY_KPI: KpiItem[] = [
  {
    label: "선택 업종 탄소발자국",
    value: "2,987,711",
    unit: "tCO₂eq",
    hint: "전체 기간 합계",
    icon: "industry-carbon",
    iconSrc: getIndustryKpiIconSrc("industry-carbon"),
  },
  {
    label: "전체 대비 비중",
    value: "16.2",
    unit: "%",
    change: "2.1%p",
    changeDirection: "up",
    hint: "전 기간 대비",
    icon: "share-pie",
    iconSrc: getIndustryKpiIconSrc("share-pie"),
  },
  {
    label: "관광소비액",
    value: "5,842,536",
    unit: "백만원",
    hint: "전 기간 합계",
    icon: "tourism-spend",
    iconSrc: getIndustryKpiIconSrc("tourism-spend"),
  },
  {
    label: "소비액당 탄소발자국",
    value: "511.2",
    unit: "kgCO₂eq/백만원",
    hint: "전 기간 평균",
    icon: "carbon-intensity",
    iconSrc: getIndustryKpiIconSrc("carbon-intensity"),
  },
  {
    label: "전년 대비 증감률",
    value: "7.6",
    unit: "%",
    changeDirection: "up",
    valueTone: "up",
    hint: "전년 동기간 대비",
    icon: "yoy-trend",
    iconSrc: getIndustryKpiIconSrc("yoy-trend"),
  },
];

export const AI_CONSULTING_KPI: KpiItem[] = [
  {
    label: "선택 지역 총 관광 탄소발자국",
    value: "612,517",
    unit: "(tCO₂eq)",
    unitOnLabel: true,
    hint: "선택 기간 총합",
    icon: "ai-total-carbon",
    iconSrc: getAiConsultingKpiIconSrc("ai-total-carbon"),
  },
  {
    label: "전국 시군구 순위 (Top 10)",
    value: "1위 / 250개",
    hint: "전국 시군구 중",
    icon: "ai-national-rank",
    iconSrc: getAiConsultingKpiIconSrc("ai-national-rank"),
  },
  {
    label: "주요 배출 산업",
    value: "숙박업",
    hint: "(28.6%)",
    icon: "ai-major-industry",
    iconSrc: getAiConsultingKpiIconSrc("ai-major-industry"),
  },
  {
    label: "최근 3년 추이",
    value: "9.2",
    unit: "%",
    valueTone: "up",
    hint: "전년 동기간 대비",
    icon: "ai-trend",
    iconSrc: getAiConsultingKpiIconSrc("ai-trend"),
  },
];

export type TableRow = {
  rank: number;
  name: string;
  value: string;
  change?: string;
};

export const REGION_RANKING_ROWS: TableRow[] = [
  { rank: 1, name: "제주특별자치도 제주시", value: "612,517", change: "9.2%" },
  { rank: 2, name: "강원특별자치도 강릉시", value: "465,332", change: "7.5%" },
  { rank: 3, name: "부산광역시 해운대구", value: "412,373", change: "6.1%" },
  { rank: 4, name: "서울특별시 용산구", value: "401,982", change: "8.0%" },
  { rank: 5, name: "경기도 성남시 분당구", value: "366,141", change: "5.6%" },
];

export const INDUSTRY_RANKING_ROWS: TableRow[] = [
  { rank: 1, name: "항공운송", value: "3,842,116", change: "20.8%" },
  { rank: 2, name: "육상운송", value: "1,635,274", change: "8.8%" },
  { rank: 3, name: "숙박업(호텔)", value: "1,402,331", change: "7.6%" },
  { rank: 4, name: "기타레저", value: "1,128,742", change: "6.1%" },
  { rank: 5, name: "일반외식업", value: "1,103,221", change: "6.0%" },
];
