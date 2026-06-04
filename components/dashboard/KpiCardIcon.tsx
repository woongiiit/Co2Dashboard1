"use client";

import { useState } from "react";
import { KpiIcon, type KpiIconVariant } from "./KpiIcon";

type KpiCardIconProps = {
  variant: KpiIconVariant;
  src?: string;
};

export function KpiCardIcon({ variant, src }: KpiCardIconProps) {
  const [useFallback, setUseFallback] = useState(!src);

  if (src && !useFallback) {
    return (
      <img
        className="kpi-card__icon-img"
        src={src}
        alt=""
        width={48}
        height={48}
        decoding="async"
        onError={() => setUseFallback(true)}
      />
    );
  }

  return <KpiIcon variant={variant} />;
}
