import { MONTH_LABELS } from "@/lib/charts/monthly-carbon-trend-data";
import { INDUSTRY_CLASSIFICATION } from "@/lib/industry-classification";
import type {
  IndustryDashboardData,
  IndustryDashboardQuery,
} from "@/lib/industry-excel/types";
import { formatIndustryScopeLabel } from "@/lib/industry-excel/shared";
import { formatDecimal, formatInteger, formatScaledCarbonMass } from "@/lib/region-excel/format";

// ─────────────────────────────────────────────────────────────
// 업종별 탄소 배출 원인·특성 힌트 (중분류)
// ─────────────────────────────────────────────────────────────
const MID_INDUSTRY_CARBON_HINT: Record<string, string> = {
  육상운송: "버스·열차·도로 이동량 직결 — 대중교통 전환·적재 효율이 핵심 감축 레버",
  항공운송: "비행 거리·탑승률 의존 — 저탄소 기재 도입·국내선 대체 수단 전환 필요",
  수상운송: "항로 거리·선박 연료 타입 — LNG·하이브리드 선박 전환 여부가 관건",
  렌터카: "자가용 대비 배출 절감 가능 — EV 전환율·주행 거리가 좌우",
  일반외식업: "식자재 조달·냉장 에너지·조리 LPG — 로컬 식재료 비율이 감축 포인트",
  제과음료업: "포장·냉장 물류 비중 높음 — 단거리 배송·포장 최소화 효과적",
  호텔: "객실 냉난방·세탁 에너지 집약 — 그린 인증·재생에너지 도입으로 대폭 절감 가능",
  "캠핑장/펜션": "자연 입지 특성상 에너지 비효율 다수 — 태양광·빗물 재활용 시 효과적",
  콘도: "장박·가족 단위 체류로 에너지 총량 큼 — 스마트 미터링 도입 효과 높음",
  기타숙박: "소규모 분산 시설 — 에너지 진단 및 공동 구매 지원 필요",
  면세점: "대형 냉난방·조명 집약 — LED·자동화 절감 여력 있음",
  대형쇼핑몰: "상시 냉난방·대형 냉장 진열 — 에너지 절감 인프라 ROI 높음",
  레저용품쇼핑: "중소형 점포 위주 — 전력 계약 최적화 기회",
  기타관광쇼핑: "다품종 소량 물류 — 공동 배송·로컬 생산 연계 가능",
  카지노: "야간 연장 운영·대규모 냉난방 — 심야 에너지 계약 개선 여지",
  관광유원시설: "어트랙션·조명 전력 집중 — 운영 시간대 최적화·LED 전환 효과적",
  골프장: "광대한 잔디 관개·카트 운행 — 빗물 재활용·전동카트 전환이 주요 감축",
  스키장: "제설기·곤돌라 전력 집중 — 재생에너지 PPA 도입 사례 증가",
  기타레저: "액티비티 다양 — 체험 프로그램 탄소 라벨링으로 관광객 인식 제고",
  문화서비스: "시설 냉난방·전시 조명 — 리노베이션 단계에서 제로에너지 설계 적용 가능",
  의료관광: "의료 장비 전력·폐기물 — 의료 폐기물 관리 체계와 연계 감축",
  뷰티: "온수·화학재료 사용 집중 — 저탄소 재료 전환·보일러 효율 개선이 관건",
  여행업: "패키지 운송·숙박 간접 배출 — 저탄소 공급업체 선별 기준 마련 필요",
};

// ─────────────────────────────────────────────────────────────
// Context 타입
// ─────────────────────────────────────────────────────────────
export type IndustryInsightContext = {
  scopeLabel: string;
  scopeType: "sigungu" | "sido" | "national";
  periodLabel: string;
  compareMode: string;
  industryLabel: string;
  industryScope: "mid" | "major" | "all";

  // KPI 핵심 수치
  selectedCarbon: string;
  selectedCarbonRaw: number;
  selectedChange: string;
  selectedChangeDirection: "up" | "down" | "neutral";
  totalCarbon: string;
  shareOfTotal: string;
  avgIndex: string;
  avgIndexChange: string;
  yoyChangeText: string;

  // 구성 분석
  dominantMajor: { name: string; share: string; value: string } | null;
  top3Mid: Array<{ name: string; share: string; value: string; hint: string }>;
  midTop3Share: string;

  // 월별 피크
  monthlyPeaks: string[];

  // 비교 신뢰도
  reliabilityLevel: string;
  boundaryWarnings: string[];
};

