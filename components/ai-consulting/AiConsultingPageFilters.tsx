"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { FilterPeriodRange } from "@/components/dashboard/FilterPeriodRange";
import {
  KOREA_SIDO_OPTIONS,
  getSigunguOptionsForSido,
} from "@/lib/korea-admin-regions";

const DEFAULT_SIDO = "39";
const DEFAULT_SIGUNGU = "제주특별자치도 제주시";

export function AiConsultingPageFilters() {
  const [sidoCode, setSidoCode] = useState(DEFAULT_SIDO);
  const [sigunguValue, setSigunguValue] = useState(DEFAULT_SIGUNGU);

  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(sidoCode),
    [sidoCode],
  );

  const skipSigunguReset = useRef(true);

  useEffect(() => {
    if (skipSigunguReset.current) {
      skipSigunguReset.current = false;
      return;
    }
    setSigunguValue("all");
  }, [sidoCode]);

  return (
    <>
      <FilterSelect
        id="ai-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        value={sidoCode}
        onChange={setSidoCode}
      />

      <label className="filter-control">
        <span className="filter-control__label">시군구</span>
        <select
          id="ai-sigungu"
          className="filter-control__select"
          value={sigunguValue}
          onChange={(e) => setSigunguValue(e.target.value)}
        >
          {sigunguOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <FilterPeriodRange idPrefix="ai-period" />
    </>
  );
}
