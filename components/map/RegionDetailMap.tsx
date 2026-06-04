"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEFAULT_MAP_STYLE,
  findSigunguFeatureByLabel,
  formatCo2,
  getGeometryBounds,
  loadMunicipalitiesGeoJson,
} from "@/lib/sigungu-map";

const SOURCE_ID = "region-detail-sigungu";
const BASE_FILL_ID = "region-detail-base-fill";
const BASE_LINE_ID = "region-detail-base-line";
const SELECT_FILL_ID = "region-detail-select-fill";
const SELECT_LINE_ID = "region-detail-select-line";

type RegionDetailMapProps = {
  regionLabel: string;
};

export function RegionDetailMap({ regionLabel }: RegionDetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const selectedCodeRef = useRef<string>("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCo2, setSelectedCo2] = useState<number | null>(null);

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
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const setupLayers = async () => {
      try {
        const geojson = await loadMunicipalitiesGeoJson();
        if (cancelled) return;

        const selected = findSigunguFeatureByLabel(geojson.features, regionLabel);
        selectedCodeRef.current = selected?.properties.code ?? "";

        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: BASE_FILL_ID,
            type: "fill",
            source: SOURCE_ID,
            paint: {
              "fill-color": "#e2e8f0",
              "fill-opacity": 0.9,
            },
          });

          map.addLayer({
            id: SELECT_FILL_ID,
            type: "fill",
            source: SOURCE_ID,
            filter: ["==", ["get", "code"], ""],
            paint: {
              "fill-color": "#2563eb",
              "fill-opacity": 0.75,
            },
          });

          map.addLayer({
            id: BASE_LINE_ID,
            type: "line",
            source: SOURCE_ID,
            paint: {
              "line-color": "#ffffff",
              "line-width": 0.8,
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
        } else {
          const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
          source.setData(geojson);
        }

        map.setFilter(SELECT_FILL_ID, ["==", ["get", "code"], selectedCodeRef.current]);
        map.setFilter(SELECT_LINE_ID, ["==", ["get", "code"], selectedCodeRef.current]);

        if (selected) {
          setSelectedCo2(selected.properties.co2);
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
      map.remove();
      mapRef.current = null;
    };
  }, [regionLabel]);

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
        <div className="region-detail-map__overlay region-detail-map__overlay--error" role="alert">
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
