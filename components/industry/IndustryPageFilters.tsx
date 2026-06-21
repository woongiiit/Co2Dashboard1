"use client";

import { useEffect, useMemo } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import { COMPARE_OPTIONS } from "@/components/dashboard/filter-options";
import { IndustryClassificationFilters } from "@/components/industry/IndustryClassificationFilters";
import {
  KOREA_SIDO_OPTIONS,
  getSigunguOptionsForSido,
} from "@/lib/korea-admin-regions";
import type { IndustryDashboardQuery } from "@/lib/industry-excel/types";

type IndustryPageFiltersProps = {
  filters: IndustryDashboardQuery;
  onFiltersChange: (patch: Partial<IndustryDashboardQuery>) => void;
};

export function IndustryPageFilters({
  filters,
  onFiltersChange,
}: IndustryPageFiltersProps) {
  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(filters.sidoCode),
    [filters.sidoCode],
  );

  useEffect(() => {
    if (filters.regionLabel === "all") return;
    const valid = sigunguOptions.some(
      (option) => option.value === filters.regionLabel,
    );
    if (!valid) onFiltersChange({ regionLabel: "all" });
  }, [filters.regionLabel, sigunguOptions, onFiltersChange]);

  return (
    <>
      <FilterSelect
        id="industry-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        value={filters.sidoCode}
        onChange={(value) =>
          onFiltersChange({ sidoCode: value, regionLabel: "all" })
        }
      />

      <label className="filter-control">
        <span className="filter-control__label">시군구</span>
        <select
          id="industry-sigungu"
          className="filter-control__select"
          value={filters.regionLabel}
          onChange={(e) => onFiltersChange({ regionLabel: e.target.value })}
        >
          {sigunguOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <FilterPeriodRange
        idPrefix="industry-period"
        start={filters.periodStart}
        end={filters.periodEnd}
        onStartChange={(value) => onFiltersChange({ periodStart: value })}
        onEndChange={(value) => onFiltersChange({ periodEnd: value })}
      />

      <FilterSelect
        id="industry-compare"
        label="비교 기준"
        options={COMPARE_OPTIONS}
        value={filters.compare}
        onChange={(value) =>
          onFiltersChange({ compare: value === "prev" ? "prev" : "yoy" })
        }
      />

      <IndustryClassificationFilters
        majorCode={filters.majorCode}
        midCode={filters.midCode}
        onFiltersChange={(patch) => onFiltersChange(patch)}
      />
    </>
  );
}
