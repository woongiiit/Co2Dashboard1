import { NextResponse } from "next/server";
import {
  buildRegionSourceExcelContentDisposition,
  readRegionSourceExcelBuffer,
} from "@/lib/region-excel/read-region-source-excel";

export const runtime = "nodejs";

export async function GET() {
  try {
    const buffer = readRegionSourceExcelBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": buildRegionSourceExcelContentDisposition(),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "엑셀 파일을 다운로드하지 못했습니다.";

    return NextResponse.json({ error: message }, { status: 404 });
  }
}
