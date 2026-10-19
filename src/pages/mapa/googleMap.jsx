/**
 * @file googleMap.jsx
 * @description Mapa reutilizable de reportes SIPINNA.
 *
 * Funcionalidades:
 * - Marcadores con navegación al expediente.
 * - Mapa de calor opcional.
 * - Actualización automática de los reportes visibles.
 * - Validación de coordenadas.
 * - Centro de respaldo cuando no existen puntos válidos.
 * - Limpieza de marcadores y capas.
 */

import { useEffect, useRef, useState } from "react";
import {
  setOptions,
  importLibrary,
} from "@googlemaps/js-api-loader";

import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

/**
 * Centro predeterminado en el Estado de México.
 */
const CENTRO = {
  lat: 19.557,
  lng: -99.271,
};

/**
 * Configura el cargador únicamente una vez por módulo.
 */
let googleMapsConfigurado = false;

/**
 * Inicializa la configuración de Google Maps.
 *
 * @param {string} apiKey
 */
function configurarGoogleMaps(apiKey) {
  if (googleMapsConfigurado) return;

  setOptions({
    key: apiKey,
    v: "weekly",
  });

  googleMapsConfigurado = true;
}

/**
 * Convierte una coordenada a número.
 *
 * @param {unknown} valor
 * @returns {number}
 */
function convertirCoordenada(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return NaN;
  }

  return Number(valor);
}

/**
 * Comprueba si un reporte tiene coordenadas utilizables.
 *
 * Se descarta (0, 0), que suele utilizarse como
 * ubicación predeterminada cuando no hay geolocalización.
 *
 * @param {object} reporte
 * @returns {boolean}
 */
function tieneCoordenadasValidas(reporte) {
  const lat = convertirCoordenada(reporte.latitud);
  const lng = convertirCoordenada(reporte.longitud);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }

  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;

  if (lat === 0 && lng === 0) return false;

  return true;
}

/**
 * Componente reutilizable GoogleMap.
 *
 * @param {object} props
 * @param {{lat:number,lng:number}} [props.center]
 * @param {number} [props.zoom]
 * @param {Array<object>} [props.reportes]
 * @param {(folio:string)=>void} [props.onSelect]
 * @param {boolean} [props.mostrarCalor]
 * @returns {import("react").JSX.Element}
 */
