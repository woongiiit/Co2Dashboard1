"use client";

import { useState, type ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export function DashboardCard({
  title,
  description,
  children,
  className = "",
  footer,
  collapsible = false,
  defaultCollapsed = false,
}: DashboardCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const bodyId = `dashboard-card-body-${title.replace(/\s+/g, "-")}`;

  return (
    <section
      className={`dashboard-card ${collapsed ? "dashboard-card--collapsed" : ""} ${className}`.trim()}
    >
      <header className="dashboard-card__header">
        <div className="dashboard-card__header-main">
          <div className="dashboard-card__header-text">
            <h2 className="dashboard-card__title">{title}</h2>
            {description && !collapsed ? (
              <p className="dashboard-card__description">{description}</p>
            ) : null}
          </div>
          {collapsible ? (
            <button
              type="button"
              className="dashboard-card__toggle"
              aria-expanded={!collapsed}
              aria-controls={bodyId}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? "펼치기" : "접기"}
              <span className="dashboard-card__toggle-icon" aria-hidden="true">
                {collapsed ? "▾" : "▴"}
              </span>
            </button>
          ) : null}
        </div>
      </header>
      {!collapsed ? (
        <div id={bodyId} className="dashboard-card__body">
          {children}
        </div>
      ) : null}
      {!collapsed && footer ? (
        <footer className="dashboard-card__footer">{footer}</footer>
      ) : null}
    </section>
  );
}
