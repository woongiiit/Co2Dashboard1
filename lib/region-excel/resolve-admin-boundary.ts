import {
  ADMIN_BOUNDARY_REVISIONS,
  buildRegionLabel,
  findRevisionForRow,
  rowMatchesRef,
} from "@/lib/region-excel/admin-boundary-registry";
import type {
  AdminBoundaryNotice,
  AdminBoundaryRevision,
  AdminRegionRef,
  CompareReliability,
  TrendRevisionMarker,
} from "@/lib/region-excel/admin-boundary-types";
import type { RegionExcelRow } from "@/lib/region-excel/types";

/** 월별 실제 행정단위 기준 — 해당 ym에 유효한 행만 포함 */
export function isRowValidAtYm(row: RegionExcelRow, ym: string): boolean {
  const revision = findRevisionForRow(row);
  if (!revision) return true;

  switch (revision.type) {
    case "jurisdiction_transfer": {
      const before = ym < revision.effectiveYm;
      if (before) {
        return revision.from != null && rowMatchesRef(row, revision.from);
      }
      return revision.to != null && rowMatchesRef(row, revision.to);
    }
    case "split": {
      const before = ym < revision.effectiveYm;
      if (before) {
        return revision.parent != null && rowMatchesRef(row, revision.parent);
      }
      return revision.children?.some((child) => rowMatchesRef(row, child)) ?? false;
    }
    case "merge_split": {
      const before = ym < revision.effectiveYm;
      if (before) {
        return revision.fromUnits?.some((unit) => rowMatchesRef(row, unit)) ?? false;
      }
      return revision.toUnits?.some((unit) => rowMatchesRef(row, unit)) ?? false;
    }
    default:
      return true;
  }
}

/** 기간 종료 시점(as-of)에 존재하는 표시 라벨 */
export function resolveDisplayLabel(row: RegionExcelRow, asOfYm: string): string {
  const revision = findRevisionForRow(row);

  if (revision?.type === "jurisdiction_transfer" && revision.to) {
    const useTo = asOfYm >= revision.effectiveYm;
    if (useTo) {
      return buildRegionLabel(revision.to);
    }
    if (revision.from && rowMatchesRef(row, revision.from)) {
      return buildRegionLabel(revision.from);
    }
  }

  return row.regionLabel;
}

export function getStableRegionKey(row: RegionExcelRow): string | null {
  const revision = findRevisionForRow(row);
  if (revision?.stableRegionId) return revision.stableRegionId;
  return null;
}

/** KPI·추세용 — 기간 내 월별 유효 행만 (이중 집계 방지) */
export function filterRowsPointInTime(rows: RegionExcelRow[]): RegionExcelRow[] {
  return rows.filter((row) => isRowValidAtYm(row, row.ym));
}

function isLabelActiveAtYm(label: string, ym: string): boolean {
  for (const revision of ADMIN_BOUNDARY_REVISIONS) {
    const activeRefs = getActiveRegionRefsAtYm(revision, ym);
    if (activeRefs.some((ref) => buildRegionLabel(ref) === label)) {
      return true;
    }
  }

  return !ADMIN_BOUNDARY_REVISIONS.some((revision) =>
    getAllRevisionLabels(revision).includes(label),
  );
}

function getAllRevisionLabels(revision: AdminBoundaryRevision): string[] {
  switch (revision.type) {
    case "jurisdiction_transfer":
      return [revision.from, revision.to]
        .filter((ref): ref is AdminRegionRef => ref != null)
        .map(buildRegionLabel);
    case "split":
      return [
        ...(revision.parent ? [buildRegionLabel(revision.parent)] : []),
        ...(revision.children?.map(buildRegionLabel) ?? []),
      ];
    case "merge_split":
      return [
        ...(revision.fromUnits?.map(buildRegionLabel) ?? []),
        ...(revision.toUnits?.map(buildRegionLabel) ?? []),
      ];
    default:
      return [];
  }
}

function getActiveRegionRefsAtYm(
  revision: AdminBoundaryRevision,
  ym: string,
): AdminRegionRef[] {
  const before = ym < revision.effectiveYm;

  switch (revision.type) {
    case "jurisdiction_transfer":
      if (before && revision.from) return [revision.from];
      if (!before && revision.to) return [revision.to];
      return [];
    case "split":
      if (before && revision.parent) return [revision.parent];
      if (!before) return revision.children ?? [];
      return [];
    case "merge_split":
      if (before) return revision.fromUnits ?? [];
      return revision.toUnits ?? [];
    default:
      return [];
  }
}

/** 지도·순위용 — 기간 종료 시점 경계 + 월별 유효 행, 관할 변경은 stable 키로 통합 */
export function aggregateByDisplayLabel(
  rows: RegionExcelRow[],
  asOfYm: string,
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of rows) {
    if (!isRowValidAtYm(row, row.ym)) continue;

    const stableKey = getStableRegionKey(row);
    let displayLabel: string;

    if (stableKey) {
      displayLabel = resolveStableToDisplayLabel(stableKey, asOfYm);
    } else {
      displayLabel = resolveDisplayLabel(row, asOfYm);
      if (!isLabelActiveAtYm(displayLabel, asOfYm)) continue;
    }

    totals.set(displayLabel, (totals.get(displayLabel) ?? 0) + row.carbonRaw);
  }

  return totals;
}

