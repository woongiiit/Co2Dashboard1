import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import { getMidIndustryDefinitions } from "@/lib/industry-excel/excel-columns";
import { sumIndustryColumns } from "@/lib/industry-excel/shared";
import type { AiConsultingQuery } from "@/lib/ai-consulting/types";
import { rowMatchesRegionLabel } from "@/lib/region-excel/admin-boundary-registry";
import { isYmInRange } from "@/lib/region-excel/format";
import { loadRegionExcelRows } from "@/lib/region-excel/load-region-data";
import {
  parseRegionDetailQuery,
  queryRegionDetail,
} from "@/lib/region-excel/query-region-detail";
import { filterRowsPointInTime } from "@/lib/region-excel/resolve-admin-boundary";

export type AiConsultingMidIndustryItem = {
  label: string;
  majorLabel: string;
  value: string;
  share: string;
  tourismHint: string;
};

export type AiConsultingSigunguProfile = {
  sidoNm: string;
  comparison: Array<{ label: string; value: string; change: string }>;
  monthlyPeaks: string[];
};

/** 중분류 업종 → 관광 활동·동선 연결 힌트 (엑셀 컬럼명 기준, 수치 아님) */
const MID_INDUSTRY_TOURISM_HINTS: Record<string, string> = {
  육상운송: "시내·근교 버스/기차·도로 이동 중심 동선",
  항공운송: "공항·장거리 입출입 동선",
  수상운송: "항구·해안·섬·강 연계 수상·연안 이동",
  렌터카: "자가·렌터카 순환형 드라이브 코스",
  일반외식업: "향토 음식·시장·맛집 골목",
  제과음료업: "카페·베이커리·디저트 거리",
  호텔: "대형 숙박·관광 거점",
  "캠핑장/펜션": "자연·근교 숙박·캠핑",
  콘도: "리조트·콘도 단지 체류",
  기타숙박: "소형·특화 숙박",
  면세점: "쇼핑·면세 구매",
  대형쇼핑몰: "복합 쇼핑·실내 관광",
  레저용품쇼핑: "레저·아웃도어 쇼핑",
  기타관광쇼핑: "관광 기념품·특화 상점",
  카지노: "복합 레저·엔터테인먼트",
  관광유원시설: "테마파크·유원시설",
  골프장: "골프·리조트 레저",
  스키장: "겨울 스포츠·산악 레저",
  기타레저: "체험·액티비티",
  문화서비스: "박물관·공연·문화시설",
  의료관광: "의료·웰니스·검진",
  뷰티: "미용·스파·힐링",
  여행업: "패키지·여행사 동선",
};

function filterRowsForQuery(query: AiConsultingQuery) {
  const allRows = loadRegionExcelRows();
  return allRows.filter((row) => {
    if (!isYmInRange(row.ym, query.periodStart, query.periodEnd)) return false;
    if (query.scope === "sigungu") {
      return rowMatchesRegionLabel(row, query.regionLabel);
    }
    if (query.scope === "sido") {
      return row.sidoNm === query.regionLabel;
    }
    return true;
  });
}

export function buildMidIndustryTopItems(
  query: AiConsultingQuery,
  limit = 8,
): AiConsultingMidIndustryItem[] {
  const rows = filterRowsPointInTime(filterRowsForQuery(query));
  const mids = getMidIndustryDefinitions();

  const items = mids
    .map(({ label, column, majorLabel }) => ({
      label,
      majorLabel,
      value: Math.round(sumIndustryColumns(rows, [column])),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return [];

  return items.slice(0, limit).map((item) => ({
    label: item.label,
    majorLabel: item.majorLabel,
    value: item.value.toLocaleString("ko-KR"),
    share: `${((item.value / total) * 100).toFixed(1)}%`,
    tourismHint: MID_INDUSTRY_TOURISM_HINTS[item.label] ?? "지역 특화 관광 활동",
  }));
}

export function buildSigunguInsightProfile(
  query: AiConsultingQuery,
): AiConsultingSigunguProfile | null {
  if (query.scope !== "sigungu") return null;

  const detail = queryRegionDetail(
    parseRegionDetailQuery(
      new URLSearchParams({
        start: query.periodStart,
        end: query.periodEnd,
        compare: query.compare,
      }),
      query.regionLabel,
    ),
  );

  const monthlyPeaks: string[] = [];
  detail.monthlyTrend.selected.forEach((value, index) => {
    if (value == null || value <= 0) return;
    const isPeak = detail.monthlyTrend.selected.every(
      (other, otherIndex) =>
        otherIndex === index || other == null || value >= other,
    );
    if (isPeak) {
      monthlyPeaks.push(
        `${MONTH_LABELS[index]} 약 ${value.toLocaleString("ko-KR")} tCO₂eq`,
      );
    }
  });

  return {
    sidoNm: detail.sidoNm,
    comparison: detail.comparison.map((item) => ({
      label: item.label,
      value: item.value.toLocaleString("ko-KR"),
      change: `${item.changeDirection === "up" ? "▲" : "▼"} ${item.changePercent}%`,
    })),
    monthlyPeaks: monthlyPeaks.slice(0, 3),
  };
}
