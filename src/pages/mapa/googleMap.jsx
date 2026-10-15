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

      colorRange: [
        [34, 197, 94],
        [250, 204, 21],
        [249, 115, 22],
        [239, 68, 68],
      ],
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
    style={{
      position: "relative",
      width: "100%",
      height: "600px",
      borderRadius: "16px",
      overflow: "hidden",
    }}
  >
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />

    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "white",
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        fontSize: "13px",
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        Concentración de reportes
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "rgb(34, 197, 94)",
          }}
        />
        <span>Baja</span>

        <span
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "rgb(250, 204, 21)",
            marginLeft: "6px",
          }}
        />
        <span>Media</span>

        <span
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "rgb(249, 115, 22)",
            marginLeft: "6px",
          }}
        />
        <span>Alta</span>

        <span
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "rgb(239, 68, 68)",
            marginLeft: "6px",
          }}
        />
        <span>Muy alta</span>
      </div>
    </div>
  </div>
);
}

export default GoogleMap;