type DashboardScopeNoticeProps = {
  title: string;
  description: string;
};

export function DashboardScopeNotice({
  title,
  description,
}: DashboardScopeNoticeProps) {
  return (
    <aside className="dashboard-scope-notice" aria-label="집계 범위 안내">
      <p className="dashboard-scope-notice__title">{title}</p>
      <p className="dashboard-scope-notice__desc">{description}</p>
    </aside>
  );
}
