import Link from "next/link";
import type { ReactNode } from "react";

type NavigationCardProps = {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

export function NavigationCard({
  href,
  title,
  description,
  icon,
}: NavigationCardProps) {
  return (
    <Link href={href} className="nav-card">
      <span className="nav-card__icon" aria-hidden="true">
        {icon ?? "→"}
      </span>
      <span className="nav-card__content">
        <span className="nav-card__title">{title}</span>
        <span className="nav-card__description">{description}</span>
      </span>
    </Link>
  );
}
