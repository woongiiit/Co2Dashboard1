import type { TableRow } from "@/lib/mock-dashboard-data";

function parseCo2(value: string): number {
  return Number(value.replace(/,/g, "")) || 0;
}

type IndustryMidRankingPanelProps = {
  rows: TableRow[];
};

export function IndustryMidRankingPanel({ rows }: IndustryMidRankingPanelProps) {
  const maxValue = Math.max(...rows.map((row) => parseCo2(row.value)), 1);

  if (rows.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        중분류 순위 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="industry-mid-ranking">
      <table className="industry-mid-ranking__table">
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col">업종</th>
            <th
              scope="col"
              className="industry-mid-ranking__bar-head"
              aria-label="탄소발자국 규모"
            />
            <th scope="col">탄소발자국</th>
            <th scope="col">비중</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const numeric = parseCo2(row.value);
            const widthPct = Math.round((numeric / maxValue) * 100);
            return (
              <tr key={row.rank}>
                <td className="industry-mid-ranking__rank">{row.rank}</td>
                <td className="industry-mid-ranking__name">{row.name}</td>
                <td className="industry-mid-ranking__bar-cell">
                  <div className="industry-mid-ranking__bar-track">
                    <span
                      className="industry-mid-ranking__bar"
                      style={{ width: `${widthPct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </td>
                <td className="industry-mid-ranking__value-cell">
                  {row.value}
                  <span className="industry-mid-ranking__unit"> tCO₂eq</span>
                </td>
                <td className="industry-mid-ranking__share">{row.change}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
