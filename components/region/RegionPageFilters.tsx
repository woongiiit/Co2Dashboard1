"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import {
  CARBON_METRIC_OPTIONS,
  COMPARE_OPTIONS,
} from "@/components/dashboard/filter-options";
import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import { KOREA_SIDO_OPTIONS, getSigunguOptionsForSido } from "@/lib/korea-admin-regions";
import {
  prefetchRegionDetail,
  prefetchRegionDetailBatch,
} from "@/lib/prefetch-region-detail";
import { regionDetailPath } from "@/lib/region-routes";

export function RegionPageFilters() {
  const router = useRouter();
  const [sidoCode, setSidoCode] = useState("all");
  const [sigunguValue, setSigunguValue] = useState("all");
  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(sidoCode),
    [sidoCode],
  );

  useEffect(() => {
    setSigunguValue("all");
  }, [sidoCode]);

  useEffect(() => {
    const labels = sigunguOptions
      .filter((opt) => opt.value !== "all")
      .map((opt) => opt.value);
    prefetchRegionDetailBatch(router, labels, 6);
  }, [sigunguOptions, router]);

  return (
    <>
      <FilterSelect
        id="region-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        defaultValue="all"
        onChange={(value) => setSidoCode(value)}
      />

      <label className="filter-control">
        <span className="filter-control__label">시군구</span>
        <select
          id="region-sigungu"
          className="filter-control__select"
          value={sigunguValue}
          onChange={(e) => {
            const next = e.target.value;
            setSigunguValue(next);
            if (next !== "all") {
              router.push(regionDetailPath(next));
            }
          }}
        >
          {sigunguOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              onMouseEnter={() => {
                if (opt.value !== "all") {
                  prefetchRegionDetail(router, opt.value);
                }
              }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <FilterPeriodRange idPrefix="region-period" />

      <FilterSelect
        id="region-compare"
        label="비교 기준"
        options={COMPARE_OPTIONS}
      />
      <FilterSelect
        id="region-metric"
        label="탄소 지표"
        options={CARBON_METRIC_OPTIONS}
      />
    </>
  );
}
