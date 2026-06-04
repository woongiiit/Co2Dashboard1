"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterSelect } from "@/components/dashboard/FilterSelect";
import { IndustryClassificationFilters } from "@/components/industry/IndustryClassificationFilters";
import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
  KOREA_SIDO_OPTIONS,
  YEAR_MONTH_OPTIONS,
  getSigunguOptionsForSido,
} from "@/lib/korea-admin-regions";

export function IndustryPageFilters() {
  const [sidoCode, setSidoCode] = useState("all");
  const [sigunguValue, setSigunguValue] = useState("all");
  const [periodStart, setPeriodStart] = useState(DEFAULT_PERIOD_START);
  const [periodEnd, setPeriodEnd] = useState(DEFAULT_PERIOD_END);
  const sigunguOptions = useMemo(
    () => getSigunguOptionsForSido(sidoCode),
    [sidoCode],
  );

  const endPeriodOptions = useMemo(
    () => YEAR_MONTH_OPTIONS.filter((option) => option.value >= periodStart),
    [periodStart],
  );

  useEffect(() => {
    setSigunguValue("all");
  }, [sidoCode]);

  useEffect(() => {
    if (periodEnd < periodStart) {
      setPeriodEnd(periodStart);
    }
  }, [periodStart, periodEnd]);

  return (
    <>
      <FilterSelect
        id="industry-sido"
        label="시도"
        options={KOREA_SIDO_OPTIONS}
        defaultValue="all"
        onChange={(value) => setSidoCode(value)}
      />

      <label className="filter-control">
        <span className="filter-control__label">시군구</span>
        <select
          id="industry-sigungu"
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
      <div className="filter-period-range">
        <span className="filter-period-range__label">기간</span>
        <div className="filter-period-range__controls">
          <label className="filter-control filter-control--inline" htmlFor="industry-period-start">
            <span className="visually-hidden">시작 연월</span>
            <select
              id="industry-period-start"
              className="filter-control__select"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            >
              {YEAR_MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <span className="filter-period-range__sep" aria-hidden="true">
            ~
          </span>
          <label className="filter-control filter-control--inline" htmlFor="industry-period-end">
            <span className="visually-hidden">종료 연월</span>
            <select
              id="industry-period-end"
              className="filter-control__select"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            >
              {endPeriodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <IndustryClassificationFilters />
    </>
  );
}
