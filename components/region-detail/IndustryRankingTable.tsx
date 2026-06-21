import type { TableRow } from "@/lib/mock-dashboard-data";

type IndustryRankingTableProps = {
  rows: TableRow[];
};

export function IndustryRankingTable({ rows }: IndustryRankingTableProps) {
  if (rows.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        업종 순위 데이터가 없습니다.
      </p>
    );
  }

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
          {rows.map((row) => (
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.name}</td>
              <td className="industry-ranking-table__num">
                {row.value}
                <span className="industry-ranking-table__unit"> tCO₂eq</span>
              </td>
              <td className="industry-ranking-table__share">{row.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
