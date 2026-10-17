import { apiFetch } from "./api";

// Sección: obtenerReporte.
export async function obtenerReporte(params = {}) {
// Sección: query.
    const query = new URLSearchParams();

    Object.entries(params).forEach(([Key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(Key, value);
        }
    });

// Sección: url.
    const url = query.toString()
        ? `/reportes?${query.toString()}`
        : "/reportes";

    return apiFetch(url);
}
    /**
     * Consulta un reporte real mediante su folio.
     *
     * @param {string} folio - Folio del reporte.
     * @returns {Promise<Object>} Información del reporte.
     */
    export async function obtenerReportePorId(folio) {
    return apiFetch(
        `/reportes/${encodeURIComponent(folio)}`
    );
    }

// Sección: actualizarEstadoReporte.
export async function actualizarEstadoReporte(folio, datos) {
    return apiFetch(`/reportes/${folio}`, {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

// Sección: asignarReporte.
export async function asignarReporte(folio, idAlimentador) {
    return apiFetch(`/reportes/asignar/${folio}`, {
        method: "POST",
        body: JSON.stringify({
            id_alimentador: idAlimentador,
        }),
    });
    
}



/**
 * Obtiene el historial real de reportes desde comms-api.
 *
 * El token de autenticación se envía mediante apiFetch.
 *
 * Endpoint:
 * GET /api/v1/reportes/historico
 *
 * @param {Object} [filtros={}] - Filtros opcionales.
 * @param {string} [filtros.estado] - Estado del expediente.
 * @param {number} [filtros.id_territorio] - Territorio.
 * @param {"asc"|"desc"} [filtros.orden_fecha] - Orden.
 * @returns {Promise<Object[]>} Reportes del backend.
 */
export async function obtenerHistoricoReportes(filtros = {}) {
  const query = new URLSearchParams();

  Object.entries(filtros).forEach(([campo, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      query.append(campo, String(valor));
    }
  });

  const parametros = query.toString();

  const url = parametros
    ? `/reportes/historico?${parametros}`
    : "/reportes/historico";

  return apiFetch(url);
}
