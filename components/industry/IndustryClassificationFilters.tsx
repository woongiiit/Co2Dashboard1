"use client";

import { useEffect, useMemo } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import {
  INDUSTRY_MAJOR_OPTIONS,
  getIndustryMidOptionsForMajor,
  isMidValidForMajor,
} from "@/lib/industry-classification";

type IndustryClassificationFiltersProps = {
  majorCode: string;
  midCode: string;
  onFiltersChange: (patch: { majorCode?: string; midCode?: string }) => void;
  majorId?: string;
  midId?: string;
};

export function IndustryClassificationFilters({
  majorCode,
  midCode,
  onFiltersChange,
  majorId = "industry-major",
  midId = "industry-mid",
}: IndustryClassificationFiltersProps) {
  const midOptions = useMemo(
    () => getIndustryMidOptionsForMajor(majorCode),
    [majorCode],
  );

  useEffect(() => {
    if (!isMidValidForMajor(majorCode, midCode)) {
      onFiltersChange({ midCode: "all" });
    }
  }, [majorCode, midCode, onFiltersChange]);

  return (
    <>
      <FilterSelect
        id={majorId}
        label="대분류 업종"
        options={INDUSTRY_MAJOR_OPTIONS}
        value={majorCode}
        onChange={(value) => onFiltersChange({ majorCode: value, midCode: "all" })}
      />
      <FilterSelect
        id={midId}
        label="중분류 업종"
        options={midOptions}
        value={midCode}
        onChange={(value) => onFiltersChange({ midCode: value })}
      />
    </>
  );
}
