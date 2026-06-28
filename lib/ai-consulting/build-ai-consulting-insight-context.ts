import type {
  AiConsultingDashboardData,
  AiConsultingQuery,
  AiConsultingScope,
} from "@/lib/ai-consulting/types";
import {
  buildMidIndustryTopItems,
  buildSigunguInsightProfile,
  type AiConsultingMidIndustryItem,
  type AiConsultingSigunguProfile,
} from "@/lib/ai-consulting/insight-data-profile";

export type AiConsultingInsightContext = {
  scope: AiConsultingScope;
  regionLabel: string;
  periodLabel: string;
  compareMode: string;
  kpi: Array<{ label: string; value: string; hint?: string }>;
  sectorTop5: Array<{ name: string; share: string; value: string }>;
  midIndustryTop8: AiConsultingMidIndustryItem[];
  sigunguProfile: AiConsultingSigunguProfile | null;
  radar: {
    indicators: string[];
    region: number[];
    national: number[];
  };
  compareReliability: AiConsultingDashboardData["compareReliability"];
};

function formatKpiLine(item: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
}): { label: string; value: string; hint?: string } {
  const value = [item.value, item.unit].filter(Boolean).join(" ");
  return { label: item.label, value, hint: item.hint };
}

export function buildAiConsultingInsightContext(
  query: AiConsultingQuery,
  dashboard: AiConsultingDashboardData,
): AiConsultingInsightContext {
  return {
    scope: query.scope,
    regionLabel: dashboard.regionLabel,
    periodLabel: dashboard.periodLabel,
    compareMode: "전년 동기간 대비",
    kpi: dashboard.kpi.map((item) => formatKpiLine(item)),
    sectorTop5: dashboard.sectorEmission.slice(0, 5).map((item) => ({
      name: item.name,
      share: `${item.share}%`,
      value: item.value.toLocaleString("ko-KR"),
    })),
    midIndustryTop8: buildMidIndustryTopItems(query, 8),
    sigunguProfile: buildSigunguInsightProfile(query),
    radar: dashboard.radar,
    compareReliability: dashboard.compareReliability,
  };
}

const REGIONAL_WRITING_RULES = `
## 지역 특화 작성 원칙 (필수)
- "대중교통 이용", "친환경 숙소 선택", "일회용품 줄이기" 등 **전국 어디에나 해당하는 문장만 나열하지 마세요**.
- **지역명·시도명·상위 중분류 업종·배출 구조**를 근거로, 이 지역만 해당하는 장소·코스·체험·정책을 구체적으로 쓰세요.
- 엑셀에 없는 **배출량·비율·순위 수치는 절대 만들지 마세요**.
- **관광명소·지명·체험**은 해당 지역에 일반적으로 알려진 것을 활용해 연결할 수 있습니다(수치와 혼동 금지).
- 각 섹션마다 최소 1개는 **지명·업종·동선·패키지** 등 고유 표현을 포함하세요.`;

const JSON_OUTPUT_RULES = `
## 출력 규칙
- **반드시 한국어**
- **JSON 객체만** 출력 (마크다운 없음)
- 키와 형식 (고정 id 필수):

{
  "regionalEvaluation": ["문장", "..."],
  "travelerGuide": [
    {"id":"transport","title":"이동 · 교통","description":"..."},
    {"id":"lodging","title":"숙박","description":"..."},
    {"id":"food","title":"식음 · 쇼핑","description":"..."},
    {"id":"waste","title":"자원 · 폐기물","description":"..."},
    {"id":"activity","title":"체험 · 활동","description":"..."}
  ],
  "governmentConsulting": ["문장", "..."],
  "priorityActions": {
    "short": ["...", "..."],
    "mid": ["...", "..."],
    "long": ["...", "..."]
  },
  "oneLineRecommendation": "2~3문장, 150~220자"
}

travelerGuide는 id를 반드시 transport, lodging, food, waste, activity 다섯 개 모두 포함하세요.`;

