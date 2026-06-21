import { NextResponse } from "next/server";
import {
  parseRegionDashboardQuery,
  queryRegionDashboard,
} from "@/lib/region-excel/query-region-dashboard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseRegionDashboardQuery(searchParams);
    const data = queryRegionDashboard(query);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "지역 데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
