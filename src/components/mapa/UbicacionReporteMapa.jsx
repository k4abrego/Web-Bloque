
/**
 * @file UbicacionReporteMapa.jsx
 * @description
 * Muestra la ubicación geográfica real de un reporte SIPINNA.
 *
 * Funcionalidades:
 * - Obtiene las coordenadas del detalle cuando están disponibles.
 * - Consulta comms-api cuando el detalle no incluye coordenadas.
 * - Muestra un mapa incrustado de Google Maps.
 * - Permite abrir la ubicación en Google Maps.
 * - Evita mostrar ubicaciones inventadas.
 *
 * @module UbicacionReporteMapa
 */

import { useEffect, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { apiFetch } from "./api";

/**
 * Convierte un valor recibido del backend en un número válido.
 *
 * @param {unknown} valor - Valor original.
 * @returns {number|null} Número válido o null.
 */
function aNumero(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
}

/**
 * Extrae las coordenadas geográficas de un registro.
 *
 * @param {object|null|undefined} registro
 * @returns {{lat: number, lng: number}|null}
 */
function extraerCoordenadas(registro) {
  if (!registro || typeof registro !== "object") {
    return null;
  }

  const lat = aNumero(registro.latitud ?? registro.lat);
  const lng = aNumero(registro.longitud ?? registro.lng);

  if (lat === null || lng === null) {
    return null;
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }

  if (lat === 0 && lng === 0) {
    return null;
  }

  return { lat, lng };
}

/**
 * Normaliza la lista de reportes devuelta por comms-api.
 *
 * @param {unknown} respuesta
 * @returns {object[]}
 */
function extraerPuntos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.reportes)) {
    return respuesta.reportes;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

/**
 * Visualiza la ubicación de un expediente.
 *
 * @param {object} props
 * @param {string} props.folio - Folio del reporte.
 * @param {object|null} props.reporte - Datos del expediente.
 * @returns {import("react").JSX.Element}
 */
export default function UbicacionReporteMapa({
  folio,
  reporte,
}) {
  const [coordenadas, setCoordenadas] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  /**
   * Consulta la ubicación cuando el detalle
   * no contiene coordenadas.
   */
  useEffect(() => {
    let vigente = true;

    const coordenadasDetalle =
      extraerCoordenadas(reporte);

    if (coordenadasDetalle) {
      return () => {
        vigente = false;
      };
    }

    async function consultarCoordenadas() {
      setConsultando(true);
      setMensaje("");

      try {
        const respuesta = await apiFetch(
          "/mapa/reportes"
        );

        const puntos = extraerPuntos(respuesta);

        const punto = puntos.find(
          (item) =>
            String(item?.folio) === String(folio)
        );

        const ubicacion = extraerCoordenadas(punto);

        if (!vigente) return;

        setCoordenadas(ubicacion);

        if (!ubicacion) {
          setMensaje(
            "Este reporte no tiene coordenadas disponibles."
          );
        }
      } catch (error) {
        if (!vigente) return;

        console.error(
          "Error al consultar coordenadas:",
          error
        );

        setCoordenadas(null);

        setMensaje(
          "No fue posible consultar la ubicación del reporte."
        );
      } finally {
        if (vigente) {
          setConsultando(false);
        }
      }
    }

    consultarCoordenadas();

    return () => {
      vigente = false;
    };
  }, [folio, reporte]);

  /**
   * Prioriza las coordenadas del detalle.
   */
  const ubicacion =
    extraerCoordenadas(reporte) ?? coordenadas;

  const consulta = ubicacion
    ? `${ubicacion.lat},${ubicacion.lng}`
    : "";

  /**
   * Dirección externa de Google Maps.
   */
  const enlaceGoogleMaps = ubicacion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
    : "";

  /**
   * Mapa incrustado en la página.
   */
  const mapaIncrustado = ubicacion
    ? `https://maps.google.com/maps?q=${encodeURIComponent(consulta)}&z=16&output=embed`
    : "";

  return (
    <section
      aria-label="Ubicación geográfica del reporte"
      style={{
        marginTop: 20,
        padding: 24,
        borderRadius: 16,
        background: "#fff",
        boxShadow:
          "0 4px 20px rgba(30,24,50,.06)",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 0,
        }}
      >
        <MapPin size={22} color="#6634c7" />

        Ubicación del reporte
      </h2>

      <p style={{ color: "#647084" }}>
        Ubicación geográfica registrada en el
        expediente.
      </p>

      {consultando && !ubicacion ? (
        <p role="status">
          Consultando coordenadas...
        </p>
      ) : ubicacion ? (
        <>
          {/* Mapa de Google Maps */}
          <iframe
            title={`Ubicación del reporte ${folio}`}
            src={mapaIncrustado}
            width="100%"
            height="300"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              border: 0,
              borderRadius: 12,
              display: "block",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 14,
            }}
          >
            <span
              style={{
                color: "#647084",
                fontSize: 13,
              }}
            >
              {consulta}
            </span>

            {/* Apertura de la ubicación externa */}
            <a
              href={enlaceGoogleMaps}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 16px",
                borderRadius: 9,
                background: "#6634c7",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <ExternalLink size={17} />

              Abrir en Google Maps
            </a>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#647084",
              marginBottom: 0,
            }}
          >
            Google Maps es un servicio externo.
            Mostrar o abrir el mapa comparte estas
            coordenadas con Google.
          </p>
        </>
      ) : (
        <p role="status">
          {mensaje ||
            "No hay coordenadas registradas para este reporte."}
        </p>
      )}
    </section>
  );
}
