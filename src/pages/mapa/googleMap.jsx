// Documentación automática de src/pages/mapa/googleMap.jsx: Página y estilos de la sección googleMap.
import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

// Sección: GoogleMap.
function GoogleMap({ center, zoom = 11, reportes = [] }) {
// Sección: mapRef.
  const mapRef = useRef(null);
// Sección: mapInstanceRef.
  const mapInstanceRef = useRef(null);
// Sección: overlayRef.
  const overlayRef = useRef(null);

  useEffect(() => {
// Sección: cargarMapa.
    async function cargarMapa() {
      setOptions({
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        v: "weekly",
      });

// Sección: declaración.
      const { Map } = await importLibrary("maps");

// Sección: mapa.
      const mapa = new Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = mapa;

// Sección: datosHeatmap.
      const datosHeatmap = reportes.map((reporte) => ({
        position: [
          reporte.longitud,
          reporte.latitud,
        ],
        peso: reporte.peso ?? 1,
      }));

// Sección: heatmapLayer.
      const heatmapLayer = new HeatmapLayer({
        id: "reporte-heatmap",
        data: datosHeatmap,
        getPosition: (d) => d.position,
        getWeight: (d) => d.peso,
        radiusPixels: 40,
        intensity: 1,
        threshold: 0.03,
      });

// Sección: overlay.
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