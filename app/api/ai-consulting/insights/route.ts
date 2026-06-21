import { NextResponse } from "next/server";
import { buildAiConsultingInsightContext } from "@/lib/ai-consulting/build-ai-consulting-insight-context";
import {
  buildFallbackAiConsultingInsights,
  parseAiConsultingQuery,
  queryAiConsultingDashboard,
} from "@/lib/ai-consulting/query-ai-consulting";
import { generateAiConsultingInsightsWithHf } from "@/lib/huggingface/generate-ai-consulting-insights";
import type { AiConsultingInsightsResponse } from "@/lib/ai-consulting/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseAiConsultingQuery(searchParams);
    const dashboard = queryAiConsultingDashboard(query);
    const context = buildAiConsultingInsightContext(query, dashboard);
    const fallbackSections = buildFallbackAiConsultingInsights(query, dashboard);
    const generated = await generateAiConsultingInsightsWithHf(
      context,
      fallbackSections,
    );

    const body: AiConsultingInsightsResponse = {
      sections: generated.sections,
      source: generated.source,
      periodLabel: dashboard.periodLabel,
      regionLabel: dashboard.regionLabel,
      model: generated.model,
      warning: generated.warning,
    };

    return NextResponse.json(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 컨설팅을 생성하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
