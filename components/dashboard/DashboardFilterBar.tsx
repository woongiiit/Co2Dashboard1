import type { ReactNode } from "react";

type DashboardFilterBarProps = {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
};

export function DashboardFilterBar({
  children,
  title = "검색 · 필터",
  actions,
}: DashboardFilterBarProps) {
  return (
    <section className="dashboard-filter" aria-label="검색 및 필터">
      <div className="dashboard-filter__head">
        <h2 className="dashboard-filter__title">{title}</h2>
        {actions ? (
          <div className="dashboard-filter__actions">{actions}</div>
        ) : null}
      </div>
      <div className="dashboard-filter__controls">{children}</div>
    </section>
  );
}
