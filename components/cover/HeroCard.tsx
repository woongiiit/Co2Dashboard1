"use client";

import Link from "next/link";
import type { CoverNavIconVariant } from "@/components/cover/CoverNavIcon";

const COVER_NAV_ICON_SIZE = 1254;

type HeroCardProps = {
  href: string;
  icon: CoverNavIconVariant;
  iconSrc: string;
  title: string;
  subtitleLines: readonly string[];
  onNavigateStart?: () => void;
};

export function HeroCard({
  href,
  icon,
  iconSrc,
  title,
  subtitleLines,
  onNavigateStart,
}: HeroCardProps) {
  const titleId = `hero-card-title-${href.replace(/\//g, "") || "home"}`;

  return (
    <Link
      href={href}
      className="hero-card"
      aria-labelledby={titleId}
      onClick={() => onNavigateStart?.()}
    >
      <span
        className={`hero-card__icon button-icon-box button-icon-box--${icon}`}
        aria-hidden="true"
      >
        <img
          className="button-icon-box__image"
          src={iconSrc}
          alt=""
          width={COVER_NAV_ICON_SIZE}
          height={COVER_NAV_ICON_SIZE}
          decoding="async"
        />
      </span>
      <span id={titleId} className="hero-card__title">
        {title}
      </span>
      <span className="hero-card__subtitle">
        {subtitleLines.map((line) => (
          <span key={line} className="hero-card__subtitle-line">
            {line}
          </span>
        ))}
      </span>
    </Link>
  );
}
