"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import {
  INDUSTRY_MAJOR_OPTIONS,
  getIndustryMidOptionsForMajor,
  isMidValidForMajor,
} from "@/lib/industry-classification";

type IndustryClassificationFiltersProps = {
  majorId?: string;
  midId?: string;
};

export function IndustryClassificationFilters({
  majorId = "industry-major",
  midId = "industry-mid",
}: IndustryClassificationFiltersProps) {
  const [majorCode, setMajorCode] = useState("all");
  const [midCode, setMidCode] = useState("all");

  const midOptions = useMemo(
    () => getIndustryMidOptionsForMajor(majorCode),
    [majorCode],
  );

  useEffect(() => {
    if (!isMidValidForMajor(majorCode, midCode)) {
      setMidCode("all");
    }
  }, [majorCode, midCode]);

  return (
    <>
      <FilterSelect
        id={majorId}
        label="대분류 업종"
        options={INDUSTRY_MAJOR_OPTIONS}
        value={majorCode}
        onChange={setMajorCode}
      />
      <FilterSelect
        id={midId}
        label="중분류 업종"
        options={midOptions}
        value={midCode}
        onChange={setMidCode}
      />
    </>
  );
}
