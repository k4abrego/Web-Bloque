
/**
 * @file googleMap.jsx
 * @description Componente reutilizable de Google Maps para SIPINNA.
 *
 * Funcionalidades:
 * - Visualiza reportes con coordenadas obtenidas de comms-api.
 * - Muestra marcadores individuales clicables.
 * - Permite abrir el detalle de un expediente mediante onSelect.
 * - Ofrece una capa opcional de concentración geográfica.
 * - Actualiza los puntos al aplicar filtros sin recrear el mapa.
 * - Ajusta la vista según las ubicaciones disponibles.
 * - Muestra una leyenda para interpretar el mapa.
 *
 * La autorización de los reportes corresponde al backend.
 */

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

/**
 * Coordenadas iniciales utilizadas cuando no hay reportes.
 *
 * @type {{lat: number, lng: number}}
 */
const CENTRO = {
  lat: 19.557,
  lng: -99.271,
};

/**
 * @typedef {Object} ReporteMapa
 * @property {string} folio - Identificador del expediente.
 * @property {number|string} latitud - Latitud del reporte.
 * @property {number|string} longitud - Longitud del reporte.
 * @property {string} [estatus] - Estado actual del expediente.
 */

/**
 * @typedef {Object} GoogleMapProps
 * @property {{lat: number, lng: number}} [center]
 * Centro inicial del mapa.
 * @property {number} [zoom]
 * Nivel de acercamiento inicial.
 * @property {ReporteMapa[]} [reportes]
 * Reportes autorizados que deben visualizarse.
 * @property {(folio: string) => void} [onSelect]
 * Función que se ejecuta cuando se selecciona un marcador.
 * @property {boolean} [mostrarCalor]
 * Indica si debe visualizarse la capa de concentración.
 */

/**
 * Renderiza un mapa interactivo de reportes de SIPINNA.
 *
 * @param {GoogleMapProps} props
 * @returns {import("react").JSX.Element}
 */
function GoogleMap({
  center = CENTRO,
  zoom = 12,
  reportes = [],
  onSelect,
  mostrarCalor = false,
}) {
  /** Referencia al contenedor HTML del mapa. */
  const contenedorRef = useRef(null);

  /** Instancia de Google Maps. */
  const mapaRef = useRef(null);

  /** Marcadores creados para los reportes visibles. */
  const marcadoresRef = useRef([]);

  /** Capa de concentración de deck.gl. */
  const overlayRef = useRef(null);

  /** Referencia al callback de navegación más reciente. */
  const onSelectRef = useRef(onSelect);

  /** Constructor de marcadores cargado desde Google Maps. */
  const markerClassRef = useRef(null);

  /** Constructor de límites geográficos. */
  const boundsClassRef = useRef(null);

  /** Estado de inicialización del mapa. */
  const [mapaListo, setMapaListo] = useState(false);

  /** Error relacionado con la carga de Google Maps. */
  const [error, setError] = useState("");

  /**
   * Mantiene actualizado el callback de selección sin
   * reconstruir el mapa cada vez que cambia el componente padre.
   */
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  /**
   * Inicializa Google Maps una sola vez durante el montaje.
   *
   * Las clases necesarias se obtienen con importLibrary:
   * - Map: mapa base.
   * - Marker: marcadores individuales.
   * - LatLngBounds: límites para encuadrar varios puntos.
   */
  useEffect(() => {
    let vigente = true;

    async function iniciarMapa() {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error(
            "No se configuró la clave de Google Maps."
          );
        }

        setOptions({
          key: apiKey,
          v: "weekly",
        });

        const { Map } = await importLibrary("maps");
        const { Marker } = await importLibrary("marker");
        const { LatLngBounds } = await importLibrary("core");

        if (!vigente || !contenedorRef.current) {
          return;
        }

        // Guardar los constructores para utilizarlos en
        // los efectos que actualizan los reportes.
        markerClassRef.current = Marker;
        boundsClassRef.current = LatLngBounds;

        // Crear la instancia principal del mapa.
        const mapa = new Map(contenedorRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          gestureHandling: "cooperative",
          zoomControl: true,
        });

        mapaRef.current = mapa;
        setMapaListo(true);
      } catch (err) {
        if (vigente) {
          setError(
            err?.message || "No fue posible cargar Google Maps."
          );
        }
      }
    }

    iniciarMapa();

    /**
     * Limpia los recursos al desmontar el componente.
     */
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

      mapaRef.current = null;
      markerClassRef.current = null;
      boundsClassRef.current = null;
    };

    // La posición inicial se fija durante el montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Actualiza los marcadores y la capa de concentración
   * cuando cambian los reportes visibles o los filtros.
   *
   * No se vuelve a crear la instancia principal del mapa.
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

    /**
     * Elimina los marcadores anteriores para evitar
     * duplicados al actualizar los filtros.
     */
    marcadoresRef.current.forEach((marcador) => {
      marcador.setMap(null);
    });

    marcadoresRef.current = [];

    /**
     * Elimina la capa de calor anterior.
     */
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    /**
     * Conserva únicamente reportes con coordenadas válidas.
     *
     * @type {ReporteMapa[]}
     */
    const reportesValidos = reportes.filter((reporte) => {
      if (
        reporte.latitud === null ||
        reporte.latitud === undefined ||
        reporte.latitud === "" ||
        reporte.longitud === null ||
        reporte.longitud === undefined ||
        reporte.longitud === ""
      ) {
        return false;
      }

      const latitud = Number(reporte.latitud);
      const longitud = Number(reporte.longitud);

      return (
        Number.isFinite(latitud) &&
        Number.isFinite(longitud) &&
        latitud >= -90 &&
        latitud <= 90 &&
        longitud >= -180 &&
        longitud <= 180
      );
    });

    /**
     * Crea un marcador individual para cada reporte.
     */
    const nuevosMarcadores = reportesValidos.map((reporte) => {
      const marcador = new Marker({
        map: mapa,
        position: {
          lat: Number(reporte.latitud),
          lng: Number(reporte.longitud),
        },
        title: reporte.folio
          ? `Abrir reporte ${reporte.folio}`
          : "Reporte geolocalizado",
        clickable: Boolean(reporte.folio),
      });

      /**
       * Abre el expediente correspondiente cuando
       * el usuario selecciona el marcador.
       */
      if (reporte.folio) {
        marcador.addListener("click", () => {
          onSelectRef.current?.(reporte.folio);
        });
      }

      return marcador;
    });

    marcadoresRef.current = nuevosMarcadores;

    /**
     * Genera la concentración geográfica únicamente
     * cuando el usuario activa esta visualización.
     *
     * La intensidad representa cantidad de reportes,
     * NO gravedad, prioridad ni nivel de riesgo.
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
     * Ajusta el encuadre dependiendo de la cantidad
     * de reportes que cumplen los filtros.
     */
    if (reportesValidos.length === 1) {
      const reporte = reportesValidos[0];

      mapa.setCenter({
        lat: Number(reporte.latitud),
        lng: Number(reporte.longitud),
      });

      mapa.setZoom(14);
    } else if (reportesValidos.length > 1) {
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
     * Limpieza del efecto al cambiar los reportes.
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
  }, [reportes, mapaListo, mostrarCalor]);

  /**
   * Renderiza el mapa y su leyenda.
   */
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
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
