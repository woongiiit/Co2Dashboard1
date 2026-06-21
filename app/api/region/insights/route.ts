import { NextResponse } from "next/server";
import { buildRegionInsightContext } from "@/lib/region-excel/build-region-insight-context";
import {
  buildFallbackRegionInsightsFromQuery,
  parseRegionDashboardQuery,
  queryRegionDashboard,
} from "@/lib/region-excel/query-region-dashboard";
import { generateRegionInsightsWithHf } from "@/lib/huggingface/generate-region-insights";
import type { RegionInsightsResponse } from "@/lib/region-excel/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseRegionDashboardQuery(searchParams);
    const dashboard = queryRegionDashboard(query);
    const context = buildRegionInsightContext(query, dashboard);
    const fallbackItems = buildFallbackRegionInsightsFromQuery(query);
    const generated = await generateRegionInsightsWithHf(context, fallbackItems);

    const body: RegionInsightsResponse = {
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
