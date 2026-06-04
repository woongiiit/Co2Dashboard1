"use client";

import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { SigunguSelect } from "@/components/SigunguSelect";
import { COMPARE_OPTIONS, SIDO_OPTIONS } from "@/components/dashboard/filter-options";

type RegionDetailPageFiltersProps = {
  selectedSigungu: string;
};

export function RegionDetailPageFilters({
  selectedSigungu,
}: RegionDetailPageFiltersProps) {
  return (
    <>
      <FilterSelect id="detail-sido" label="시도" options={SIDO_OPTIONS} />
      <SigunguSelect value={selectedSigungu} />
      <FilterPeriodRange idPrefix="detail-period" />
      <FilterSelect
        id="detail-compare"
        label="비교 기준"
        options={COMPARE_OPTIONS}
      />
    </>
  );
}
