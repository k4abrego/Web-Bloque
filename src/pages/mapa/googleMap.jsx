import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

function GoogleMap({ center, zoom = 11, reportes = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    async function cargarMapa() {
      setOptions({
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        v: "weekly",
      });

      const { Map } = await importLibrary("maps");

      const mapa = new Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = mapa;

      const datosHeatmap = reportes.map((reporte) => ({
        position: [
          reporte.longitud,
          reporte.latitud,
        ],
        peso: reporte.peso ?? 1,
      }));

      const heatmapLayer = new HeatmapLayer({
        id: "reporte-heatmap",
        data: datosHeatmap,
        getPosition: (d) => d.position,
        getWeight: (d) => d.peso,
        radiusPixels: 40,
        intensity: 1,
        threshold: 0.03,
      });

      const overlay = new GoogleMapsOverlay({
        layers: [heatmapLayer],
      });

      overlay.setMap(mapa);

      overlayRef.current = overlay;
    }

    cargarMapa();

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }

      mapInstanceRef.current = null;
    };
  }, [center, zoom, reportes]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
}

export default GoogleMap;