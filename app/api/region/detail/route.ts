import { NextResponse } from "next/server";
import {
  parseRegionDetailQuery,
  queryRegionDetail,
} from "@/lib/region-excel/query-region-detail";

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
    const data = queryRegionDetail(query);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "지역 상세 데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
