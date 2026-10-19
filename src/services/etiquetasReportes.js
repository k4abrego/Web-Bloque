/**
 * @file etiquetasReportes.js
 * @description Filtros reales de etiquetas de los reportes autorizados.
 *
 * Categoria, Riesgo y Prioridad provienen de reporteetiqueta.
 * Observación corresponde al campo peligro_inmediato del expediente.
 */
export const TIPOS_ETIQUETA = ["Categoria", "Riesgo", "Prioridad"];

/** @param {Object} reporte @param {string} tipo @returns {string[]} */
export function valoresEtiqueta(reporte, tipo) {
  if (tipo === "Observación") {
    return reporte?.peligro_inmediato ? [String(reporte.peligro_inmediato)] : [];
  }
  return (Array.isArray(reporte?.etiquetas) ? reporte.etiquetas : [])
    .filter((e) => e?.tipo === tipo)
    .map((e) => e?.nombre_etiqueta)
    .filter(Boolean);
}

/** @param {Object[]} reportes @param {string} tipo @returns {string[]} */
export function opcionesEtiqueta(reportes, tipo) {
  return [...new Set(reportes.flatMap((r) => valoresEtiqueta(r, tipo)))].sort(
    (a, b) => a.localeCompare(b, "es")
  );
}

/** @param {Object} reporte @param {Object} filtros @returns {boolean} */
export function coincideEtiquetas(reporte, filtros) {
  return Object.entries(filtros).every(
    ([tipo, valor]) => !valor || valoresEtiqueta(reporte, tipo).includes(valor)
  );
}