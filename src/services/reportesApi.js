/**
 * reportesApi.js
 *
 * Servicios para consultar, asignar y actualizar
 * reportes mediante comms-api.
 */

import { apiFetch } from "./api";

/**
 * Consulta reportes utilizando filtros opcionales.
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function obtenerReporte(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([campo, valor]) => {
    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      query.append(campo, String(valor));
    }
  });

  const parametros = query.toString();

  const url = parametros
    ? `/reportes?${parametros}`
    : "/reportes";

  return apiFetch(url);
}

/**
 * Consulta el detalle de un reporte mediante su folio.
 *
 * @param {string} folio
 * @returns {Promise<Object>}
 */
export async function obtenerReportePorId(folio) {
  return apiFetch(
    `/reportes/${encodeURIComponent(folio)}`
  );
}

/**
 * Actualiza el estado de un expediente.
 *
 * El backend valida:
 * - La autenticación mediante JWT.
 * - El estado solicitado.
 * - Los permisos del usuario sobre el expediente.
 *
 * @param {string} folio
 * @param {Object} datos
 * @param {string} datos.estado
 * @param {string|null} [datos.observaciones]
 * @returns {Promise<Object>}
 */
export async function actualizarEstadoReporte(folio, datos) {
  return apiFetch(
    `/reportes/${encodeURIComponent(folio)}/estatus`,
    {
      method: "PATCH",
      body: JSON.stringify({
        estado: datos.estado,
        observaciones: datos.observaciones ?? null,
      }),
    }
  );
}

/**
 * Asigna un reporte a un alimentador.
 *
 * @param {string} folio
 * @param {number} idAlimentador
 * @returns {Promise<Object>}
 */
export async function asignarReporte(folio, idAlimentador) {
  return apiFetch(
    `/reportes/asignar/${encodeURIComponent(folio)}`,
    {
      method: "POST",
      body: JSON.stringify({
        id_alimentador: idAlimentador,
      }),
    }
  );
}

/**
 * Obtiene el historial de reportes.
 *
 * El backend utiliza el JWT para determinar
 * qué reportes puede consultar cada usuario.
 *
 * @param {Object} filtros
 * @param {string} [filtros.estado]
 * @param {number} [filtros.id_territorio]
 * @param {"asc"|"desc"} [filtros.orden_fecha]
 * @returns {Promise<Object[]>}
 */
export async function obtenerHistoricoReportes(filtros = {}) {
  const query = new URLSearchParams();

  Object.entries(filtros).forEach(([campo, valor]) => {
    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      query.append(campo, String(valor));
    }
  });

  const parametros = query.toString();

  const url = parametros
    ? `/reportes/historico?${parametros}`
    : "/reportes/historico";

  return apiFetch(url);
}



/**
 * Consulta la prioridad actual de un reporte.
 *
 * @param {string} folio
 * @returns {Promise<{folio: string, prioridad: string|null}>}
 */
export async function obtenerPrioridadReporte(folio) {
  return apiFetch(
    `/reportes/${encodeURIComponent(folio)}/prioridad`
  );
}

/**
 * Actualiza la prioridad de un reporte.
 *
 * Solo los administradores autorizados pueden
 * realizar esta operación.
 *
 * @param {string} folio
 * @param {"Alta"|"Media"|"Baja"} prioridad
 * @returns {Promise<Object>}
 */
export async function actualizarPrioridadReporte(folio, prioridad) {
  return apiFetch(
    `/reportes/${encodeURIComponent(folio)}/prioridad`,
    {
      method: "PATCH",
      body: JSON.stringify({ prioridad }),
    }
  );
}


/**
 * Consulta las evidencias asociadas a un expediente.
 *
 * Utiliza el endpoint autenticado de comms-api:
 * GET /reportes/:folio/evidencias
 *
 * La API determina, mediante el JWT, si el usuario
 * tiene autorización para consultar el expediente.
 *
 * @param {string} folio - Folio único del reporte.
 * @returns {Promise<unknown>} Respuesta original de comms-api.
 */
export async function obtenerEvidenciasReporte(folio) {
  if (!folio || typeof folio !== "string") {
    throw new Error(
      "Se necesita un folio válido para consultar las evidencias."
    );
  }

  return apiFetch(
    `/reportes/${encodeURIComponent(folio)}/evidencias`
  );
}



/**
 * Descarga el archivo real de una evidencia autorizada.
 *
 * Utiliza el cliente HTTP de comms-api para enviar
 * automáticamente el token JWT de la sesión.
 *
 * El backend verifica que:
 * - El usuario tenga acceso al expediente.
 * - La evidencia pertenezca al folio solicitado.
 * - El archivo esté disponible en el servidor.
 *
 * @param {string} folio - Folio del expediente.
 * @param {number|string} idEvidencia - Identificador de la evidencia.
 * @returns {Promise<Blob>} Archivo binario de imagen o video.
 * @throws {Error} Si ocurre un error de autenticación,
 * autorización, disponibilidad o conexión.
 */
export async function descargarArchivoEvidencia(folio, idEvidencia) {
  if (!folio || !idEvidencia) {
    throw new Error("Folio e ID de evidencia requeridos.");
  }

  return apiFetch(
    `/reportes/${encodeURIComponent(folio)}/evidencias/${encodeURIComponent(idEvidencia)}/archivo`,
    {
      method: "GET",
      responseType: "blob",
    }
  );
}
