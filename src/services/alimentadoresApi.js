/**
 * alimentadoresApi.js
 *
 * Servicio de consulta de alimentadores registrados
 * en la base de datos de SIPINNA.
 *
 * Utiliza el cliente HTTP de comunicación para
 * enviar automáticamente el JWT de la sesión.
 */

import { apiFetch } from "./api";

/**
 * Obtiene los alimentadores activos.
 *
 * GET /api/v1/usuario/alimentadores
 *
 * @returns {Promise<Array<Object>>}
 * Registros devueltos por el backend.
 *
 * @throws {Error} Si la solicitud HTTP falla.
 */
export async function obtenerAlimentadores() {
  return apiFetch("/usuario/alimentadores");
}
