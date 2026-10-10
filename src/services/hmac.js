/**
 * Genera la respuesta HMAC-SHA256 para Auth API.
 *
 * @param {string} contrasena - Contraseña ingresada.
 * @param {string} challengeBase64 - Challenge recibido.
 * @returns {Promise<string>} HMAC codificado en Base64.
 */
export async function generarHMAC(contrasena, challengeBase64) {
  const encoder = new TextEncoder();

  // 1. Obtener SHA-256 de la contraseña.
  const hash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(contrasena)
  );

  // 2. Importar el hash como clave HMAC.
  const clave = await crypto.subtle.importKey(
    "raw",
    hash,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // 3. Decodificar el challenge Base64.
  const challengeBinario = atob(challengeBase64);

  const challengeBytes = Uint8Array.from(
    challengeBinario,
    (caracter) => caracter.charCodeAt(0)
  );

  // 4. Calcular HMAC-SHA256.
  const firma = await crypto.subtle.sign(
    "HMAC",
    clave,
    challengeBytes
  );

  // 5. Convertir el resultado a Base64.
  const firmaBytes = new Uint8Array(firma);

  const firmaBinaria = Array.from(
    firmaBytes,
    (byte) => String.fromCharCode(byte)
  ).join("");

  return btoa(firmaBinaria);
}
