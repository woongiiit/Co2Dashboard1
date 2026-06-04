import {
  CoverNavIcon,
  type CoverNavIconVariant,
} from "@/components/cover/CoverNavIcon";
import { getCoverNavIconSrc } from "@/lib/cover-nav-items";

/** cover/nav/icons PNG intrinsic size (CoverNavButton과 동일) */
const COVER_NAV_ICON_SIZE = 1254;

type DashboardPageHeaderProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: CoverNavIconVariant;
};

export function DashboardPageHeader({
  title,
  subtitle,
  meta,
  icon,
}: DashboardPageHeaderProps) {
  const iconSrc = icon ? getCoverNavIconSrc(icon) : undefined;

  return (
    <header className="dashboard-page-header">
      <div className="dashboard-page-header__text">
        <h1 className="dashboard-page-header__title">
          {icon ? (
            <span
              className={`dashboard-page-header__icon dashboard-page-header__icon--${icon}`}
              aria-hidden="true"
            >
              {iconSrc ? (
                <img
                  className="dashboard-page-header__icon-img"
                  src={iconSrc}
                  alt=""
                  width={COVER_NAV_ICON_SIZE}
                  height={COVER_NAV_ICON_SIZE}
                  decoding="async"
                />
              ) : (
                <CoverNavIcon variant={icon} />
              )}
            </span>
          ) : null}
          <span>{title}</span>
        </h1>
        {subtitle ? (
          <p className="dashboard-page-header__subtitle">{subtitle}</p>
        ) : null}
      </div>
      {meta ? <p className="dashboard-page-header__meta">{meta}</p> : null}
    </header>
  );
}
