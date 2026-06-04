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

export const CARBON_LEGEND_STOPS = [
  { min: 500_000, label: "500,000 이상", color: "#b91c1c" },
  { min: 200_000, label: "200,000 – 500,000", color: "#ea580c" },
  { min: 100_000, label: "100,000 – 200,000", color: "#fb923c" },
  { min: 50_000, label: "50,000 – 100,000", color: "#facc15" },
  { min: 20_000, label: "20,000 – 50,000", color: "#86efac" },
  { min: 0, label: "20,000 미만", color: "#22c55e" },
] as const;

export const MAP_NO_DATA_COLOR = "#d1d5db";

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
): FeatureCollection<Geometry, SigunguGeoProperties> {
  const features = collection.features.map((feature) => {
    const props = feature.properties ?? {};
    const code = String(props.code ?? "");
    const name = String(props.name ?? "");
    const co2 = mockCarbonForCode(code);

    return {
      ...feature,
      properties: {
        code,
        name,
        name_eng: props.name_eng ? String(props.name_eng) : undefined,
        base_year: props.base_year ? String(props.base_year) : undefined,
        co2,
        label: buildSigunguLabel(code, name),
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  } as FeatureCollection<Geometry, SigunguGeoProperties>;
}

/** MapLibre fill-color step expression (co2 property) */
export function buildCarbonFillColorExpression(): unknown[] {
  return [
    "step",
    ["get", "co2"],
    MAP_NO_DATA_COLOR,
    20_000,
    "#22c55e",
    50_000,
    "#86efac",
    100_000,
    "#facc15",
    200_000,
    "#fb923c",
    500_000,
    "#b91c1c",
  ];
}

export function formatCo2(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

let municipalitiesCache: Promise<
  FeatureCollection<Geometry, SigunguGeoProperties>
> | null = null;

export function loadMunicipalitiesGeoJson(): Promise<
  FeatureCollection<Geometry, SigunguGeoProperties>
> {
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
