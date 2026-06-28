"use client";

import { useEffect, useMemo } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import {
  KOREA_SIDO_OPTIONS,
  getSigunguOptionsForSido,
} from "@/lib/korea-admin-regions";

export type AiConsultingFilterState = {
  sidoCode: string;
  sigunguValue: string;
  periodStart: string;
  periodEnd: string;
};

type AiConsultingPageFiltersProps = {
  filters: AiConsultingFilterState;
  onFiltersChange: (patch: Partial<AiConsultingFilterState>) => void;
};

export function AiConsultingPageFilters({
  filters,
  onFiltersChange,
}: AiConsultingPageFiltersProps) {
  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(filters.sidoCode),
    [filters.sidoCode],
  );

  useEffect(() => {
    if (filters.sigunguValue === "all") return;

    const valid = sigunguOptions.some(
      (option) => option.value === filters.sigunguValue,
    );
    if (valid) return;

    const first = sigunguOptions.find((option) => option.value !== "all");
    if (first && first.value !== filters.sigunguValue) {
      onFiltersChange({ sigunguValue: first.value });
    }
  }, [filters.sigunguValue, sigunguOptions, onFiltersChange]);

  const handleSidoChange = (sidoCode: string) => {
    const nextOptions = getSigunguOptionsForSido(sidoCode);
    const first = nextOptions.find((option) => option.value !== "all");

    onFiltersChange({
      sidoCode,
      sigunguValue: first?.value ?? "all",
    });
  };

  return (
    <>
      <FilterSelect
        id="ai-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        value={filters.sidoCode}
        onChange={handleSidoChange}
      />

      <label className="filter-control">
        <span className="filter-control__label">시군구</span>
        <select
          id="ai-sigungu"
          className="filter-control__select"
          value={filters.sigunguValue}
          onChange={(e) => onFiltersChange({ sigunguValue: e.target.value })}
        >
          {sigunguOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <FilterPeriodRange
        idPrefix="ai-period"
        start={filters.periodStart}
        end={filters.periodEnd}
        onStartChange={(value) => onFiltersChange({ periodStart: value })}
        onEndChange={(value) => onFiltersChange({ periodEnd: value })}
      />
    </>
  );
}
