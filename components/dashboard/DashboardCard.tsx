import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

export function DashboardCard({
  title,
  description,
  children,
  className = "",
  footer,
}: DashboardCardProps) {
  return (
    <section className={`dashboard-card ${className}`.trim()}>
      <header className="dashboard-card__header">
        <h2 className="dashboard-card__title">{title}</h2>
        {description ? (
          <p className="dashboard-card__description">{description}</p>
        ) : null}
      </header>
      <div className="dashboard-card__body">{children}</div>
      {footer ? <footer className="dashboard-card__footer">{footer}</footer> : null}
    </section>
  );
}
