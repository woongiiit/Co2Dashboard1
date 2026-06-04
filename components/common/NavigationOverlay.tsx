type NavigationOverlayProps = {
  message?: string;
};

export function NavigationOverlay({
  message = "페이지 이동 중입니다..",
}: NavigationOverlayProps) {
  return (
    <div
      className="nav-overlay"
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="nav-overlay__panel">
        <span className="nav-overlay__spinner" aria-hidden="true" />
        <p className="nav-overlay__message">{message}</p>
      </div>
    </div>
  );
}
