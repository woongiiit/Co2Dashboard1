import registryJson from "@/data/admin-boundary-revisions.json";
import type {
  AdminBoundaryRegistry,
  AdminBoundaryRevision,
  AdminRegionRef,
} from "@/lib/region-excel/admin-boundary-types";
import type { RegionExcelRow } from "@/lib/region-excel/types";

export const ADMIN_BOUNDARY_REGISTRY = registryJson as AdminBoundaryRegistry;

export const ADMIN_BOUNDARY_REVISIONS: AdminBoundaryRevision[] = [
  ...ADMIN_BOUNDARY_REGISTRY.revisions,
].sort((a, b) => a.effectiveYm.localeCompare(b.effectiveYm));

export function buildRegionLabel(ref: AdminRegionRef): string {
  if (ref.sidoNm === "세종특별자치시") return ref.sidoNm;
  return `${ref.sidoNm} ${ref.sggNm}`;
}

export function rowMatchesRef(row: RegionExcelRow, ref: AdminRegionRef): boolean {
  return row.sidoNm === ref.sidoNm && row.sggNm === ref.sggNm;
}

export function findRevisionForRow(
  row: RegionExcelRow,
): AdminBoundaryRevision | undefined {
  return ADMIN_BOUNDARY_REVISIONS.find((revision) => revisionMatchesRow(revision, row));
}

function revisionMatchesRow(
  revision: AdminBoundaryRevision,
  row: RegionExcelRow,
): boolean {
  switch (revision.type) {
    case "jurisdiction_transfer":
      return (
        (revision.from != null && rowMatchesRef(row, revision.from)) ||
        (revision.to != null && rowMatchesRef(row, revision.to))
      );
    case "split":
      return (
        (revision.parent != null && rowMatchesRef(row, revision.parent)) ||
        (revision.children?.some((child) => rowMatchesRef(row, child)) ?? false)
      );
    case "merge_split":
      return (
        (revision.fromUnits?.some((unit) => rowMatchesRef(row, unit)) ?? false) ||
        (revision.toUnits?.some((unit) => rowMatchesRef(row, unit)) ?? false)
      );
    default:
      return false;
  }
}
