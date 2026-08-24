export type PoiRecord = {
  id: string;
  nm: string;
  sido: string;
  sgg: string;
  /** 대분류 */
  lcls: string;
  /** 중분류 */
  mcls: string;
  scls: string;
  /** 총 방문자수 */
  v: number;
  /** 총 탄소배출량 (tCO₂e) */
  e: number;
  /** 1인당 배출계수 (kgCO₂e/인) */
  pc: number;
};

export type PoiInsightItem = {
  name: string;
  sido: string;
  sgg: string;
  major: string;
  mid: string;
  visitors: string;
  emission: string;
  perCapita: string;
};

export type PoiInsightProfile = {
  scopeLabel: string;
  totalCount: number;
  topPois: PoiInsightItem[];
  majorShares: Array<{ name: string; count: number; share: string }>;
  placeNames: string[];
};
