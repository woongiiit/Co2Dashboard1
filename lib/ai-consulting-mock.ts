/** AI 컨설팅 페이지 mock 콘텐츠 */

export const REGIONAL_EVALUATION_POINTS = [
  "제주특별자치도 제주시는 관광 탄소발자국이 전국 1위로 높은 수준이며, 특히 숙박·교통 분야의 배출 비중이 큽니다.",
  "최근 3년간 관광 수요 증가로 탄소배출이 꾸준히 증가하였으며, 지속 가능한 관광 전환이 시급합니다.",
  "숙박업·교통(항공·렌터카·버스)이 전체 배출의 70% 이상을 차지하고 있어 핵심 관리가 필요합니다.",
  "동일 기간 전국 평균 대비 배출 집중도가 높아, 구조적 저감 전략이 우선되어야 합니다.",
] as const;

export type SectorEmissionItem = {
  name: string;
  value: number;
  share: number;
};

export const SECTOR_EMISSION_ITEMS: SectorEmissionItem[] = [
  { name: "운송업", value: 195_420, share: 31.9 },
  { name: "숙박업", value: 175_280, share: 28.6 },
  { name: "여가서비스업", value: 112_640, share: 18.4 },
  { name: "식음료업", value: 74_110, share: 12.1 },
  { name: "쇼핑업", value: 31_820, share: 5.2 },
  { name: "의료웰니스업", value: 12_850, share: 2.1 },
  { name: "기타", value: 10_397, share: 1.7 },
];

export type TravelerGuideItem = {
  id: string;
  title: string;
  description: string;
};

export const TRAVELER_GUIDE_ITEMS: TravelerGuideItem[] = [
  {
    id: "transport",
    title: "이동 · 교통",
    description:
      "직항보다 경유·대중교통을 활용하고, 렌터카 대신 대중교통·카셰어링을 이용해보세요.",
  },
  {
    id: "lodging",
    title: "숙박",
    description:
      "친환경 인증 숙소, 에너지 절약형 숙소 이용으로 탄소배출을 줄일 수 있어요.",
  },
  {
    id: "food",
    title: "식음 · 쇼핑",
    description:
      "지역 농수산물·제철 식재료 선택으로 운송 배출을 줄이고 지역경제도 살립니다.",
  },
  {
    id: "waste",
    title: "자원 · 폐기물",
    description:
      "텀블러·다회용기 사용, 일회용품 줄이기로 여행의 흔적을 줄여요.",
  },
  {
    id: "activity",
    title: "체험 · 활동",
    description:
      "도보·자전거 관광, 저배출 체험 프로그램을 선택해 현지에서의 탄소발자국을 낮춰보세요.",
  },
];

export const GOVERNMENT_CONSULTING_POINTS = [
  "숙박업 에너지 효율 개선과 친환경 설비 지원을 확대하세요.",
  "렌터카·버스 전기차 전환, 충전 인프라 확충을 단계적으로 추진하세요.",
  "항공 수요 관리 및 탄소 상쇄 프로그램을 도입해 관광 탄소 감축을 유도하세요.",
  "데이터 기반 관광 탄소 모니터링 체계를 구축해 성과를 지속 관리하세요.",
  "관광객 대상 저탄소 이동·숙박 인센티브를 연계해 수요 전환을 유도하세요.",
  "지자체·업종·지역 간 협력 거버넌스를 통해 감축 목표를 단계적으로 이행하세요.",
] as const;

export const COMPARISON_RADAR_INDICATORS = [
  "총 배출량",
  "1인당 배출",
  "산업 집중도",
  "증가 추세",
  "감축 잠재력",
] as const;

export const COMPARISON_RADAR_SERIES = {
  region: [92, 88, 95, 82, 74],
  national: [50, 50, 50, 50, 50],
} as const;

export type PriorityActionTask = {
  id: "short" | "mid" | "long";
  label: string;
  items: readonly string[];
};

export const PRIORITY_ACTION_TASKS: PriorityActionTask[] = [
  {
    id: "short",
    label: "단기 (~ 1년)",
    items: [
      "친환경 숙소·맛집 인증 확대",
      "대중교통·카셰어링 이용 혜택 제공",
      "관광객 대상 저탄소 행동 캠페인 운영",
    ],
  },
  {
    id: "mid",
    label: "중기 (1 ~ 3년)",
    items: [
      "렌터카·버스 전기차 전환 지원",
      "숙박업체 에너지 효율 개선 사업 지원",
      "관광 탄소 모니터링 대시보드 고도화",
    ],
  },
  {
    id: "long",
    label: "장기 (3년 ~)",
    items: [
      "관광 전 분야 탄소중립 로드맵 수립·이행",
      "재생에너지 기반 관광 인프라 구축",
      "탄소중립 관광 브랜드·인증 체계 정착",
    ],
  },
];

export const ONE_LINE_RECOMMENDATION =
  "숙박·교통 분야의 구조적 전환과 데이터 기반 관리가 제주특별자치도 제주시 관광 탄소중립의 핵심입니다.";
