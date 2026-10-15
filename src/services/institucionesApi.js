import { apiFetch } from "./api";

/**
 * Obtiene la lista de instituciones disponibles.
 *
 * @returns {Promise<Array>} Lista de instituciones registrada en el sistema.
 * @throws {Error} Si la solicitud al backend falla.
 */
export async function obtenerInstituciones() {
    return apiFetch("/instituciones");
}