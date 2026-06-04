import Link from "next/link";

type RegionDetailInsightPanelProps = {
  regionLabel: string;
};

export function RegionDetailInsightPanel({ regionLabel }: RegionDetailInsightPanelProps) {
  return (
    <div className="region-detail-insight">
      <div className="region-detail-insight__badge" aria-hidden="true">
        AI
      </div>

      <section className="region-detail-insight__section">
        <h3 className="region-detail-insight__heading">지역 평가</h3>
        <ul>
          <li>
            {regionLabel}는 전년 대비 탄소발자국이 <strong>9.4% 증가</strong>했습니다.
          </li>
          <li>시도 내 18개 시군구 중 <strong>3위</strong>로 상위권에 해당합니다.</li>
        </ul>
      </section>

      <section className="region-detail-insight__section">
        <h3 className="region-detail-insight__heading">여행자 시사점</h3>
        <ul>
          <li>숙박과 음식점 이용이 지역 탄소의 <strong>54.4%</strong>를 차지합니다.</li>
          <li>대중교통 이용, 로컬 식당 선택으로 탄소를 줄일 수 있어요.</li>
          <li>7~8월 성수기에 탄소발자국이 크게 증가합니다.</li>
        </ul>
      </section>

      <section className="region-detail-insight__section">
        <h3 className="region-detail-insight__heading">지자체 시사점</h3>
        <ul>
          <li>숙박업·음식점업 대상 에너지 효율 개선이 필요합니다.</li>
          <li>대중교통 확대와 친환경 교통수단 확산을 권장합니다.</li>
          <li>성수기 집중 관리 및 관광객 분산 전략이 효과적입니다.</li>
        </ul>
      </section>

      <Link href="/ai-consulting" className="region-detail-insight__cta">
        지역 맞춤 개선 제안 보기 &gt;
      </Link>
    </div>
  );
}
