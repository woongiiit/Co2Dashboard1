import { INDUSTRY_RANKING_ROWS } from "@/lib/mock-dashboard-data";

const MAX_VALUE = 3_842_116;

function formatCo2(value: string): number {
  return Number(value.replace(/,/g, ""));
}

export function IndustryMidRankingPanel() {
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
          {INDUSTRY_RANKING_ROWS.map((row) => {
            const numeric = formatCo2(row.value);
            const widthPct = Math.round((numeric / MAX_VALUE) * 100);
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
                <td className="industry-mid-ranking__share">▲ {row.change}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
