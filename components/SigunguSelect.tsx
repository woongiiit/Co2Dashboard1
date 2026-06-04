"use client";

import { useRouter } from "next/navigation";
import { SIGUNGU_OPTIONS } from "@/lib/sigungu-options";
import { regionDetailPath } from "@/lib/region-routes";

type SigunguSelectProps = {
  /** Pre-select when on a detail route. */
  value?: string;
};

export function SigunguSelect({ value }: SigunguSelectProps) {
  const router = useRouter();

  return (
    <label className="filter-control">
      <span className="filter-control__label">시군구</span>
      <select
        className="filter-control__select"
        defaultValue={value ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) return;
          router.push(regionDetailPath(value));
        }}
      >
        <option value="" disabled>
          시군구를 선택하세요
        </option>
        {SIGUNGU_OPTIONS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
