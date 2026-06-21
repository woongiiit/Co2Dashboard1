type DeepAnalysisNoticeBoxProps = {
  items: string[];
};

export function DeepAnalysisNoticeBox({ items }: DeepAnalysisNoticeBoxProps) {
  return (
    <aside className="deep-analysis-notice" aria-label="데이터 안내">
      <h3 className="deep-analysis-notice__title">데이터 안내</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
