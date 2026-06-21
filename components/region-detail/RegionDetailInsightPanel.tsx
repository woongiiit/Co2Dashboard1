import Link from "next/link";
import type { RegionDetailInsightsSections } from "@/lib/region-excel/types";

type RegionDetailInsightPanelProps = {
  sections: RegionDetailInsightsSections;
  loading?: boolean;
  error?: string | null;
  footer?: string;
};

function InsightSection({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="region-detail-insight__section">
      <h3 className="region-detail-insight__heading">{heading}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function RegionDetailInsightPanel({
  sections,
  loading = false,
  error = null,
  footer,
}: RegionDetailInsightPanelProps) {
  return (
    <div className="region-detail-insight">
      <div className="region-detail-insight__badge" aria-hidden="true">
        AI
      </div>

      {loading ? (
        <p className="region-detail-insight__loading" aria-live="polite">
          Hugging Face API로 지역 인사이트 생성 중…
        </p>
      ) : null}

      {error ? (
        <p className="region-detail-insight__error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading ? (
        <>
          <InsightSection heading="지역 평가" items={sections.evaluation} />
          <InsightSection heading="여행자 시사점" items={sections.traveler} />
          <InsightSection heading="지자체 시사점" items={sections.policy} />
        </>
      ) : null}

      {footer ? (
        <p className="region-detail-insight__meta">{footer}</p>
      ) : null}

      <Link href="/ai-consulting" className="region-detail-insight__cta">
        지역 맞춤 개선 제안 보기 &gt;
      </Link>
    </div>
  );
}
