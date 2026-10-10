const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

/**
 * Solicita un reto de autenticación al backend.
 *
 * @param {string} correo - Correo electrónico del usuario.
 * @returns {Promise<object>} Challenge, mensaje y user_id.
 */
export async function solicitarChallenge(correo) {
  const response = await fetch(
    `${AUTH_API_URL}/Login/${encodeURIComponent(correo)}`
  );

  if (!response.ok) {
    throw new Error("No se pudo verificar el correo electrónico.");
  }

  return response.json();
}

/**
 * Envía la respuesta HMAC para validar la autenticación.
 *
 * @param {number} userId - Identificador del usuario.
 * @param {string} respuestaHMAC - Resultado HMAC en Base64.
 * @returns {Promise<object>} Token JWT y rol del usuario.
 */
export async function verificarChallenge(userId, respuestaHMAC) {
  const response = await fetch(`${AUTH_API_URL}/Login`, {
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
    throw new Error("No se pudo iniciar sesión. Verifica tus datos.");
  }

  return response.json();
}

/**
 * Guarda la sesión después de una autenticación exitosa.
 *
 * @param {string} token - Token JWT.
 * @param {string} rol - Rol verificado por el backend.
 */
export function guardarSesion(token, rol) {
  localStorage.setItem("token", token);
  localStorage.setItem("rol", rol);
}

/**
 * Elimina la información local de autenticación.
 */
export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
}
