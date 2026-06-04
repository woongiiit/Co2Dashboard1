import type { CSSProperties } from "react";
import type { KpiItem } from "@/lib/mock-dashboard-data";
import { KpiCard } from "./KpiCard";

type KpiCardRowProps = {
  items: KpiItem[];
  /** Equal-width, equal-height cards (e.g. region detail 4 KPIs). */
  uniform?: boolean;
};

export function KpiCardRow({ items, uniform = false }: KpiCardRowProps) {
  const colCount = items.length;

  return (
    <div
      className={`kpi-row${uniform ? " kpi-row--uniform" : ""}`}
      style={
        uniform && colCount > 0
          ? ({ "--kpi-cols": colCount } as CSSProperties)
          : undefined
      }
      role="list"
    >
      {items.map((item) => (
        <div key={item.label} className="kpi-row__item" role="listitem">
          <KpiCard {...item} />
        </div>
      ))}
    </div>
  );
}
