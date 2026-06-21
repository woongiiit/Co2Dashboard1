"use client";

import { useCallback } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import {
  COMPARE_OPTIONS,
  INDUSTRY_FILTER_OPTIONS,
  REGION_FILTER_OPTIONS,
} from "@/components/dashboard/filter-options";
import type { IndustryDeepAnalysisQuery } from "@/lib/industry-excel/types";

type DeepAnalysisPageFiltersProps = {
  filters: IndustryDeepAnalysisQuery;
  onFiltersChange: (patch: Partial<IndustryDeepAnalysisQuery>) => void;
  onReset: () => void;
  resetKey: number;
};

export function DeepAnalysisPageFilters({
  filters,
  onFiltersChange,
  onReset,
  resetKey,
}: DeepAnalysisPageFiltersProps) {
  const updateFilter = useCallback(
    (key: keyof IndustryDeepAnalysisQuery, value: string) => {
      onFiltersChange({ [key]: value });
    },
    [onFiltersChange],
  );

  return (
    <>
      <FilterSelect
        key={`region-${resetKey}`}
        id="deep-region"
        label="지역"
        options={REGION_FILTER_OPTIONS}
        value={filters.regionValue}
        onChange={(value) => updateFilter("regionValue", value)}
      />
      <FilterSelect
        key={`industry-${resetKey}`}
        id="deep-industry"
        label="업종"
        options={INDUSTRY_FILTER_OPTIONS}
        value={filters.majorCode}
        onChange={(value) => updateFilter("majorCode", value)}
      />
      <FilterSelect
        key={`compare-${resetKey}`}
        id="deep-compare"
        label="비교 기준"
        options={COMPARE_OPTIONS}
        value={filters.compare}
        onChange={(value) =>
          updateFilter("compare", value === "prev" ? "prev" : "yoy")
        }
      />
      <button
        type="button"
        className="btn btn--secondary deep-analysis-filter__reset"
        onClick={onReset}
      >
        <svg
          className="deep-analysis-filter__reset-icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13.5 8A5.5 5.5 0 1 1 8 2.5V1M8 2.5 5.5 5M8 2.5 10.5 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        필터 초기화
      </button>
    </>
  );
}
