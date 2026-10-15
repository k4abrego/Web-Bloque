import { authApiFetch } from "./api";

/**
 * Solicita un reto de autenticación al backend.
 *
 * Este es el primer paso del proceso de inicio de sesión.
 * El backend recibe el correo y devuelve un challenge junto
 * con el identificador del usuario.
 *
 * Endpoint:
 * GET /Login/:correo
 *
 * @param {string} correo - Correo electrónico del usuario.
 * @returns {Promise<object>} Información del challenge y del usuario.
 * @throws {Error} Si el backend rechaza la solicitud.
 */
export async function solicitarChallenge(correo) {
    return authApiFetch(
        `/Login/${encodeURIComponent(correo)}`
    );
}

/**
 * Envía la respuesta calculada al challenge para completar
 * el proceso de autenticación.
 *
 * Endpoint:
 * POST /Login/
 *
 * @param {number} userId - Identificador del usuario.
 * @param {string} respuestaHMAC - Respuesta calculada al challenge.
 * @returns {Promise<object>} Respuesta del backend que contiene el token JWT.
 * @throws {Error} Si las credenciales no son válidas.
 */
export async function verificarChallenge(userId, respuestaHMAC) {
    return authApiFetch("/Login/", {
        method: "POST",
        body: JSON.stringify({
            user_id: userId,
            response: respuestaHMAC,
        }),
    });
}

/**
 * Guarda la información de sesión del usuario en localStorage.
 *
 * El token es utilizado posteriormente por apiFetch y authApiFetch
 * para enviar automáticamente el encabezado Authorization.
 *
 * @param {string} token - Token JWT proporcionado por el backend.
 * @param {string} [rol] - Rol del usuario, si se encuentra disponible.
 */
export function guardarSesion(token, rol) {
    localStorage.setItem("token", token);

    if (rol) {
        localStorage.setItem("rol", rol);
    }
}

/**
 * Elimina la información de autenticación almacenada localmente.
 *
 * Se utiliza para cerrar la sesión del usuario.
 */
export function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
}