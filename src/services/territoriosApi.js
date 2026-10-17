/**
 * territoriosApi.js
 *
 * Servicio para consultar el catálogo de territorios
 * disponible en comms-api.
 */

import { apiFetch } from "./api";

/**
 * Consulta los territorios registrados en MariaDB.
 *
 * Respuesta esperada:
 * {
 *   estados: ["Estado de México"],
 *   territorios: [
 *     {
 *       id_territorio: 2,
 *       estado: "Estado de México",
 *       nombre: "Atizapán de Zaragoza"
 *     }
 *   ]
 * }
 *
 * @returns {Promise<object>}
 */
export async function obtenerTerritorios() {
  return apiFetch("/territorios");
}
