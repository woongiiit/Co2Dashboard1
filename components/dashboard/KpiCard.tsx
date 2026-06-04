import type { KpiItem } from "@/lib/mock-dashboard-data";
import { KpiCardIcon } from "./KpiCardIcon";

type KpiCardProps = KpiItem;

export function KpiCard({
  label,
  value,
  unit,
  change,
  changeDirection = "neutral",
  hint,
  icon,
  iconSrc,
  unitOnLabel = false,
  unitOnValue = false,
  valueTone = "neutral",
}: KpiCardProps) {
  const changeClass =
    changeDirection === "up"
      ? "kpi-card__change--up"
      : changeDirection === "down"
        ? "kpi-card__change--down"
        : "";

  const resolvedValueTone =
    valueTone !== "neutral"
      ? valueTone
      : changeDirection !== "neutral" && !change
        ? changeDirection
        : "neutral";

  const valueToneClass =
    resolvedValueTone === "up"
      ? "kpi-card__value--up"
      : resolvedValueTone === "down"
        ? "kpi-card__value--down"
        : "";

  const showValueArrow =
    resolvedValueTone === "up" || resolvedValueTone === "down";

  const showUnitBesideValue =
    unit &&
    (icon
      ? !unitOnLabel
      : unitOnValue || (!unitOnLabel && !icon));

  if (icon) {
    return (
      <article className="kpi-card kpi-card--rich">
        <div className="kpi-card__head">
          <span
            className={`kpi-card__icon kpi-card__icon--${icon}${iconSrc ? " kpi-card__icon--image" : ""}`}
            aria-hidden="true"
          >
            <KpiCardIcon variant={icon} src={iconSrc} />
          </span>
          <div className="kpi-card__label-wrap">
            <p className="kpi-card__label">{label}</p>
            {unit && unitOnLabel ? (
              <p className="kpi-card__unit-label">{unit}</p>
            ) : null}
          </div>
        </div>

        <div className="kpi-card__body">
          <p className={`kpi-card__value ${valueToneClass}`.trim()}>
            {showValueArrow ? (
              <span className="kpi-card__arrow" aria-hidden="true">
                {resolvedValueTone === "up" ? "▲ " : "▼ "}
              </span>
            ) : null}
            <span className="kpi-card__number">{value}</span>
            {showUnitBesideValue ? (
              <span className="kpi-card__unit">{unit}</span>
            ) : null}
          </p>

          {(change || hint) && (
            <div className="kpi-card__meta">
              {change ? (
                <p className={`kpi-card__change ${changeClass}`}>
                  {changeDirection === "up"
                    ? "▲ "
                    : changeDirection === "down"
                      ? "▼ "
                      : ""}
                  {change}
                </p>
              ) : null}
              {hint ? <p className="kpi-card__hint">{hint}</p> : null}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="kpi-card">
      <p className="kpi-card__label">{label}</p>

      <p className={`kpi-card__value ${valueToneClass}`.trim()}>
        {showValueArrow ? (
          <span className="kpi-card__arrow" aria-hidden="true">
            {resolvedValueTone === "up" ? "▲ " : "▼ "}
          </span>
        ) : null}
        <span className="kpi-card__number">{value}</span>
        {showUnitBesideValue ? (
          <span className="kpi-card__unit">{unit}</span>
        ) : null}
      </p>

      <div className="kpi-card__meta">
        {change ? (
          <p className={`kpi-card__change ${changeClass}`}>
            {changeDirection === "up"
              ? "▲ "
              : changeDirection === "down"
                ? "▼ "
                : ""}
            {change}
          </p>
        ) : null}
        {hint ? <p className="kpi-card__hint">{hint}</p> : null}
      </div>
    </article>
  );
}
