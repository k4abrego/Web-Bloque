/**
 * URL base del servicio de autenticación.
 * Se obtiene de la variable de entorno VITE_AUTH_API_URL.
 */
const AUTH_API_URL = import.meta.env.VITE_AUTH_LOGIN_URL;

/**
 * Solicita un challenge de autenticación al backend.
 *
 * El backend recibe el correo del usuario, verifica que exista
 * y genera un challenge que posteriormente será utilizado para
 * calcular la respuesta HMAC.
 *
 * @param {string} correo - Correo electrónico del usuario.
 * @returns {Promise<{challenge: string, message: string, user_id: number}>}
 *          Challenge generado por el backend e identificador del usuario.
 * @throws {Error} Si el backend rechaza la solicitud.
 */
export async function solicitarChallenge(correo) {
  const url = `${AUTH_API_URL}/auth/${encodeURIComponent(correo)}`;

  console.log("URL REAL DEL LOGIN:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudo verificar el correo electrónico.");
  }

  return response.json();
}

/**
 * Envía la respuesta HMAC del challenge al backend.
 *
 * El backend valida la respuesta calculada a partir del challenge
 * y, si las credenciales son correctas, devuelve un token JWT
 * y el rol correspondiente al usuario.
 *
 * @param {number} userId - Identificador del usuario.
 * @param {string} respuestaHMAC - Respuesta HMAC-SHA256 codificada en Base64.
 * @returns {Promise<{token: string, rol: string}>}
 *          Token JWT y rol del usuario autenticado.
 * @throws {Error} Si las credenciales son inválidas o el backend rechaza la solicitud.
 */


export async function verificarChallenge(userId, respuestaHMAC) {
  const response = await fetch(`${AUTH_API_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      response: respuestaHMAC,
    }),
  });

  if (!response.ok) {
    let mensaje = "No se pudo iniciar sesión. Verifica tus datos.";

    try {
      const errorData = await response.json();
      mensaje = errorData.error || mensaje;
    } catch {
      // La respuesta no contiene JSON.
    }

    throw new Error(mensaje);
  }

  return response.json();
}

/**
 * Guarda la información de la sesión autenticada.
 *
 * @param {string} token - Token JWT del usuario.
 * @param {string} rol - Rol devuelto por el backend.
 * @param {number} userId - Identificador del usuario autenticado.
 */
export function guardarSesion(token, rol, userId) {
  localStorage.setItem("token", token);
  localStorage.setItem("rol", rol);
  localStorage.setItem("user_id", String(userId));
}

/**
 * Elimina la información de autenticación almacenada localmente.
 */
export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
}

