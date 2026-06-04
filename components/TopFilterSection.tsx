import type { ReactNode } from "react";

type TopFilterSectionProps = {
  children: ReactNode;
};

export function TopFilterSection({ children }: TopFilterSectionProps) {
  return (
    <section className="top-filter" aria-label="검색 및 필터">
      <p className="top-filter__label">검색 / 필터 (임시)</p>
      <div className="top-filter__controls">{children}</div>
    </section>
  );
}
