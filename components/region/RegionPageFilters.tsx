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
import type { RegionDashboardQuery } from "@/lib/region-excel/types";

type RegionPageFiltersProps = {
  filters: RegionDashboardQuery;
  onFiltersChange: (patch: Partial<RegionDashboardQuery>) => void;
};

export function RegionPageFilters({
  filters,
  onFiltersChange,
}: RegionPageFiltersProps) {
  const router = useRouter();
  const [sigunguValue, setSigunguValue] = useState("all");
  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(filters.sidoCode),
    [filters.sidoCode],
  );

  useEffect(() => {
    setSigunguValue("all");
  }, [filters.sidoCode]);

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
        value={filters.sidoCode}
        onChange={(value) => onFiltersChange({ sidoCode: value })}
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

      <FilterPeriodRange
        idPrefix="region-period"
        start={filters.periodStart}
        end={filters.periodEnd}
        onStartChange={(value) => onFiltersChange({ periodStart: value })}
        onEndChange={(value) => onFiltersChange({ periodEnd: value })}
      />

      <FilterSelect
        id="region-compare"
        label="비교 기준"
        options={COMPARE_OPTIONS}
        value={filters.compare}
        onChange={(value) =>
          onFiltersChange({
            compare: value === "prev" ? "prev" : "yoy",
          })
        }
      />
      <FilterSelect
        id="region-metric"
        label="탄소 지표"
        options={CARBON_METRIC_OPTIONS}
        value={filters.metric}
        onChange={(value) =>
          onFiltersChange({
            metric:
              value === "per-capita" || value === "per-spend"
                ? value
                : "total",
          })
        }
      />
    </>
  );
}
