import type { TableRow } from "@/lib/mock-dashboard-data";

type PlaceholderTableProps = {
  columns: string[];
  rows: TableRow[];
  valueLabel?: string;
};

export function PlaceholderTable({
  columns,
  rows,
  valueLabel = "탄소발자국",
}: PlaceholderTableProps) {
  return (
    <div className="placeholder-table-wrap">
      <table className="placeholder-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.name}</td>
              <td className="placeholder-table__num">
                {row.value}
                <span className="placeholder-table__unit"> tCO₂eq</span>
              </td>
              {row.change !== undefined ? (
                <td className="placeholder-table__change">▲ {row.change}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="placeholder-table__note">
        * {valueLabel} 기준 임시 순위 데이터입니다.
      </p>
    </div>
  );
}
