"use client";

import { useCallback, useState } from "react";
import { CoverNavigationOverlay } from "@/components/cover/CoverNavigationOverlay";
import { CoverRoutePrefetch } from "@/components/cover/CoverRoutePrefetch";
import { HeroCard } from "@/components/cover/HeroCard";
import { COVER_NAV_ITEMS } from "@/lib/cover-nav-items";

export function CoverHero() {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
  }, []);

  return (
    <section className="hero" aria-label="관광행동 기반 탄소발자국 대시보드">
      <CoverRoutePrefetch />
      {isNavigating ? <CoverNavigationOverlay /> : null}
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-title__line">관광행동 기반</span>
          <span className="hero-title__line">탄소발자국 대시보드</span>
        </h1>
        <nav className="hero-cards" aria-label="메인 메뉴">
          {COVER_NAV_ITEMS.map((item) => (
            <HeroCard
              key={item.href}
              href={item.href}
              icon={item.icon}
              iconSrc={item.iconSrc}
              title={item.title}
              subtitleLines={item.subtitleLines}
              onNavigateStart={handleNavigateStart}
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