export const AI_CONSULTING_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자를 위한 **관광 탄소경영 AI 컨설턴트**입니다.

## 역할
- 제공된 **엑셀 기반 KPI·대분류/중분류 업종·비교·추세**와 **지역명**을 근거로, 해당 시군구에만 맞는 실행 제언을 작성합니다.
- 배출 수치는 제공 데이터만 사용하고, **관광명소·코스·패키지**는 지역 특성에 맞게 구체적으로 제안합니다.
${REGIONAL_WRITING_RULES}
${JSON_OUTPUT_RULES}`;

export const AI_CONSULTING_AGGREGATE_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·중앙·지자체 정책 담당자를 위한 **관광 탄소경영 AI 컨설턴트**입니다.

## 역할
- 제공된 **전국 또는 시도 집계** 엑셀 데이터(업종·순위·추세)를 근거로, 해당 범위의 **지역 간 격차·상위 배출 지역·산업 구조**를 반영한 제언을 작성합니다.
- 전국 공통 문구 반복을 피하고, **상위 시군구·상위 중분류 업종**을 이름과 함께 언급하세요.
${REGIONAL_WRITING_RULES}
${JSON_OUTPUT_RULES}`;

function buildMidIndustryBlock(context: AiConsultingInsightContext): string {
  if (context.midIndustryTop8.length === 0) {
    return "## 중분류 업종 Top 8 (엑셀)\n- 데이터 없음";
  }

  return `## 중분류 업종 Top 8 (엑셀 — 지역 특화·패키지 설계 근거)
${context.midIndustryTop8
  .map(
    (item) =>
      `- ${item.label} (${item.majorLabel}): ${item.value} tCO₂eq, ${item.share} — ${item.tourismHint}`,
  )
  .join("\n")}`;
}

function buildSigunguProfileBlock(context: AiConsultingInsightContext): string {
  const profile = context.sigunguProfile;
  if (!profile) return "";

  return `
## 시군구 추가 프로필 (엑셀)
- 시도: ${profile.sidoNm}
## 전국·유사 지역 비교
${
  profile.comparison.length > 0
    ? profile.comparison
        .map((row) => `- ${row.label}: ${row.value} tCO₂eq, ${row.change}`)
        .join("\n")
    : "- 비교 데이터 없음"
}
## 월별 배출 peak (선택 지역)
${
  profile.monthlyPeaks.length > 0
    ? profile.monthlyPeaks.map((line) => `- ${line}`).join("\n")
    : "- peak 정보 없음"
}`;
}

function buildInsightDataBlock(context: AiConsultingInsightContext): string {
  const radarLabel =
    context.scope === "sigungu"
      ? "레이더 (기준=50, 선택 지역)"
      : "레이더 (기준=50, 선택 범위)";

  return `## KPI (엑셀)
${context.kpi.map((item) => `- ${item.label}: ${item.value}${item.hint ? ` (${item.hint})` : ""}`).join("\n")}

## 대분류 부문별 배출 Top 5 (엑셀)
${context.sectorTop5.map((item) => `- ${item.name}: ${item.value} tCO₂eq (${item.share})`).join("\n")}

${buildMidIndustryBlock(context)}
${buildSigunguProfileBlock(context)}

## ${radarLabel}
${context.radar.indicators
  .map(
    (name, index) =>
      `- ${name}: 선택 ${context.radar.region[index]}, 기준 ${context.radar.national[index]}`,
  )
  .join("\n")}

## 비교 신뢰도
- level: ${context.compareReliability.level}`;
}

