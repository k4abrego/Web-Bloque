/**
 * @file evidenciaCard.jsx
 * @description Tarjeta reutilizable para visualizar evidencias
 * de expedientes SIPINNA.
 *
 * Admite imágenes y videos obtenidos mediante una descarga
 * autenticada. La URL del archivo debe ser temporal (blob:).
 */

import { Image, Video, FileText, ExternalLink } from "lucide-react";
import "./evidenciaCard.css";

/**
 * @typedef {Object} Evidencia
 * @property {number|string} [id_evidencia] Identificador en MariaDB.
 * @property {string} [tipo_archivo] Tipo registrado: Imagen o Video.
 * @property {string} [tipo] Tipo utilizado por componentes anteriores.
 * @property {string} [nombre] Nombre descriptivo.
 * @property {string} [fecha] Fecha descriptiva.
 * @property {string} [url] URL temporal del archivo descargado.
 * @property {string} [errorArchivo] Error al recuperar el archivo.
 */

/**
 * Renderiza una tarjeta con vista previa de una evidencia.
 *
 * @param {{ evidencia: Evidencia }} props
 * @returns {import("react").JSX.Element}
 */
function EvidenciaCard({ evidencia }) {
  const tipo = evidencia.tipo_archivo ?? evidencia.tipo ?? "Archivo";
  const id = evidencia.id_evidencia ?? evidencia.id;
  const nombre = evidencia.nombre ?? `Evidencia ${id ?? ""}`;
  const url = evidencia.url ?? null;
  const fecha = evidencia.fecha ?? null;
  const errorArchivo = evidencia.errorArchivo ?? null;

  const esImagen = tipo === "Imagen";
  const esVideo = tipo === "Video";

  /**
   * Abre el archivo temporal en una pestaña nueva.
   * Nunca utiliza una ruta física de MariaDB.
   */
  const abrirArchivo = () => {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="evidencia-card">
      <div className="evidencia-icono" data-tipo={tipo}>
        {esImagen ? (
          <Image size={22} />
        ) : esVideo ? (
          <Video size={22} />
        ) : (
          <FileText size={22} />
        )}
      </div>

      <div className="evidencia-info">
        <strong>{nombre}</strong>

        <div className="evidencia-detalles">
          <span>{tipo}</span>
          {fecha && <span>{fecha}</span>}
        </div>

        {url && esImagen && (
          <img
            src={url}
            alt={nombre}
            loading="lazy"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 280,
              maxHeight: 180,
              objectFit: "contain",
              marginTop: 12,
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={abrirArchivo}
          />
        )}

        {url && esVideo && (
          <video
            src={url}
            controls
            preload="metadata"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 360,
              marginTop: 12,
              borderRadius: 8,
            }}
          />
        )}

        {url && (
          <button
            type="button"
            onClick={abrirArchivo}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
              border: "none",
              background: "transparent",
              color: "#6634c7",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ExternalLink size={16} />
            Abrir archivo
          </button>
        )}

        {errorArchivo && (
          <p role="alert" style={{ color: "#b42332", marginTop: 10 }}>
            {errorArchivo}
          </p>
        )}

        {!url && !errorArchivo && id != null && (
          <p style={{ color: "#64748b", marginTop: 10 }}>
            Archivo pendiente de cargar.
          </p>
        )}
      </div>
    </div>
  );
}

export default EvidenciaCard;
