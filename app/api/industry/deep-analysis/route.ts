import { NextResponse } from "next/server";
import {
  parseIndustryDeepAnalysisQuery,
  queryIndustryDeepAnalysis,
} from "@/lib/industry-excel/query-industry-deep-analysis";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseIndustryDeepAnalysisQuery(searchParams);
    const data = queryIndustryDeepAnalysis(query);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "업종 심화 데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
