"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { COMPARE_OPTIONS } from "@/components/dashboard/filter-options";
import { getSigunguOptionsForSido, KOREA_SIDO_OPTIONS } from "@/lib/korea-admin-regions";
import { regionDetailPath } from "@/lib/region-routes";
import type { RegionDetailFilters } from "@/lib/region-excel/client-detail";

type RegionDetailPageFiltersProps = {
  selectedSigungu: string;
  filters: RegionDetailFilters;
  onFiltersChange: (patch: Partial<RegionDetailFilters>) => void;
};

function getSidoCodeFromRegionLabel(regionLabel: string): string {
  const sidoLabel = regionLabel.split(" ")[0];
  const match = KOREA_SIDO_OPTIONS.find((option) => option.label === sidoLabel);
  return match?.value ?? "all";
}

export function RegionDetailPageFilters({
  selectedSigungu,
  filters,
  onFiltersChange,
}: RegionDetailPageFiltersProps) {
  const router = useRouter();
  const sidoCode = useMemo(
    () => getSidoCodeFromRegionLabel(selectedSigungu),
    [selectedSigungu],
  );
  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(sidoCode),
    [sidoCode],
  );

  useEffect(() => {
    if (sidoCode === "all") return;
    const valid = sigunguOptions.some((option) => option.value === selectedSigungu);
    if (!valid && sigunguOptions.length > 1) {
      const first = sigunguOptions.find((option) => option.value !== "all");
      if (first) router.replace(regionDetailPath(first.value));
    }
  }, [router, selectedSigungu, sigunguOptions, sidoCode]);

  return (
    <>
      <FilterSelect
        id="detail-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        value={sidoCode}
        onChange={(value) => {
          const nextOptions = getSigunguOptionsForSido(value);
          const first = nextOptions.find((option) => option.value !== "all");
          if (first) router.push(regionDetailPath(first.value));
        }}
      />

      <label className="filter-control">
        <span className="filter-control__label">시군구</span>
        <select
          id="detail-sigungu"
          className="filter-control__select"
          value={selectedSigungu}
          onChange={(e) => {
            const next = e.target.value;
            if (next) router.push(regionDetailPath(next));
          }}
        >
          {sigunguOptions
            .filter((option) => option.value !== "all")
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
      </label>

      <FilterPeriodRange
        idPrefix="detail-period"
        start={filters.periodStart}
        end={filters.periodEnd}
        onStartChange={(value) => onFiltersChange({ periodStart: value })}
        onEndChange={(value) => onFiltersChange({ periodEnd: value })}
      />

      <FilterSelect
        id="detail-compare"
        label="비교 기준"
        options={COMPARE_OPTIONS}
        value={filters.compare}
        onChange={(value) =>
          onFiltersChange({
            compare: value === "prev" ? "prev" : "yoy",
          })
        }
      />
    </>
  );
}
