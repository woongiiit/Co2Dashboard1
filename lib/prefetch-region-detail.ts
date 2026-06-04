import { regionDetailPath } from "@/lib/region-routes";

type PrefetchRouter = {
  prefetch: (href: string) => void;
};

const prefetched = new Set<string>();

/** Prefetch region detail route JS/RSC (deduped per label). */
export function prefetchRegionDetail(
  router: PrefetchRouter,
  sigunguLabel: string,
): void {
  if (!sigunguLabel || sigunguLabel === "all") return;
  const path = regionDetailPath(sigunguLabel);
  if (prefetched.has(path)) return;
  prefetched.add(path);
  router.prefetch(path);
}

export function prefetchRegionDetailBatch(
  router: PrefetchRouter,
  sigunguLabels: string[],
  limit = 5,
): void {
  for (const label of sigunguLabels.slice(0, limit)) {
    prefetchRegionDetail(router, label);
  }
}
