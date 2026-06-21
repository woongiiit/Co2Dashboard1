import type {
  AiConsultingDashboardData,
  AiConsultingQuery,
} from "@/lib/ai-consulting/types";

export type AiConsultingInsightContext = {
  regionLabel: string;
  periodLabel: string;
  compareMode: string;
  kpi: Array<{ label: string; value: string; hint?: string }>;
  sectorTop5: Array<{ name: string; share: string; value: string }>;
  radar: {
    indicators: string[];
    region: number[];
    national: number[];
  };
  compareReliability: AiConsultingDashboardData["compareReliability"];
};

export function buildAiConsultingInsightContext(
  query: AiConsultingQuery,
  dashboard: AiConsultingDashboardData,
): AiConsultingInsightContext {
  return {
    regionLabel: dashboard.regionLabel,
    periodLabel: dashboard.periodLabel,
    compareMode: "전년 동기간 대비",
    kpi: dashboard.kpi.map((item) => ({
      label: item.label,
      value: item.value,
      hint: item.hint,
    })),
    sectorTop5: dashboard.sectorEmission.slice(0, 5).map((item) => ({
      name: item.name,
      share: `${item.share}%`,
      value: item.value.toLocaleString("ko-KR"),
    })),
    radar: dashboard.radar,
    compareReliability: dashboard.compareReliability,
  };
}

export const AI_CONSULTING_INSIGHT_SYSTEM_PROMPT = `당신은 관광 DMO·지자체·관광사업자를 위한 **관광 탄소경영 AI 컨설턴트**입니다.

## 역할
- 제공된 지역·기간·업종·KPI·차트 수치만 근거로, AI 컨설팅 페이지 5개 섹션에 맞는 실행 가능한 제언을 작성합니다.
- 추측·허구 수치·정책명을 만들지 않습니다.

## 출력 규칙
- **반드시 한국어**
- **JSON 객체만** 출력 (마크다운 없음)
- 키와 형식 (고정 id 필수):

{
  "regionalEvaluation": ["문장", "..."],           // 3~4개, 각 120자 이내
  "travelerGuide": [
    {"id":"transport","title":"이동 · 교통","description":"..."},
    {"id":"lodging","title":"숙박","description":"..."},
    ...
  ],
  "governmentConsulting": ["문장", "..."],         // 4~6개
  "priorityActions": {
    "short": ["...", "..."],                       // 2~3개 (단기 ~1년)
    "mid": ["...", "..."],                         // 2~3개 (중기 1~3년)
    "long": ["...", "..."]                          // 2~3개 (장기 3년~)
  },
  "oneLineRecommendation": "한 문장 120자 이내"
}

travelerGuide는 id를 반드시 transport, lodging, food, waste, activity 다섯 개 모두 포함하세요.`;

// Fix typo in prompt - " lodging" should be "lodging"

export function buildAiConsultingInsightUserPrompt(
  context: AiConsultingInsightContext,
): string {
  return `아래는 /ai-consulting 페이지 데이터입니다. 위 JSON 형식으로 5개 섹션을 작성하세요.

## 분석 조건
- 지역: ${context.regionLabel}
- 기간: ${context.periodLabel}
- 비교: ${context.compareMode}

## KPI
${context.kpi.map((item) => `- ${item.label}: ${item.value}${item.hint ? ` (${item.hint})` : ""}`).join("\n")}

## 주요 부문별 배출 Top 5
${context.sectorTop5.map((item) => `- ${item.name}: ${item.value} tCO₂eq (${item.share})`).join("\n")}

## 레이더 (전국=50 기준, 선택 지역)
${context.radar.indicators
  .map(
    (name, index) =>
      `- ${name}: 선택 ${context.radar.region[index]}, 전국 ${context.radar.national[index]}`,
  )
  .join("\n")}

## 섹션별 작성 지침
1. regionalEvaluation: 지역 종합 진단·순위·상위 업종·추세 (지자체·DMO 관점)
2. travelerGuide: 각 id별 여행자 실천 행동 1~2문장 (친근한 어조)
3. governmentConsulting: 지자체 정책·행정·인프라 제언
4. priorityActions: 단기/중기/장기 실행 과제 (구체적)
5. oneLineRecommendation: 핵심 한 줄 요약

## 비교 신뢰도
- level: ${context.compareReliability.level}`;
}
