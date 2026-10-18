/**
 * Genera una respuesta HMAC-SHA256 compatible
 * con el backend de autenticación de SIPINNA.
 *
 * Procedimiento:
 * 1. SHA-256 de la contraseña.
 * 2. Decodificar el challenge Base64.
 * 3. Calcular HMAC-SHA256 utilizando como clave
 *    los 32 bytes del hash de la contraseña.
 * 4. Devolver la firma codificada en Base64.
 *
 * @param {string} contrasena
 * @param {string} challengeBase64
 * @returns {Promise<string>}
 */

export async function generarHMAC(contrasena, challengeBase64) {
  const encoder = new TextEncoder();

  // 1. Convertir contraseña a bytes UTF-8
  const passwordBytes = encoder.encode(contrasena);

  // 2. Obtener SHA-256 de la contraseña
  const passwordHash = await crypto.subtle.digest(
    "SHA-256",
    passwordBytes
  );

  // 3. Importar los 32 bytes del hash como clave HMAC
  const claveHMAC = await crypto.subtle.importKey(
    "raw",
    passwordHash,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // 4. Decodificar el challenge recibido en Base64
  const challengeBinario = atob(challengeBase64);

  const challengeBytes = Uint8Array.from(
    challengeBinario,
    (caracter) => caracter.charCodeAt(0)
  );

  // 5. Generar respuesta HMAC-SHA256
  const firma = await crypto.subtle.sign(
    "HMAC",
    claveHMAC,
    challengeBytes
  );

  // 6. Convertir la firma a Base64
  const firmaBytes = new Uint8Array(firma);

  const firmaBinaria = Array.from(
    firmaBytes,
    (byte) => String.fromCharCode(byte)
  ).join("");

  return btoa(firmaBinaria);
}
