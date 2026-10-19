/**
 * @file EvidenciasReporte.jsx
 * @description Consulta y visualiza los archivos reales asociados
 * a un expediente SIPINNA, respetando los permisos del backend.
 */

import { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";

import EvidenciaCard from "./evidenciaCard";

import {
  obtenerEvidenciasReporte,
  descargarArchivoEvidencia,
} from "../../services/reportesApi";

/**
 * @typedef {Object} EvidenciaVisual
 * @property {number} id_evidencia Identificador de la evidencia.
 * @property {string} tipo_archivo Tipo registrado en MariaDB.
 * @property {string} [url] URL temporal del archivo descargado.
 * @property {string} [errorArchivo] Error individual del archivo.
 */

/**
 * Componente reutilizable para mostrar evidencias de un reporte.
 *
 * @param {{ folio: string }} props
 * @returns {import("react").JSX.Element}
 */
export default function EvidenciasReporte({ folio }) {
  const [evidencias, setEvidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    const urlsTemporales = [];

    /**
     * Consulta los metadatos y recupera los archivos autorizados.
     */
    async function cargarEvidencias() {
      try {
        const registros = await obtenerEvidenciasReporte(folio);

        if (!Array.isArray(registros)) {
          throw new Error(
            "El servidor no devolvió una lista válida de evidencias."
          );
        }

        const resultados = await Promise.all(
          registros.map(async (registro) => {
            const id = registro.id_evidencia ?? registro.id;

            try {
              const archivo = await descargarArchivoEvidencia(
                folio,
                id
              );

              const url = URL.createObjectURL(archivo);
              urlsTemporales.push(url);

              return {
                ...registro,
                id_evidencia: id,
                url,
              };
            } catch (err) {
              return {
                ...registro,
                id_evidencia: id,
                errorArchivo:
                  err.status === 404
                    ? "El archivo ya no está disponible."
                    : err.message ||
                      "No fue posible recuperar este archivo.",
              };
            }
          })
        );

        if (!vigente) return;

        setEvidencias(resultados);
        setError("");
      } catch (err) {
        if (!vigente) return;

        console.error("Error al consultar evidencias:", err);
        setError(
          err.message ||
            "No fue posible consultar las evidencias del reporte."
        );
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    if (folio) {
      cargarEvidencias();
    }

    return () => {
      vigente = false;

      // Liberar los objetos binarios cuando se cierre el componente.
      urlsTemporales.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [folio]);

  if (!folio) {
    return <p>No se proporcionó un folio válido.</p>;
  }

  if (cargando) {
    return <p>Consultando evidencias del expediente...</p>;
  }

  if (error) {
    return <p role="alert" style={{ color: "#b42332" }}>{error}</p>;
  }

  if (evidencias.length === 0) {
    return (
      <div className="detalle-sin-evidencias">
        <Paperclip size={32} />

        <div>
          <strong>Sin evidencias registradas</strong>
          <p>Este expediente no tiene archivos asociados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-evidencias">
      {evidencias.map((evidencia, index) => (
        <EvidenciaCard
          key={evidencia.id_evidencia ?? index}
          evidencia={evidencia}
        />
      ))}
    </div>
  );
}