function buildSectionGuideSigungu(regionLabel: string): string {
  return `
## 섹션별 작성 지침
1. **regionalEvaluation** (3~4문장): ${regionLabel}의 순위·상위 **대분류·중분류**·추세·peak 시즌을 **수치와 업종명**으로 진단. 다른 지역과 바꿔도 되는 일반론 금지.
2. **travelerGuide**: id별 1~2문장. **이 지역의 실제 이동·식음·체험**을 상위 중분류 업종과 연결(예: 육상운송↑ → 시내·근교 **구체 동선**). 각 description에 **지명 또는 업종명** 1개 이상.
3. **governmentConsulting** (4~6개): 상위 업종·peak·비교 격차를 반영한 **지자체 실행안**(인프라·인센티브·모니터링). "대중교통 확대"만 단독 사용 금지 — **어디·어떤 업종·어떤 시즌**인지 명시.
4. **priorityActions**: 단기/중기/장기 각 2~3개. **중분류 업종명·지역명**을 과제에 포함.
5. **oneLineRecommendation** (2~3문장, 150~220자): **저탄소 관광 패키지** 1개 제안 — 이 지역 **관광명소·체험 2~3개**를 하나의 동선/코스로 묶고, 상위 배출 업종(이동·식음 등) 관점에서 **왜 탄소가 적은지** 설명. 예: "○○·△△·□□을 도보·대중교통으로 묶은 ○일 코스는 장거리 이동·렌터카 의존을 줄여 운송 배출(39%)을 낮출 수 있다."`;
}

const SECTION_GUIDE_AGGREGATE = `
## 섹션별 작성 지침
1. **regionalEvaluation** (3~4문장): 범위 내 **1위 시군구·상위 중분류·격차·추세**를 수치·지명과 함께 진단.
2. **travelerGuide**: id별 1~2문장. 범위의 **대표 업종 구조**에 맞는 구체 행동(상위 중분류명 포함).
3. **governmentConsulting** (4~6개): 상위 지역·업종·집중도 기반 **정책·인프라** (범용 문구 금지).
4. **priorityActions**: 단기/중기/장기 — **상위 시군구·업종명** 반영.
5. **oneLineRecommendation** (2~3문장): 범위 대표 **저탄소 관광 모델** 1개 — 상위 배출 지역·업종과 연결된 **구체 패키지/동선** 제안.`;

export function buildAiConsultingInsightUserPrompt(
  context: AiConsultingInsightContext,
): string {
  const sidoHint = context.sigunguProfile?.sidoNm
    ? ` (${context.sigunguProfile.sidoNm})`
    : "";

  return `아래는 /ai-consulting **시군구** 분석용 **엑셀 데이터 + 지역 프로필**입니다. 위 JSON 형식으로 5개 섹션을 작성하세요.

## 분석 조건
- 지역: ${context.regionLabel}${sidoHint}
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}

${buildInsightDataBlock(context)}
${buildSectionGuideSigungu(context.regionLabel)}`;
}

export function buildAiConsultingAggregateInsightUserPrompt(
  context: AiConsultingInsightContext,
): string {
  const scopeGuide =
    context.scope === "national"
      ? "전국 집계 — 상위 시군구·지역 간 격차·산업 구조"
      : `${context.regionLabel} 시도 집계 — 시군구 간 격차·1위 시군구·산업 구조`;

  return `아래는 /ai-consulting **${context.scope === "national" ? "전국" : "시도"}** 집계용 **엑셀 데이터**입니다. 위 JSON 형식으로 5개 섹션을 작성하세요.

## 분석 조건
- 범위: ${context.regionLabel} (${scopeGuide})
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}

${buildInsightDataBlock(context)}
${SECTION_GUIDE_AGGREGATE}`;
}

export function resolveAiConsultingSystemPrompt(
  context: AiConsultingInsightContext,
): string {
  return context.scope === "sigungu"
    ? AI_CONSULTING_INSIGHT_SYSTEM_PROMPT
    : AI_CONSULTING_AGGREGATE_INSIGHT_SYSTEM_PROMPT;
}

export function resolveAiConsultingUserPrompt(
  context: AiConsultingInsightContext,
): string {
  return context.scope === "sigungu"
    ? buildAiConsultingInsightUserPrompt(context)
    : buildAiConsultingAggregateInsightUserPrompt(context);
}
