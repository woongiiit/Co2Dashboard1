"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { COVER_NAV_ITEMS } from "@/lib/cover-nav-items";

/** 커버 페이지 진입 시 상세 라우트 JS를 미리 받아 두어 클릭 후 체감 속도 개선 */
export function CoverRoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const item of COVER_NAV_ITEMS) {
      router.prefetch(item.href);
    }
  }, [router]);

  return null;
}
