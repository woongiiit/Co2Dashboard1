import { NextResponse } from "next/server";
import {
  buildIndustryDeepInsightContext,
} from "@/lib/industry-excel/build-industry-insight-context";
import {
  buildFallbackIndustryDeepInsights,
  parseIndustryDeepAnalysisQuery,
  queryIndustryDeepAnalysis,
} from "@/lib/industry-excel/query-industry-deep-analysis";
import { generateIndustryDeepInsightsWithHf } from "@/lib/huggingface/generate-industry-insights";
import type { IndustryDeepInsightsResponse } from "@/lib/industry-excel/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseIndustryDeepAnalysisQuery(searchParams);
    const data = queryIndustryDeepAnalysis(query);
    const context = buildIndustryDeepInsightContext(data);
    const fallbackItems = buildFallbackIndustryDeepInsights(data);
    const generated = await generateIndustryDeepInsightsWithHf(
      context,
      fallbackItems,
    );

    const body: IndustryDeepInsightsResponse = {
      items: generated.items,
      source: generated.source,
      periodLabel: data.periodLabel,
      model: generated.model,
      warning: generated.warning,
    };

    return NextResponse.json(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 요약을 생성하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
