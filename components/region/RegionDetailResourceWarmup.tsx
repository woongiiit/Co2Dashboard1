"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadMunicipalitiesGeoJson } from "@/lib/sigungu-map";
import { prefetchRegionDetail } from "@/lib/prefetch-region-detail";

type RegionDetailResourceWarmupProps = {
  /** Warm dynamic route chunk with a representative 시군구 path. */
  sampleSigungu?: string;
};

export function RegionDetailResourceWarmup({
  sampleSigungu = "서울특별시 종로구",
}: RegionDetailResourceWarmupProps) {
  const router = useRouter();

  useEffect(() => {
    void loadMunicipalitiesGeoJson();
    void import("maplibre-gl");
    prefetchRegionDetail(router, sampleSigungu);
  }, [router, sampleSigungu]);

  return null;
}