// ─────────────────────────────────────────────────────────────
// Context 빌더
// ─────────────────────────────────────────────────────────────
export function buildIndustryInsightContext(
  query: IndustryDashboardQuery,
  data: IndustryDashboardData,
): IndustryInsightContext {
  const compareMode =
    query.compare === "prev" ? "직전 동일 기간 대비" : "전년 동기간 대비";

  const major = INDUSTRY_CLASSIFICATION.find((item) => item.value === query.majorCode);
  const mid = major?.mid.find((item) => item.value === query.midCode);

  let industryLabel: string;
  let industryScope: "mid" | "major" | "all";
  if (query.midCode !== "all") {
    industryLabel = mid?.label ?? "선택 중분류";
    industryScope = "mid";
  } else if (query.majorCode !== "all") {
    industryLabel = major?.label ?? "선택 대분류";
    industryScope = "major";
  } else {
    industryLabel = "전체 업종";
    industryScope = "all";
  }

  let scopeType: "sigungu" | "sido" | "national";
  if (query.regionLabel !== "all") scopeType = "sigungu";
  else if (query.sidoCode !== "all") scopeType = "sido";
  else scopeType = "national";

  // KPI 값 추출
  const selectedKpi = data.kpi.find((k) => k.label === "선택 업종 탄소발자국");
  const totalKpi = data.kpi.find((k) => k.label === "범위 내 총 탄소발자국");
  const shareKpi = data.kpi.find((k) => k.label === "전체 대비 비중");
  const indexKpi = data.kpi.find((k) => k.label === "평균 탄소발자국 지수");
  const yoyKpi = data.kpi.find((k) => k.label === "전년 대비 증감률");

  const selectedCarbonRaw = selectedKpi?.carbonTco2eq ?? 0;

  // 지배적 대분류 (비중 최고)
  const sortedMajor = [...data.majorIndustries].sort((a, b) => b.share - a.share);
  const top1Major = sortedMajor[0];
  const dominantMajor = top1Major
    ? {
        name: top1Major.name,
        share: `${formatDecimal(top1Major.share, 1)}%`,
        value: formatInteger(top1Major.value),
      }
    : null;

  // 중분류 Top 3 + 탄소 힌트
  const top3Mid = data.midRanking.slice(0, 3).map((item) => ({
    name: item.name,
    share: item.change ?? "—",
    value: item.value,
    hint: MID_INDUSTRY_CARBON_HINT[item.name] ?? "",
  }));
  const top3MidShareSum = data.midRanking
    .slice(0, 3)
    .reduce((sum, item) => {
      const pct = parseFloat((item.change ?? "0").replace("%", ""));
      return sum + (isNaN(pct) ? 0 : pct);
    }, 0);

  // 월별 피크 (2026 최근 데이터 기준)
  const monthlyPeaks = extractMonthlyPeaks(data);

  return {
    scopeLabel: formatIndustryScopeLabel(query),
    scopeType,
    periodLabel: data.periodLabel,
    compareMode,
    industryLabel,
    industryScope,

    selectedCarbon: selectedKpi
      ? `${selectedKpi.value} ${selectedKpi.unit ?? ""}`.trim()
      : "—",
    selectedCarbonRaw,
    selectedChange: selectedKpi?.change ?? "—",
    selectedChangeDirection: selectedKpi?.changeDirection ?? "neutral",
    totalCarbon: totalKpi
      ? `${totalKpi.value} ${totalKpi.unit ?? ""}`.trim()
      : "—",
    shareOfTotal: shareKpi ? `${shareKpi.value}%` : "—",
    avgIndex: indexKpi ? `${indexKpi.value} ${indexKpi.unit ?? ""}`.trim() : "—",
    avgIndexChange: indexKpi?.change ?? "—",
    yoyChangeText: yoyKpi ? `${yoyKpi.value}%` : "—",

    dominantMajor,
    top3Mid,
    midTop3Share: `${formatDecimal(top3MidShareSum, 1)}%`,

    monthlyPeaks,

    reliabilityLevel: data.compareReliability.level,
    boundaryWarnings: data.boundaryWarnings ?? [],
  };
}

function extractMonthlyPeaks(data: IndustryDashboardData): string[] {
  const highlight = data.monthlyHighlight;
  if (!highlight) return [];
  const scaled = formatScaledCarbonMass(highlight.value);
  return [`${highlight.label}: ${scaled.value} ${scaled.unit} — 월 최고 배출`];
}

