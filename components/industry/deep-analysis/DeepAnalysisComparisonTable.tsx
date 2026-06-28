import type { IndustryDeepAnalysisComparisonRow } from "@/lib/industry-excel/types";

type DeepAnalysisComparisonTableProps = {
  rows: IndustryDeepAnalysisComparisonRow[];
};

function formatChangeDisplay(
  text: string,
  direction: "up" | "down" | "neutral",
): string {
  if (direction === "neutral" || text === "—" || text === "0.0%") {
    return text;
  }

  const arrow = direction === "up" ? "▲" : "▼";
  const value = text.startsWith("+") || text.startsWith("-") ? text : `+${text}`;
  return `${arrow} ${value}`;
}

function changeClassName(direction: "up" | "down" | "neutral"): string {
  if (direction === "down") return "deep-analysis-table__change deep-analysis-table__change--down";
  if (direction === "up") return "deep-analysis-table__change deep-analysis-table__change--up";
  return "deep-analysis-table__change";
}

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
    <div className="deep-analysis-table-wrap">
      <table className="deep-analysis-table">
        <thead>
          <tr>
            <th scope="col">구분</th>
            <th scope="col">2023년</th>
            <th scope="col">2024년</th>
            <th scope="col">증감률 (전년 대비)</th>
            <th scope="col">2025년</th>
            <th scope="col">증감률 (전년 대비)</th>
            <th scope="col">2026.01~04</th>
            <th scope="col">전년 동기간 대비</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">
                {row.label}
                <span className="deep-analysis-table__unit">({row.unit})</span>
              </th>
              <td className="deep-analysis-table__num">{row.values.y2023}</td>
              <td className="deep-analysis-table__num">{row.values.y2024}</td>
              <td className={changeClassName(row.values.y2024Direction)}>
                {formatChangeDisplay(row.values.y2024Change, row.values.y2024Direction)}
              </td>
              <td className="deep-analysis-table__num">{row.values.y2025}</td>
              <td className={changeClassName(row.values.y2025Direction)}>
                {formatChangeDisplay(row.values.y2025Change, row.values.y2025Direction)}
              </td>
              <td className="deep-analysis-table__num">{row.values.y2026}</td>
              <td className={changeClassName(row.values.y2026Direction)}>
                {formatChangeDisplay(row.values.y2026Change, row.values.y2026Direction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="deep-analysis-table__note">
        ※ 2026년은 1~4월 누적 기준이며, 증감률은 전년 동기간(동월) 대비입니다.
      </p>
    </div>
  );
}
