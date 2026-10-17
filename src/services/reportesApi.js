
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
