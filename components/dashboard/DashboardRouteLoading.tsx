type DashboardRouteLoadingProps = {
  title: string;
};

export function DashboardRouteLoading({ title }: DashboardRouteLoadingProps) {
  return (
    <div className="dashboard-route-loading" role="status" aria-live="polite">
      <p className="dashboard-route-loading__title">{title}</p>
      <p className="dashboard-route-loading__hint">화면을 준비하고 있습니다…</p>
      <div className="dashboard-route-loading__bar" aria-hidden="true">
        <span className="dashboard-route-loading__bar-fill" />
      </div>
    </div>
  );
}