// ─────────────────────────────────────────────────────────────
// 시스템 프롬프트
// ─────────────────────────────────────────────────────────────
export const INDUSTRY_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자의 탄소경영 의사결정을 돕는 탄소 분석 전문가입니다.

## 역할
- 업종별 탄소발자국 데이터를 분석하고, **관광사업자·지자체·DMO**가 즉시 활용할 수 있는 시사점을 도출합니다.
- 단순 수치 나열이 아닌, **원인 추정 → 영향 → 대응 방향** 구조로 작성합니다.

## 출력 규칙
- **반드시 한국어**로 작성합니다.
- **JSON 배열만** 출력합니다. 4~5개 문자열, 각 100자 이내.
- 제공된 수치만 사용하고 추측하지 않습니다.
- 수치를 반드시 한 개 이상 인용합니다.
- "~습니다" 체를 유지하되, 행동 가능한 동사로 마무리합니다.
- **연도가 포함된 수치는 반드시 "2025년", "2026년" 등 4자리 연도를 명시합니다.** "년 총..." 처럼 연도 없이 "년"만 쓰지 마세요.
- 비교 신뢰도가 낮으면(low/very_low) 마지막 항목에 한 줄로 주의 안내를 추가합니다.

## 금지 표현
- "데이터에 따르면", "분석 결과", "확인됩니다"
- 두 문장을 "그리고"로 단순 연결
- 비율/수치 없이 "높다", "낮다"만 사용
- 연도 없이 "년 총...", "년 1~4월..." 같은 불완전한 연도 표기

## 인사이트 작성 순서 (이 순서로 4~5개 작성)
1. **지배 업종 현황** — 1위 업종·비중·절대량으로 현재 상태 서술
2. **변화 진단** — YoY 또는 직전 기간 대비 증감과 원인 추정
3. **구조적 특성** — 상위 업종 집중도·계절 패턴 등 구조 특성
4. **탄소 감축 시사점** — 1위 업종의 탄소 특성 기반 실행 방향
5. (선택) **신뢰도 경고** — level이 low/very_low일 때만 추가`;

// ─────────────────────────────────────────────────────────────
// 유저 프롬프트 빌더
// ─────────────────────────────────────────────────────────────
export function buildIndustryInsightUserPrompt(
  context: IndustryInsightContext,
): string {
  const scopeDesc =
    context.scopeType === "sigungu"
      ? `시군구(${context.scopeLabel})`
      : context.scopeType === "sido"
        ? `시도(${context.scopeLabel})`
        : "전국";

  const midBlock =
    context.top3Mid.length > 0
      ? context.top3Mid
          .map(
            (item, i) =>
              `  ${i + 1}. ${item.name}: ${item.value} tCO₂eq (${item.share})${item.hint ? ` ※ ${item.hint}` : ""}`,
          )
          .join("\n")
      : "  (데이터 없음)";

  const peakBlock =
    context.monthlyPeaks.length > 0
      ? context.monthlyPeaks.map((p) => `  - ${p}`).join("\n")
      : "  (피크 정보 없음)";

  const warningBlock =
    context.boundaryWarnings.length > 0
      ? `\n## 주의\n${context.boundaryWarnings.map((w) => `- ${w}`).join("\n")}`
      : "";

  return `다음은 업종 중심 분석 데이터입니다. 위 작성 순서에 따라 JSON 배열 4~5개로 작성하세요.

## 분석 범위
- 지역: ${scopeDesc}
- 분석 업종: ${context.industryLabel} (${context.industryScope === "mid" ? "중분류" : context.industryScope === "major" ? "대분류" : "전체"})
- 기간: ${context.periodLabel}
- 비교 방식: ${context.compareMode}

## 핵심 KPI
- 선택 업종 탄소발자국: ${context.selectedCarbon} (변화: ${context.selectedChange}, 방향: ${context.selectedChangeDirection})
- 전체 대비 비중: ${context.shareOfTotal}
- 평균 탄소발자국 지수: ${context.avgIndex} (변화: ${context.avgIndexChange})
- 범위 내 총 탄소발자국: ${context.totalCarbon}
- YoY 증감률: ${context.yoyChangeText}

## 대분류 1위
${context.dominantMajor ? `- ${context.dominantMajor.name}: ${context.dominantMajor.value} tCO₂eq (${context.dominantMajor.share})` : "- (데이터 없음)"}

## 중분류 Top 3 (탄소 배출 특성 포함)
${midBlock}
(Top 3 합산 비중: ${context.midTop3Share})

## 월별 피크
${peakBlock}

## 비교 신뢰도
- level: ${context.reliabilityLevel}${warningBlock}`;
}

