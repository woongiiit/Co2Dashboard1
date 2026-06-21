import { NextResponse } from "next/server";
import {
  parseAiConsultingQuery,
  queryAiConsultingDashboard,
} from "@/lib/ai-consulting/query-ai-consulting";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseAiConsultingQuery(searchParams);
    const data = queryAiConsultingDashboard(query);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 컨설팅 데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
