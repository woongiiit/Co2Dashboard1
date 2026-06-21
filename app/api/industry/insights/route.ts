import { NextResponse } from "next/server";
import { buildIndustryInsightContext } from "@/lib/industry-excel/build-industry-insight-context";
import {
  buildFallbackIndustryInsights,
  queryIndustryDashboard,
} from "@/lib/industry-excel/query-industry-dashboard";
import { parseIndustryDashboardQuery } from "@/lib/industry-excel/shared";
import { generateIndustryInsightsWithHf } from "@/lib/huggingface/generate-industry-insights";
import type { IndustryInsightsResponse } from "@/lib/industry-excel/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseIndustryDashboardQuery(searchParams);
    const dashboard = queryIndustryDashboard(query);
    const context = buildIndustryInsightContext(query, dashboard);
    const fallbackItems = buildFallbackIndustryInsights(query, dashboard);
    const generated = await generateIndustryInsightsWithHf(context, fallbackItems);

    const body: IndustryInsightsResponse = {
      items: generated.items,
      source: generated.source,
      periodLabel: dashboard.periodLabel,
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
