import { NextResponse } from "next/server";
import { queryIndustryDashboard } from "@/lib/industry-excel/query-industry-dashboard";
import { parseIndustryDashboardQuery } from "@/lib/industry-excel/shared";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseIndustryDashboardQuery(searchParams);
    const data = queryIndustryDashboard(query);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "업종 데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
