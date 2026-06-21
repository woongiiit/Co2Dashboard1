export type AdminRegionRef = {
  sidoNm: string;
  sggNm: string;
};

export type AdminRevisionType =
  | "jurisdiction_transfer"
  | "split"
  | "merge_split";

export type AdminBoundaryRevision = {
  id: string;
  effectiveYm: string;
  type: AdminRevisionType;
  title: string;
  summary: string;
  scheduled?: boolean;
  from?: AdminRegionRef;
  to?: AdminRegionRef;
  stableRegionId?: string;
  parent?: AdminRegionRef;
  children?: AdminRegionRef[];
  fromUnits?: AdminRegionRef[];
  toUnits?: AdminRegionRef[];
};

export type AdminBoundaryRegistry = {
  formatVersion: number;
  description?: string;
  revisions: AdminBoundaryRevision[];
};

export type AdminBoundaryNotice = {
  id: string;
  effectiveYm: string;
  title: string;
  summary: string;
  scheduled?: boolean;
};

export type CompareReliability = {
  level: "ok" | "limited";
  reasons: string[];
};

export type TrendRevisionMarker = {
  ym: string;
  monthIndex: number;
  label: string;
};
