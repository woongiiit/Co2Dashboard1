import type { Feature, FeatureCollection, Geometry } from "geojson";

/** KOSTAT 2013 시군구 코드 앞 2자리 → 시도 명칭 */
const SIDO_BY_CODE_PREFIX: Record<string, string> = {
  "11": "서울특별시",
  "21": "부산광역시",
  "22": "대구광역시",
  "23": "인천광역시",
  "24": "광주광역시",
  "25": "대전광역시",
  "26": "울산광역시",
  "29": "세종특별자치시",
  "31": "경기도",
  "32": "강원특별자치도",
  "33": "충청북도",
  "34": "충청남도",
  "35": "전북특별자치도",
  "36": "전라남도",
  "37": "경상북도",
  "38": "경상남도",
  "39": "제주특별자치도",
};

export type SigunguGeoProperties = {
  code: string;
  name: string;
  name_eng?: string;
  base_year?: string;
  co2: number;
  label: string;
};

export type SigunguGeoFeature = Feature<Geometry, SigunguGeoProperties>;

export const MAP_NO_DATA_COLOR = "#d1d5db";

/** 파란색 단일 계열 — 값이 클수록 진한 톤 */
export const CARBON_BLUE_TONES = [
  "#dbeafe",
  "#bfdbfe",
  "#60a5fa",
  "#2563eb",
  "#1e3a8a",
] as const;

/** 권장 범례 임계치 (tCO₂eq) — 2~5구간 하한값 */
export const CARBON_MAP_THRESHOLDS = [
  700_000,
  2_000_000,
  4_700_000,
  8_200_000,
] as const;

export const CARBON_LEGEND_STOPS = [
  {
    min: 0,
    label: "0 – 700,000",
    color: CARBON_BLUE_TONES[0],
  },
  {
    min: CARBON_MAP_THRESHOLDS[0],
    label: "700,000 – 2,000,000",
    color: CARBON_BLUE_TONES[1],
  },
  {
    min: CARBON_MAP_THRESHOLDS[1],
    label: "2,000,000 – 4,700,000",
    color: CARBON_BLUE_TONES[2],
  },
  {
    min: CARBON_MAP_THRESHOLDS[2],
    label: "4,700,000 – 8,200,000",
    color: CARBON_BLUE_TONES[3],
  },
  {
    min: CARBON_MAP_THRESHOLDS[3],
    label: "8,200,000 이상",
    color: CARBON_BLUE_TONES[4],
  },
];

export const DEFAULT_MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  "https://demotiles.maplibre.org/style.json";

export const MUNICIPALITIES_GEOJSON_URL = "/data/skorea-municipalities.geojson";

export function getSidoNameFromCode(code: string): string | undefined {
  return SIDO_BY_CODE_PREFIX[code.slice(0, 2)];
}

/** 시도 + 시군구 명칭 (네비게이션·필터와 동일 형식) */
export function buildSigunguLabel(code: string, sigunguName: string): string {
  const sido = getSidoNameFromCode(code);
  if (!sido) return sigunguName;
  if (sido === "세종특별자치시") return sido;
  return `${sido} ${sigunguName}`;
}

/** API 연동 전: 코드 기반 결정론적 mock tCO₂eq */
export function mockCarbonForCode(code: string): number {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  }
  const normalized = (hash % 10_000) / 10_000;
  if (normalized < 0.08) return 520_000 + (hash % 90_000);
  if (normalized < 0.18) return 280_000 + (hash % 180_000);
  if (normalized < 0.32) return 120_000 + (hash % 90_000);
  if (normalized < 0.48) return 55_000 + (hash % 50_000);
  if (normalized < 0.65) return 22_000 + (hash % 30_000);
  return 5_000 + (hash % 18_000);
}

export function enrichMunicipalitiesGeoJson(
  collection: FeatureCollection,
  co2ByLabel?: Record<string, number>,
): FeatureCollection<Geometry, SigunguGeoProperties> {
  const features = collection.features.map((feature) => {
    const props = feature.properties ?? {};
    const code = String(props.code ?? "");
    const name = String(props.name ?? "");
    const label = buildSigunguLabel(code, name);
    const co2 =
      co2ByLabel != null ? (co2ByLabel[label] ?? 0) : mockCarbonForCode(code);

    return {
      ...feature,
      properties: {
        code,
        name,
        name_eng: props.name_eng ? String(props.name_eng) : undefined,
        base_year: props.base_year ? String(props.base_year) : undefined,
        co2,
        label,
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  } as FeatureCollection<Geometry, SigunguGeoProperties>;
}

/** MapLibre fill-color — co2=0은 데이터 없음, 그 외 권장 5단계 파란 톤 */
export function buildCarbonFillColorExpression(): unknown[] {
  return [
    "case",
    ["==", ["get", "co2"], 0],
    MAP_NO_DATA_COLOR,
    [
      "step",
      ["get", "co2"],
      CARBON_BLUE_TONES[0],
      CARBON_MAP_THRESHOLDS[0],
      CARBON_BLUE_TONES[1],
      CARBON_MAP_THRESHOLDS[1],
      CARBON_BLUE_TONES[2],
      CARBON_MAP_THRESHOLDS[2],
      CARBON_BLUE_TONES[3],
      CARBON_MAP_THRESHOLDS[3],
      CARBON_BLUE_TONES[4],
    ],
  ];
}

/** @deprecated 고정 범례 사용 — CARBON_LEGEND_STOPS 반환 */
export function buildLegendStopsFromMax(_maxCo2?: number) {
  return [...CARBON_LEGEND_STOPS];
}

export function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

let municipalitiesCache: Promise<
  FeatureCollection<Geometry, SigunguGeoProperties>
> | null = null;

export function loadMunicipalitiesGeoJson(
  co2ByLabel?: Record<string, number>,
): Promise<FeatureCollection<Geometry, SigunguGeoProperties>> {
  if (!co2ByLabel) {
    if (!municipalitiesCache) {
      municipalitiesCache = fetch(MUNICIPALITIES_GEOJSON_URL)
        .then((res) => {
          if (!res.ok) throw new Error(`GeoJSON 로드 실패 (${res.status})`);
          return res.json();
        })
        .then((raw) => enrichMunicipalitiesGeoJson(raw));
    }
    return municipalitiesCache;
  }

  return fetch(MUNICIPALITIES_GEOJSON_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`GeoJSON 로드 실패 (${res.status})`);
      return res.json();
    })
    .then((raw) => enrichMunicipalitiesGeoJson(raw, co2ByLabel));
}

type LngLatBoundsLike = [[number, number], [number, number]];

export function getGeometryBounds(geometry: Geometry): LngLatBoundsLike | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const extendCoord = (coord: number[]) => {
    const [lng, lat] = coord;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  };

  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      for (const coord of ring) extendCoord(coord);
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) extendCoord(coord);
      }
    }
  } else {
    return null;
  }

  if (!Number.isFinite(minLng)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function findSigunguFeatureByLabel(
  features: SigunguGeoFeature[],
  regionLabel: string,
): SigunguGeoFeature | undefined {
  const normalized = regionLabel.replace(/\s+/g, " ").trim();
  const exact = features.find((f) => f.properties.label === normalized);
  if (exact) return exact;

  const sigunguName = normalized.split(" ").at(-1);
  if (!sigunguName) return undefined;

  return features.find((feature) => {
    if (feature.properties.name !== sigunguName) return false;
    return normalized === feature.properties.label || normalized.endsWith(sigunguName);
  });
}
