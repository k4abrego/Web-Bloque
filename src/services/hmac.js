/**
 * Genera la respuesta HMAC-SHA256 para Auth API.
 *
 * @param {string} contrasena - Contraseña ingresada.
 * @param {string} challengeBase64 - Challenge recibido.
 * @returns {Promise<string>} HMAC codificado en Base64.
 */
// Sección: generarHMAC.
export async function generarHMAC(contrasena, challengeBase64) {
  const encoder = new TextEncoder();

  // La contraseña se usa directamente como clave HMAC.
  const clave = await crypto.subtle.importKey(
    "raw",
    encoder.encode(contrasena),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Decodificar challenge Base64
  const challengeBinario = atob(challengeBase64);

  const challengeBytes = Uint8Array.from(
    challengeBinario,
    (caracter) => caracter.charCodeAt(0)
  );

  // HMAC-SHA256
  const firma = await crypto.subtle.sign(
    "HMAC",
    clave,
    challengeBytes
  );

  // Convertir a Base64
  const firmaBytes = new Uint8Array(firma);

  const firmaBinaria = Array.from(
    firmaBytes,
    (byte) => String.fromCharCode(byte)
  ).join("");

  return btoa(firmaBinaria);
}