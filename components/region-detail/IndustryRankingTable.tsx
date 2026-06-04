import { REGION_TOP_INDUSTRY_ROWS } from "@/lib/region-detail-mock";

export function IndustryRankingTable() {
  return (
    <div className="industry-ranking-table-wrap">
      <table className="industry-ranking-table">
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col">업종(중분류)</th>
            <th scope="col">탄소발자국</th>
            <th scope="col">비중</th>
          </tr>
        </thead>
        <tbody>
          {REGION_TOP_INDUSTRY_ROWS.map((row) => (
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.name}</td>
              <td className="industry-ranking-table__num">
                {row.value}
                <span className="industry-ranking-table__unit"> tCO₂eq</span>
              </td>
              <td className="industry-ranking-table__share">{row.share}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
