export function PlaceholderMap() {
  return (
    <div className="placeholder-map" role="img" aria-label="지도 영역 (구현 예정)">
      <div className="placeholder-map__regions" aria-hidden="true">
        <span className="placeholder-map__region placeholder-map__region--high" />
        <span className="placeholder-map__region placeholder-map__region--mid" />
        <span className="placeholder-map__region placeholder-map__region--low" />
        <span className="placeholder-map__region placeholder-map__region--mid" />
        <span className="placeholder-map__region placeholder-map__region--high" />
      </div>
      <p className="placeholder-map__caption">
        MapLibre 지도가 이 영역에 연결됩니다. 지도를 클릭하여 시도·시군구를 선택할 수
        있습니다.
      </p>
      <ul className="placeholder-map__legend" aria-label="범례 (임시)">
        <li>
          <span className="placeholder-map__swatch placeholder-map__swatch--high" />
          50만 tCO₂eq 이상
        </li>
        <li>
          <span className="placeholder-map__swatch placeholder-map__swatch--mid" />
          20만 ~ 50만
        </li>
        <li>
          <span className="placeholder-map__swatch placeholder-map__swatch--low" />
          20만 미만
        </li>
      </ul>
    </div>
  );
}
