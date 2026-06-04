/** Temporary mock data for region detail dashboard wireframe. */

export type IndustryShareItem = {
  name: string;
  value: number;
  share: number;
};

export const REGION_INDUSTRY_COMPOSITION: IndustryShareItem[] = [
  { name: "숙박업", value: 128_364, share: 31.1 },
  { name: "음식점업", value: 96_287, share: 23.3 },
  { name: "교통업", value: 82_415, share: 20.0 },
  { name: "여가·오락·문화업", value: 54_782, share: 13.3 },
  { name: "도소매업", value: 28_694, share: 6.9 },
  { name: "기타 업종", value: 22_333, share: 5.4 },
];

export type ComparisonItem = {
  label: string;
  value: number;
  changePercent: number;
  changeDirection: "up" | "down";
};

export const REGION_COMPARISON_ITEMS: ComparisonItem[] = [
  { label: "전국 평균", value: 312_641, changePercent: 32.1, changeDirection: "up" },
  { label: "강원도 평균", value: 368_552, changePercent: 12.0, changeDirection: "up" },
  { label: "유사 지역 평균", value: 445_870, changePercent: 7.4, changeDirection: "down" },
];

export const REGION_TOP_INDUSTRY_ROWS = [
  { rank: 1, name: "숙박업", value: "128,364", share: "31.1%" },
  { rank: 2, name: "음식점업", value: "96,287", share: "23.3%" },
  { rank: 3, name: "교통업", value: "82,415", share: "20.0%" },
  { rank: 4, name: "여가·오락·문화업", value: "54,782", share: "13.3%" },
  { rank: 5, name: "도소매업", value: "28,694", share: "6.9%" },
  { rank: 6, name: "교육서비스업", value: "12,614", share: "3.1%" },
  { rank: 7, name: "기타 서비스업", value: "9,719", share: "2.3%" },
];
