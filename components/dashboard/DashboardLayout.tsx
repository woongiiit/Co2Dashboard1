import Link from "next/link";
import type { ReactNode } from "react";

export type DashboardActiveNav = "region" | "industry" | "ai-consulting";

type DashboardLayoutProps = {
  children: ReactNode;
  /** @deprecated Use `theme="eco"` with `activeNav` */
  theme?: "default" | "eco" | "region";
  activeNav?: DashboardActiveNav;
};

export function DashboardLayout({
  children,
  theme = "default",
  activeNav,
}: DashboardLayoutProps) {
  const isEco = theme === "eco" || theme === "region";
  const resolvedActiveNav =
    activeNav ?? (theme === "region" ? "region" : undefined);

  return (
    <div
      className={isEco ? "dashboard dashboard--eco" : "dashboard"}
      data-active-nav={resolvedActiveNav}
    >
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__inner">
          <Link href="/" className="dashboard-topbar__brand">
            관광행동 기반 탄소발자국 대시보드
          </Link>
          <nav className="dashboard-topbar__nav" aria-label="주요 메뉴">
            <Link
              href="/region"
              aria-current={resolvedActiveNav === "region" ? "page" : undefined}
            >
              지역 중심
            </Link>
            <Link
              href="/industry"
              aria-current={
                resolvedActiveNav === "industry" ? "page" : undefined
              }
            >
              업종 중심
            </Link>
            <Link
              href="/ai-consulting"
              aria-current={
                resolvedActiveNav === "ai-consulting" ? "page" : undefined
              }
            >
              AI 컨설팅
            </Link>
          </nav>
        </div>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
