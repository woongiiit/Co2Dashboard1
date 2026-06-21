"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
  KOREA_SIDO_OPTIONS,
  getSigunguOptionsForSido,
} from "@/lib/korea-admin-regions";
import { DEFAULT_AI_CONSULTING_FILTERS } from "@/lib/ai-consulting/client";

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

  const skipSigunguReset = useRef(true);

  useEffect(() => {
    if (skipSigunguReset.current) {
      skipSigunguReset.current = false;
      return;
    }
    onFiltersChange({ sigunguValue: "all" });
  }, [filters.sidoCode, onFiltersChange]);

  useEffect(() => {
    if (filters.sigunguValue === "all") return;
    const valid = sigunguOptions.some(
      (option) => option.value === filters.sigunguValue,
    );
    if (!valid) {
      const first = sigunguOptions.find((option) => option.value !== "all");
      if (first) onFiltersChange({ sigunguValue: first.value });
    }
  }, [filters.sigunguValue, sigunguOptions, onFiltersChange]);

  return (
    <>
      <FilterSelect
        id="ai-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        value={filters.sidoCode}
        onChange={(value) => onFiltersChange({ sidoCode: value })}
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
