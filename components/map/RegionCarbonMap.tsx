"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl, { type MapLayerMouseEvent, type Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CarbonMapLegend } from "./CarbonMapLegend";
import {
  DEFAULT_MAP_STYLE,
  buildCarbonFillColorExpression,
  enrichMunicipalitiesGeoJson,
  formatCo2,
  MUNICIPALITIES_GEOJSON_URL,
  type SigunguGeoFeature,
} from "@/lib/sigungu-map";
import { regionDetailPath } from "@/lib/region-routes";

const SOURCE_ID = "sigungu-carbon";
const FILL_LAYER_ID = "sigungu-carbon-fill";
const LINE_LAYER_ID = "sigungu-carbon-line";
const HOVER_LAYER_ID = "sigungu-carbon-hover";

type RegionCarbonMapProps = {
  className?: string;
  carbonByLabel?: Record<string, number>;
};

export function RegionCarbonMap({
  className = "",
  carbonByLabel,
}: RegionCarbonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillColorExpression = useMemo(() => buildCarbonFillColorExpression(), []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_MAP_STYLE,
      center: [127.9, 36.2],
      zoom: 6.4,
      minZoom: 5,
      maxZoom: 12,
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: "carbon-map-popup",
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const onLoad = async () => {
      try {
        const response = await fetch(MUNICIPALITIES_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`GeoJSON 로드 실패 (${response.status})`);
        }
        const raw = await response.json();
        const geojson = enrichMunicipalitiesGeoJson(raw, carbonByLabel);

        if (cancelled) return;

        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: geojson,
          generateId: true,
        });

        map.addLayer({
          id: FILL_LAYER_ID,
          type: "fill",
          source: SOURCE_ID,
          paint: {
            "fill-color": fillColorExpression as maplibregl.ExpressionSpecification,
            "fill-opacity": 0.82,
          },
        });

        map.addLayer({
          id: LINE_LAYER_ID,
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
          paint: {
            "line-color": "#1e40af",
            "line-width": 2.5,
          },
          filter: ["==", ["get", "code"], ""],
        });

        const bounds = new maplibregl.LngLatBounds();
        for (const feature of geojson.features) {
          const geom = feature.geometry;
          if (geom.type === "Polygon") {
            for (const ring of geom.coordinates) {
              for (const coord of ring) {
                bounds.extend(coord as [number, number]);
              }
            }
          } else if (geom.type === "MultiPolygon") {
            for (const polygon of geom.coordinates) {
              for (const ring of polygon) {
                for (const coord of ring) {
                  bounds.extend(coord as [number, number]);
                }
              }
            }
          }
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 36, duration: 0 });
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

    map.once("error", (event) => {
      if (cancelled) return;
      setStatus("error");
      setErrorMessage(
        event.error?.message ?? "지도 스타일을 불러오지 못했습니다.",
      );
    });

    if (map.loaded()) {
      void onLoad();
    } else {
      map.once("load", () => void onLoad());
    }

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

    map.on("mousemove", FILL_LAYER_ID, (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0] as SigunguGeoFeature | undefined;
      if (!feature || !e.lngLat) return;
      showHover(feature, e.lngLat);
    });

    map.on("mouseleave", FILL_LAYER_ID, clearHover);

    map.on("click", FILL_LAYER_ID, (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0] as SigunguGeoFeature | undefined;
      if (!feature) return;
      router.push(regionDetailPath(feature.properties.label));
    });

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [router]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !carbonByLabel || status !== "ready") return;

    let cancelled = false;

    const updateData = async () => {
      try {
        const response = await fetch(MUNICIPALITIES_GEOJSON_URL);
        if (!response.ok) return;
        const raw = await response.json();
        const geojson = enrichMunicipalitiesGeoJson(raw, carbonByLabel);
        if (cancelled) return;

        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
        source?.setData(geojson);

        map.setPaintProperty(
          FILL_LAYER_ID,
          "fill-color",
          fillColorExpression as maplibregl.ExpressionSpecification,
        );
      } catch {
        // ignore transient update errors
      }
    };

    void updateData();

    return () => {
      cancelled = true;
    };
  }, [carbonByLabel, status, fillColorExpression]);

  return (
    <div className={`carbon-map ${className}`.trim()}>
      <div className="carbon-map__frame">
        <div ref={containerRef} className="carbon-map__canvas" role="application" aria-label="시군구 관광 탄소발자국 분포 지도" />
        <CarbonMapLegend />
        {status === "loading" ? (
          <div className="carbon-map__overlay" aria-live="polite">
            지도를 불러오는 중…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="carbon-map__overlay carbon-map__overlay--error" role="alert">
            {errorMessage ?? "지도를 표시할 수 없습니다."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
