import type { AiConsultingQuery } from "@/lib/ai-consulting/types";
import { loadPoiRecords } from "@/lib/poi/load-poi-data";
import type {
  PoiInsightItem,
  PoiInsightProfile,
  PoiRecord,
} from "@/lib/poi/types";

const MAX_TOP_POIS = 8;
const MAX_MAJOR_SHARES = 5;

/** 카드 중분류 ↔ POI 대분류(lcls) 느슨한 매핑 */
const MID_TO_POI_MAJORS: Record<string, string[]> = {
  육상운송: ["자연관광", "역사관광", "문화관광", "체험관광"],
  항공운송: ["자연관광", "문화관광", "숙박"],
  수상운송: ["자연관광", "체험관광"],
  렌터카: ["자연관광", "역사관광", "문화관광", "레저스포츠"],
  일반외식업: ["음식", "쇼핑", "문화관광"],
  제과음료업: ["음식", "쇼핑", "문화관광"],
  호텔: ["숙박"],
  "캠핑장/펜션": ["숙박", "자연관광", "레저스포츠"],
  콘도: ["숙박"],
  기타숙박: ["숙박"],
  면세점: ["쇼핑"],
  대형쇼핑몰: ["쇼핑"],
  레저용품쇼핑: ["쇼핑", "레저스포츠"],
  기타관광쇼핑: ["쇼핑", "문화관광"],
  카지노: ["레저스포츠", "문화관광"],
  관광유원시설: ["문화관광", "레저스포츠", "체험관광"],
  골프장: ["레저스포츠"],
  스키장: ["레저스포츠", "자연관광"],
  기타레저: ["레저스포츠", "체험관광", "자연관광"],
  문화서비스: ["문화관광", "역사관광"],
  의료관광: ["체험관광", "문화관광"],
  뷰티: ["체험관광", "쇼핑"],
  여행업: ["역사관광", "문화관광", "자연관광", "체험관광"],
};

function formatVisitors(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}백만`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 10_000)}만`;
  }
  return value.toLocaleString("ko-KR");
}

function toInsightItem(poi: PoiRecord): PoiInsightItem {
  return {
    name: poi.nm,
    sido: poi.sido,
    sgg: poi.sgg,
    major: poi.lcls,
    mid: poi.mcls,
    visitors: formatVisitors(poi.v),
    emission: `${Math.round(poi.e).toLocaleString("ko-KR")} tCO₂e`,
    perCapita: `${poi.pc.toFixed(2)} kgCO₂e/인`,
  };
}

function parseRegionParts(regionLabel: string): {
  sido?: string;
  sgg?: string;
} {
  const trimmed = regionLabel.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed === "전국") return {};
  const parts = trimmed.split(" ");
  if (parts.length === 1) {
    return { sido: parts[0] };
  }
  return { sido: parts[0], sgg: parts.slice(1).join(" ") };
}

function filterPoisForQuery(query: AiConsultingQuery): PoiRecord[] {
  const all = loadPoiRecords();
  if (all.length === 0) return [];

  if (query.scope === "sigungu") {
    const { sido, sgg } = parseRegionParts(query.regionLabel);
    return all.filter((poi) => {
      if (sido && poi.sido !== sido) return false;
      if (sgg && poi.sgg !== sgg) return false;
      // 라벨이 "제주시"만인 경우 등
      if (!sido && sgg) return poi.sgg === sgg;
      if (sido && !sgg) {
        return (
          poi.sido === sido ||
          `${poi.sido} ${poi.sgg}` === query.regionLabel ||
          poi.sgg === query.regionLabel
        );
      }
      return true;
    });
  }

  if (query.scope === "sido") {
    return all.filter((poi) => poi.sido === query.regionLabel);
  }

  return all;
}

/**
 * 전국 스코프: 시도별로 상위 1곳씩 뽑아 지역 다양성 확보 후 방문 순 정렬.
 */