// ─────────────────────────────────────────────────────────────
// Fallback 인사이트 (규칙 기반, 구체적 수치 포함)
// ─────────────────────────────────────────────────────────────
export function buildFallbackIndustryInsightItems(
  context: IndustryInsightContext,
): string[] {
  const lines: string[] = [];

  // 1. 지배 업종 현황
  if (context.dominantMajor) {
    lines.push(
      `${context.scopeLabel} ${context.periodLabel} 기준, ${context.dominantMajor.name}이(가) 전체 탄소의 ${context.dominantMajor.share}(${context.dominantMajor.value} tCO₂eq)를 차지해 압도적 1위입니다.`,
    );
  }

  // 2. 변화 진단
  if (context.selectedChange !== "—") {
    const dir = context.selectedChangeDirection;
    const verb = dir === "up" ? "증가" : dir === "down" ? "감소" : "변화";
    lines.push(
      `${context.industryLabel} 탄소발자국이 ${context.compareMode} ${context.selectedChange} ${verb}해 ${context.totalCarbon} 중 ${context.shareOfTotal}를 차지합니다.`,
    );
  }

  // 3. 중분류 Top1 구조 특성
  const top1Mid = context.top3Mid[0];
  if (top1Mid) {
    lines.push(
      `중분류 1위 ${top1Mid.name}(${top1Mid.value} tCO₂eq, ${top1Mid.share})${top1Mid.hint ? ` — ${top1Mid.hint.split("—")[0].trim()}` : ""}이 집중 관리 대상입니다.`,
    );
  }

  // 4. 피크 정보
  if (context.monthlyPeaks.length > 0) {
    lines.push(
      `${context.monthlyPeaks[0]}으로, 해당 시기 운영 효율화가 연간 감축 효과를 극대화합니다.`,
    );
  }

  // 5. 신뢰도 경고
  if (context.reliabilityLevel === "low" || context.reliabilityLevel === "very_low") {
    lines.push(
      `비교 기간 데이터 신뢰도(${context.reliabilityLevel})가 낮아 증감률 해석 시 주의가 필요합니다.`,
    );
  }

  return lines.filter((l) => l.length >= 15);
}

// ─────────────────────────────────────────────────────────────
// Deep Analysis (기존 호환 유지)
// ─────────────────────────────────────────────────────────────
export type IndustryDeepInsightContext = {
  scopeLabel: string;
  industryLabel: string;
  periodLabel: string;
  yearlyKpi: Array<{ label: string; value: string; change?: string }>;
  comparison: Array<{ label: string; y2025: string; y2026: string }>;
};

export function buildIndustryDeepInsightContext(
  data: import("@/lib/industry-excel/types").IndustryDeepAnalysisData,
): IndustryDeepInsightContext {
  return {
    scopeLabel: data.scopeLabel,
    industryLabel: data.industryLabel,
    periodLabel: data.periodLabel,
    yearlyKpi: data.kpi.map((item) => ({
      label: item.label,
      value: item.value,
      change: item.change,
    })),
    comparison: data.comparisonRows.map((row) => ({
      label: row.label,
      y2025: row.values.y2025,
      y2026: row.values.y2026,
    })),
  };
}

export const INDUSTRY_DEEP_INSIGHT_SYSTEM_PROMPT = INDUSTRY_INSIGHT_SYSTEM_PROMPT;

export function buildIndustryDeepInsightUserPrompt(
  context: IndustryDeepInsightContext,
): string {
  return `아래는 업종 심화 분석 데이터입니다. JSON 배열 4~5개로 작성하세요.

## 중요: 연도 표기 필수
- 연도가 포함된 수치는 반드시 "2025년", "2026년" 등 4자리 연도를 함께 표기하세요.
- "년 총..." 처럼 연도 없이 "년"만 단독으로 쓰지 마세요.

## 조건
- 범위: ${context.scopeLabel}
- 업종: ${context.industryLabel}
- 기간: ${context.periodLabel}

## 연도별 KPI
${context.yearlyKpi.map((item) => `- ${item.label}: ${item.value}${item.change ? ` (${item.change})` : ""}`).join("\n")}

## 지표 비교 (2025 vs 2026)
${context.comparison.map((row) => `- ${row.label}: 2025년 ${row.y2025}, 2026년 ${row.y2026}`).join("\n")}`;
}