function GoogleMap({
  center = CENTRO,
  zoom = 12,
  reportes = [],
  onSelect,
  mostrarCalor = false,
}) {
  const contenedorRef = useRef(null);

  const mapaRef = useRef(null);
  const marcadoresRef = useRef([]);
  const overlayRef = useRef(null);

  const markerClassRef = useRef(null);
  const boundsClassRef = useRef(null);

  const onSelectRef = useRef(onSelect);

  const [mapaListo, setMapaListo] = useState(false);
  const [error, setError] = useState("");

  /**
   * Mantiene actualizada la función que abre reportes.
   */
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  /**
   * Inicializa Google Maps.
   */
  useEffect(() => {
    let vigente = true;
    let mapaCreado = null;

    async function iniciarMapa() {
      try {
        const apiKey =
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error(
            "No se configuró la clave de Google Maps."
          );
        }

        configurarGoogleMaps(apiKey);

        const { Map } = await importLibrary("maps");
        const { Marker } = await importLibrary("marker");
        const { LatLngBounds } = await importLibrary("core");

        if (!vigente || !contenedorRef.current) {
          return;
        }

        markerClassRef.current = Marker;
        boundsClassRef.current = LatLngBounds;

        const centroInicial =
          Number.isFinite(Number(center?.lat)) &&
          Number.isFinite(Number(center?.lng)) &&
          !(Number(center.lat) === 0 &&
            Number(center.lng) === 0)
            ? {
                lat: Number(center.lat),
                lng: Number(center.lng),
              }
            : CENTRO;

        const mapa = new Map(contenedorRef.current, {
          center: centroInicial,
          zoom,
          mapTypeId: "roadmap",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          gestureHandling: "cooperative",
          zoomControl: true,
        });

        mapaCreado = mapa;
        mapaRef.current = mapa;

        setError("");
        setMapaListo(true);
      } catch (err) {
        if (vigente) {
          setError(
            err?.message ||
              "No fue posible cargar Google Maps."
          );
        }
      }
    }

    iniciarMapa();

    return () => {
      vigente = false;

      marcadoresRef.current.forEach((marcador) => {
        marcador.setMap(null);
      });

      marcadoresRef.current = [];

      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }

      if (mapaRef.current === mapaCreado) {
        mapaRef.current = null;
      }

      markerClassRef.current = null;
      boundsClassRef.current = null;
    };

    // El mapa se inicializa una vez al montar el componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Actualiza marcadores, concentración y encuadre
   * cuando cambian los reportes visibles.
   */
  useEffect(() => {
    if (
      !mapaListo ||
      !mapaRef.current ||
      !markerClassRef.current ||
      !boundsClassRef.current
    ) {
      return;
    }

    const mapa = mapaRef.current;
    const Marker = markerClassRef.current;
    const LatLngBounds = boundsClassRef.current;

    // Eliminar marcadores anteriores.
    marcadoresRef.current.forEach((marcador) => {
      marcador.setMap(null);
    });

    marcadoresRef.current = [];

    // Eliminar capa de calor anterior.
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    /**
     * No modificar los datos originales.
     * Filtrar únicamente coordenadas utilizables.
     */
    const reportesValidos = reportes.filter(
      tieneCoordenadasValidas
    );

    const reportesDescartados =
      reportes.length - reportesValidos.length;

    if (reportesDescartados > 0) {
      console.warn(
        `[SIPINNA Maps] ${reportesDescartados} reporte(s) ` +
          "sin coordenadas utilizables. " +
          "No se mostrarán como marcadores."
      );
    }

    /**
     * Si no tenemos ubicaciones, mostrar el centro
     * del Estado de México en lugar del océano.
     */
    if (reportesValidos.length === 0) {
      mapa.setCenter(CENTRO);
      mapa.setZoom(zoom);
      return;
    }

    /**
     * Crear los marcadores.
     */
    const nuevosMarcadores = reportesValidos.map(
      (reporte) => {
        const lat = Number(reporte.latitud);
        const lng = Number(reporte.longitud);

        const marcador = new Marker({
          map: mapa,
          position: { lat, lng },
          title: reporte.folio
            ? `Abrir reporte ${reporte.folio}`
            : "Reporte geolocalizado",
          clickable: Boolean(reporte.folio),
        });

        if (reporte.folio) {
          marcador.addListener("click", () => {
            onSelectRef.current?.(reporte.folio);
          });
        }

        return marcador;
      }
    );

    marcadoresRef.current = nuevosMarcadores;

    /**
     * Mostrar concentración cuando está habilitada.
     */
    if (mostrarCalor && reportesValidos.length > 0) {
      const capaCalor = new HeatmapLayer({
        id: "concentracion-reportes",
        data: reportesValidos,

        getPosition: (reporte) => [
          Number(reporte.longitud),
          Number(reporte.latitud),
        ],

        getWeight: () => 1,
        radiusPixels: 45,
        intensity: 1,
        threshold: 0.03,

        colorRange: [
          [34, 197, 94],
          [250, 204, 21],
          [249, 115, 22],
          [239, 68, 68],
        ],
      });

      const overlay = new GoogleMapsOverlay({
        layers: [capaCalor],
      });

      overlay.setMap(mapa);
      overlayRef.current = overlay;
    }

    /**
     * Ajustar automáticamente el mapa a los puntos.
     */
    if (reportesValidos.length === 1) {
      const reporte = reportesValidos[0];

      mapa.setCenter({
        lat: Number(reporte.latitud),
        lng: Number(reporte.longitud),
      });

      mapa.setZoom(14);
    } else {
      const limites = new LatLngBounds();

      reportesValidos.forEach((reporte) => {
        limites.extend({
          lat: Number(reporte.latitud),
          lng: Number(reporte.longitud),
        });
      });

      mapa.fitBounds(limites, 65);
    }

    /**
     * Limpiar recursos cuando cambien los reportes.
     */
    return () => {
      nuevosMarcadores.forEach((marcador) => {
        marcador.setMap(null);
      });

      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, [reportes, mapaListo, mostrarCalor, zoom]);

  return (
    <div
      className="sipinna-google-map"
      style={{
        position: "relative",
        height: "100%",
        minHeight: 420,
        width: "100%",
      }}
    >
      <div
        ref={contenedorRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {error && (
        <div
          role="alert"
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
            padding: 12,
            background: "white",
            borderRadius: 8,
            color: "#b42318",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {error}
        </div>
      )}

      <div className="sipinna-mapa-leyenda">
        <strong>Leyenda</strong>

        <span>
          ● Marcador: selecciona para abrir un expediente
        </span>

        {mostrarCalor && (
          <>
            <span>Concentración de reportes</span>

            <div className="sipinna-escala-calor" />

            <small>
              Menor concentración → Mayor concentración
            </small>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleMap;
