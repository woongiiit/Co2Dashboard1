import type { IndustryDeepAnalysisComparisonRow } from "@/lib/industry-excel/types";

type DeepAnalysisComparisonTableProps = {
  rows: IndustryDeepAnalysisComparisonRow[];
};

export function DeepAnalysisComparisonTable({
  rows,
}: DeepAnalysisComparisonTableProps) {
  if (rows.length === 0) {
    return (
      <p className="dashboard-empty" role="status">
        비교 지표 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="deep-analysis-comparison-table-wrap">
      <table className="deep-analysis-comparison-table">
        <thead>
          <tr>
            <th scope="col">지표</th>
            <th scope="col">단위</th>
            <th scope="col">2023</th>
            <th scope="col">2024</th>
            <th scope="col">증감</th>
            <th scope="col">2025</th>
            <th scope="col">증감</th>
            <th scope="col">2026</th>
            <th scope="col">증감</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.unit}</td>
              <td>{row.values.y2023}</td>
              <td>{row.values.y2024}</td>
              <td
                className={
                  row.values.y2024Direction === "down"
                    ? "deep-analysis-comparison-table__down"
                    : "deep-analysis-comparison-table__up"
                }
              >
                {row.values.y2024Change}
              </td>
              <td>{row.values.y2025}</td>
              <td
                className={
                  row.values.y2025Direction === "down"
                    ? "deep-analysis-comparison-table__down"
                    : "deep-analysis-comparison-table__up"
                }
              >
                {row.values.y2025Change}
              </td>
              <td>{row.values.y2026}</td>
              <td
                className={
                  row.values.y2026Direction === "down"
                    ? "deep-analysis-comparison-table__down"
                    : "deep-analysis-comparison-table__up"
                }
              >
                {row.values.y2026Change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
