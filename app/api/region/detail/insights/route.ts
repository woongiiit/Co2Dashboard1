import { NextResponse } from "next/server";
import { buildRegionDetailInsightContext } from "@/lib/region-excel/build-region-detail-insight-context";
import { generateRegionDetailInsightsWithHf } from "@/lib/huggingface/generate-region-detail-insights";
import {
  buildFallbackRegionDetailInsights,
  parseRegionDetailQuery,
  queryRegionDetail,
} from "@/lib/region-excel/query-region-detail";
import type { RegionDetailInsightsResponse } from "@/lib/region-excel/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionLabel = searchParams.get("region")?.trim();
    if (!regionLabel) {
      return NextResponse.json(
        { error: "region 쿼리 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    const query = parseRegionDetailQuery(searchParams, regionLabel);
    const detail = queryRegionDetail(query);
    const context = buildRegionDetailInsightContext(query, detail);
    const fallbackSections = buildFallbackRegionDetailInsights(detail, query);
    const generated = await generateRegionDetailInsightsWithHf(
      context,
      fallbackSections,
    );

    const body: RegionDetailInsightsResponse = {
      sections: generated.sections,
      source: generated.source,
      periodLabel: detail.periodLabel,
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
