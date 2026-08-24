"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl, {
  type MapLayerMouseEvent,
  type Map as MaplibreMap,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEFAULT_MAP_STYLE,
  buildCarbonFillColorExpression,
  findSigunguFeatureByLabel,
  formatCo2,
  getGeometryBounds,
  loadMunicipalitiesGeoJson,
  type SigunguGeoFeature,
} from "@/lib/sigungu-map";
import { regionDetailPath } from "@/lib/region-routes";

const SOURCE_ID = "region-detail-sigungu";
const FILL_LAYER_ID = "region-detail-carbon-fill";
const BASE_LINE_ID = "region-detail-base-line";
const SELECT_LINE_ID = "region-detail-select-line";
const HOVER_LAYER_ID = "region-detail-hover-line";

type RegionDetailMapProps = {
  regionLabel: string;
  carbonByLabel?: Record<string, number>;
};

export function RegionDetailMap({
  regionLabel,
  carbonByLabel,
}: RegionDetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const selectedCodeRef = useRef<string>("");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCo2, setSelectedCo2] = useState<number | null>(null);

  const fillColorExpression = useMemo(() => buildCarbonFillColorExpression(), []);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    const map = new maplibregl.Map({
      container,
      style: DEFAULT_MAP_STYLE,
      center: [127.9, 36.2],
      zoom: 7,
      minZoom: 5,
      maxZoom: 14,
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: "carbon-map-popup",
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const showHover = (feature: SigunguGeoFeature, lngLat: maplibregl.LngLatLike) => {
      map.setFilter(HOVER_LAYER_ID, ["==", ["get", "code"], feature.properties.code]);
      map.getCanvas().style.cursor = "pointer";

      const html = `
        <strong>${feature.properties.label}</strong><br/>
        총 관광 탄소발자국: ${formatCo2(feature.properties.co2)} tCO₂eq
      `;
      popupRef.current?.setLngLat(lngLat).setHTML(html).addTo(map);
    };

    const clearHover = () => {
      map.setFilter(HOVER_LAYER_ID, ["==", ["get", "code"], ""]);
      map.getCanvas().style.cursor = "";
      popupRef.current?.remove();
    };

    const setupLayers = async () => {
      try {
        const geojson = await loadMunicipalitiesGeoJson(carbonByLabel);
        if (cancelled) return;

        const selected = findSigunguFeatureByLabel(geojson.features, regionLabel);
        selectedCodeRef.current = selected?.properties.code ?? "";

        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: FILL_LAYER_ID,
            type: "fill",
            source: SOURCE_ID,
            paint: {
              "fill-color": fillColorExpression as maplibregl.ExpressionSpecification,
              "fill-opacity": 0.4,
            },
          });

          map.addLayer({
            id: BASE_LINE_ID,
            type: "line",
            source: SOURCE_ID,
            paint: {
              "line-color": "#ffffff",
              "line-width": 0.6,
              "line-opacity": 0.85,
            },
          });

          map.addLayer({
            id: HOVER_LAYER_ID,
            type: "line",
            source: SOURCE_ID,
            filter: ["==", ["get", "code"], ""],
            paint: {
              "line-color": "#0f172a",
              "line-width": 2,
            },
          });

          map.addLayer({
            id: SELECT_LINE_ID,
            type: "line",
            source: SOURCE_ID,
            filter: ["==", ["get", "code"], ""],
            paint: {
              "line-color": "#1e40af",
              "line-width": 2.5,
            },
          });

          map.on("mousemove", FILL_LAYER_ID, (e: MapLayerMouseEvent) => {
            const feature = e.features?.[0] as SigunguGeoFeature | undefined;
            if (!feature || !e.lngLat) return;
            showHover(feature, e.lngLat);
          });

          map.on("mouseleave", FILL_LAYER_ID, clearHover);

          map.on("click", FILL_LAYER_ID, (e: MapLayerMouseEvent) => {
            const feature = e.features?.[0] as SigunguGeoFeature | undefined;
            if (!feature) return;
            if (feature.properties.label === regionLabel) return;
            router.push(regionDetailPath(feature.properties.label));
          });
        } else {
          const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
          source.setData(geojson);
          if (map.getLayer(FILL_LAYER_ID)) {
            map.setPaintProperty(
              FILL_LAYER_ID,
              "fill-color",
              fillColorExpression as maplibregl.ExpressionSpecification,
            );
          }
        }

        map.setFilter(SELECT_LINE_ID, [
          "==",
          ["get", "code"],
          selectedCodeRef.current,
        ]);
        clearHover();

        if (selected) {
          const co2 = carbonByLabel?.[regionLabel] ?? selected.properties.co2;
          setSelectedCo2(co2 > 0 ? co2 : null);
          const bounds = getGeometryBounds(selected.geometry);
          if (bounds) {
            map.fitBounds(bounds, { padding: 48, duration: 200, maxZoom: 11 });
          }
        } else {
          setSelectedCo2(null);
          map.fitBounds(
            [
              [124.5, 33.0],
              [131.2, 38.7],
            ],
            { padding: 24, duration: 0 },
          );
        }

        setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "지도 데이터를 불러오지 못했습니다.",
          );
        }
      }
    };

    map.on("load", setupLayers);

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [regionLabel, carbonByLabel, fillColorExpression, router]);

  return (
    <div className="region-detail-map__maplibre">
      <div
        ref={containerRef}
        className="region-detail-map__maplibre-canvas"
        role="application"
        aria-label={`${regionLabel} 위치 지도`}
      />
      {status === "loading" ? (
        <div className="region-detail-map__overlay" aria-live="polite">
          지도를 불러오는 중…
        </div>
      ) : null}
      {status === "error" ? (
        <div
          className="region-detail-map__overlay region-detail-map__overlay--error"
          role="alert"
        >
          {errorMessage ?? "지도를 표시할 수 없습니다."}
        </div>
      ) : null}
      {status === "ready" && selectedCo2 != null ? (
        <p className="region-detail-map__map-caption">
          선택 지역: <strong>{regionLabel}</strong>
          <span className="region-detail-map__map-caption-co2">
            {formatCo2(selectedCo2)} tCO₂eq
          </span>
        </p>
      ) : null}
    </div>
  );
}