function pickNationalDiverseTop(pois: PoiRecord[], limit: number): PoiRecord[] {
  const bySido = new Map<string, PoiRecord[]>();
  for (const poi of pois) {
    const list = bySido.get(poi.sido) ?? [];
    list.push(poi);
    bySido.set(poi.sido, list);
  }

  for (const list of bySido.values()) {
    list.sort((a, b) => b.v - a.v);
  }

  const picked: PoiRecord[] = [];
  const sidoOrder = [...bySido.entries()].sort(
    (a, b) => (b[1][0]?.v ?? 0) - (a[1][0]?.v ?? 0),
  );

  for (const [, list] of sidoOrder) {
    if (list[0]) picked.push(list[0]);
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    const used = new Set(picked.map((p) => p.id));
    const rest = pois
      .filter((p) => !used.has(p.id))
      .sort((a, b) => b.v - a.v);
    for (const poi of rest) {
      picked.push(poi);
      if (picked.length >= limit) break;
    }
  }

  return picked.sort((a, b) => b.v - a.v).slice(0, limit);
}

function buildMajorShares(
  pois: PoiRecord[],
): Array<{ name: string; count: number; share: string }> {
  const counts = new Map<string, number>();
  for (const poi of pois) {
    if (!poi.lcls) continue;
    counts.set(poi.lcls, (counts.get(poi.lcls) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_MAJOR_SHARES)
    .map(([name, count]) => ({
      name,
      count,
      share: `${((count / total) * 100).toFixed(1)}%`,
    }));
}

export function buildPoiInsightProfile(
  query: AiConsultingQuery,
  limit = MAX_TOP_POIS,
): PoiInsightProfile | null {
  const filtered = filterPoisForQuery(query);
  if (filtered.length === 0) return null;

  const topSource =
    query.scope === "national"
      ? pickNationalDiverseTop(filtered, limit)
      : [...filtered].sort((a, b) => b.v - a.v).slice(0, limit);

  const topPois = topSource.map(toInsightItem);
  const placeNames = topPois.map((item) => item.name);

  return {
    scopeLabel: query.regionLabel,
    totalCount: filtered.length,
    topPois,
    majorShares: buildMajorShares(filtered),
    placeNames,
  };
}

/** 중분류 업종에 맞는 POI 이름 힌트 (최대 2개) */
export function relatedPoiNamesForMidIndustry(
  midLabel: string,
  poiProfile: PoiInsightProfile | null,
  limit = 2,
): string[] {
  if (!poiProfile || poiProfile.topPois.length === 0) return [];

  const majors = MID_TO_POI_MAJORS[midLabel];
  if (majors && majors.length > 0) {
    const matched = poiProfile.topPois
      .filter((poi) => majors.includes(poi.major))
      .map((poi) => poi.name);
    if (matched.length > 0) return matched.slice(0, limit);
  }

  return poiProfile.topPois.slice(0, limit).map((poi) => poi.name);
}

export function formatPoiInsightProfileForPrompt(
  profile: PoiInsightProfile | null | undefined,
): string {
  if (!profile || profile.topPois.length === 0) {
    return `## 지역 POI (내부 DB)
- 해당 범위 POI 데이터 없음. 웹 검색 지명·엑셀 업종 힌트만 사용하세요.`;
  }

  const poiLines = profile.topPois
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} (${item.major}/${item.mid}, ${item.sgg}) — 방문 ${item.visitors}, 배출 ${item.emission}, 1인당 ${item.perCapita}`,
    )
    .join("\n");

  const majorLines =
    profile.majorShares.length > 0
      ? profile.majorShares
          .map((item) => `- ${item.name}: ${item.count}곳 (${item.share})`)
          .join("\n")
      : "- 유형 분포 없음";

  return `## 지역 POI (내부 DB — 관광명소·코스 근거)
범위: ${profile.scopeLabel} · POI ${profile.totalCount.toLocaleString("ko-KR")}곳
### 대표 POI Top ${profile.topPois.length} (방문자 기준)
${poiLines}

### 관광유형 분포
${majorLines}

규칙:
- **관광명소·지명**은 위 POI명과 웹 검색 지명 후보를 우선 사용하세요.
- POI의 배출·1인당 수치는 참고용이며, 시군구 KPI·업종 배출 비율과 혼동하지 마세요.`;
}
