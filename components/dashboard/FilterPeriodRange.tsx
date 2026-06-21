"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PERIOD_END,
  DEFAULT_PERIOD_START,
  YEAR_MONTH_OPTIONS,
} from "@/lib/korea-admin-regions";

type FilterPeriodRangeProps = {
  /** Unique prefix for select ids, e.g. `region-period` → `region-period-start` */
  idPrefix: string;
  start?: string;
  end?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
};

export function FilterPeriodRange({
  idPrefix,
  start,
  end,
  onStartChange,
  onEndChange,
}: FilterPeriodRangeProps) {
  const [internalStart, setInternalStart] = useState(DEFAULT_PERIOD_START);
  const [internalEnd, setInternalEnd] = useState(DEFAULT_PERIOD_END);

  const periodStart = start ?? internalStart;
  const periodEnd = end ?? internalEnd;

  const endPeriodOptions = useMemo(
    () =>
      YEAR_MONTH_OPTIONS.filter((option) => option.value >= periodStart),
    [periodStart],
  );

  useEffect(() => {
    if (periodEnd < periodStart) {
      if (onEndChange) onEndChange(periodStart);
      else setInternalEnd(periodStart);
    }
  }, [periodStart, periodEnd, onEndChange]);

  const startId = `${idPrefix}-start`;
  const endId = `${idPrefix}-end`;

  return (
    <div className="filter-period-range">
      <span className="filter-period-range__label">기간</span>
      <div className="filter-period-range__controls">
        <label className="filter-control filter-control--inline" htmlFor={startId}>
          <span className="visually-hidden">시작 연월</span>
          <select
            id={startId}
            className="filter-control__select"
            value={periodStart}
            onChange={(e) => {
              const value = e.target.value;
              if (onStartChange) onStartChange(value);
              else setInternalStart(value);
            }}
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
        <label className="filter-control filter-control--inline" htmlFor={endId}>
          <span className="visually-hidden">종료 연월</span>
          <select
            id={endId}
            className="filter-control__select"
            value={periodEnd}
            onChange={(e) => {
              const value = e.target.value;
              if (onEndChange) onEndChange(value);
              else setInternalEnd(value);
            }}
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
  );
}