function resolveStableToDisplayLabel(stableRegionId: string, asOfYm: string): string {
  const revision = ADMIN_BOUNDARY_REVISIONS.find(
    (item) => item.stableRegionId === stableRegionId,
  );

  if (revision?.type === "jurisdiction_transfer") {
    const ref = asOfYm >= revision.effectiveYm ? revision.to : revision.from;
    if (ref) return buildRegionLabel(ref);
  }

  return stableRegionId;
}

export function buildMapByLabelFromRows(
  rows: RegionExcelRow[],
  periodEnd: string,
  toTco2eq: (raw: number) => number,
): Record<string, number> {
  const totals = aggregateByDisplayLabel(rows, periodEnd);
  const result: Record<string, number> = {};

  for (const [label, rawTotal] of totals.entries()) {
    result[label] = toTco2eq(rawTotal);
  }

  return result;
}

export function countRegionsAsOfEnd(rows: RegionExcelRow[], periodEnd: string): number {
  return aggregateByDisplayLabel(rows, periodEnd).size;
}

/** 순위 비교 — stableRegionId로 관할 변경 전후 매칭 */
export function buildCompareAggregationKey(
  row: RegionExcelRow,
  currentPeriodEnd: string,
): string {
  const stableKey = getStableRegionKey(row);
  if (stableKey) {
    return resolveStableToDisplayLabel(stableKey, currentPeriodEnd);
  }

  const displayLabel = resolveDisplayLabel(row, currentPeriodEnd);
  if (isLabelActiveAtYm(displayLabel, currentPeriodEnd)) {
    return displayLabel;
  }

  return row.regionLabel;
}

export function detectRevisionsInRange(
  periodStart: string,
  periodEnd: string,
): AdminBoundaryNotice[] {
  return ADMIN_BOUNDARY_REVISIONS.filter(
    (revision) =>
      revision.effectiveYm >= periodStart && revision.effectiveYm <= periodEnd,
  ).map((revision) => ({
    id: revision.id,
    effectiveYm: revision.effectiveYm,
    title: revision.title,
    summary: revision.summary,
    scheduled: revision.scheduled,
  }));
}

export function detectCompareReliability(
  periodStart: string,
  periodEnd: string,
  compareStart: string,
  compareEnd: string,
): CompareReliability {
  const reasons: string[] = [];

  const currentRevisions = detectRevisionsInRange(periodStart, periodEnd);
  if (currentRevisions.length > 0) {
    reasons.push(
      `선택 기간(${periodStart}~${periodEnd})에 행정구역 개정 ${currentRevisions.length}건이 포함됩니다.`,
    );
  }

  for (const revision of ADMIN_BOUNDARY_REVISIONS) {
    if (revision.type !== "split" && revision.type !== "merge_split") continue;

    const eff = revision.effectiveYm;
    const crossesCurrent = periodStart < eff && periodEnd >= eff;
    const structureDiffers =
      (compareEnd < eff && periodEnd >= eff) || (compareEnd >= eff && periodEnd < eff);

    if (crossesCurrent) {
      reasons.push(
        `${revision.title}(${eff}): 선택 기간 내 개정 전·후 행정 단위가 혼재됩니다.`,
      );
    }

    if (structureDiffers) {
      reasons.push(
        `${revision.title}: 비교 기간과 현재 기간의 행정 단위 구조가 다릅니다.`,
      );
    }
  }

  for (const revision of ADMIN_BOUNDARY_REVISIONS) {
    if (revision.type !== "jurisdiction_transfer") continue;
    const eff = revision.effectiveYm;
    if (compareEnd < eff && periodEnd >= eff) {
      reasons.push(
        `${revision.title}: 비교 기간은 개정 이전, 현재 기간은 개정 이후 관할 기준입니다.`,
      );
    }
  }

  return {
    level: reasons.length > 0 ? "limited" : "ok",
    reasons: [...new Set(reasons)],
  };
}

export function buildTrendRevisionMarkers(): TrendRevisionMarker[] {
  return ADMIN_BOUNDARY_REVISIONS.map((revision) => {
    const month = Number(revision.effectiveYm.split("-")[1]) - 1;
    return {
      ym: revision.effectiveYm,
      monthIndex: month,
      label: revision.scheduled
        ? `${revision.title} (예정)`
        : revision.title,
    };
  }).filter((marker) => marker.monthIndex >= 0 && marker.monthIndex < 12);
}

export function buildBoundaryWarningMessages(
  periodStart: string,
  periodEnd: string,
  compareReliability: CompareReliability,
): string[] {
  const notices = detectRevisionsInRange(periodStart, periodEnd);
  const messages: string[] = [];

  if (notices.length > 0) {
    const items = notices
      .map((notice) => `${notice.title}(${notice.effectiveYm})`)
      .join(", ");
    messages.push(
      `선택 기간에 행정구역 개정 ${notices.length}건(${items})이 포함됩니다. 지도·순위는 ${periodEnd} 시점 경계 기준입니다.`,
    );
  }

  if (compareReliability.level === "limited") {
    messages.push(...compareReliability.reasons);
  }

  return [...new Set(messages)];
}
