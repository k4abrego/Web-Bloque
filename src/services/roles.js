
/**
 * @file roles.js
 * @description Normalización de roles de SIPINNA.
 *
 * Conserva los nombres oficiales enviados por auth-api:
 * Administrador y Alimentador.
 */

const ALIAS_ROLES = {
  admin: "Administrador",
  administrador: "Administrador",
  administrator: "Administrador",

  alimentador: "Alimentador",
  feeder: "Alimentador",
  alimentador_procuraduria: "Alimentador",
  "alimentador-procuraduria": "Alimentador",

  reportante: "Reportante",
  reporter: "Reportante",
};

/**
 * Normaliza el rol sin perder su denominación oficial.
 *
 * @param {unknown} rol
 * @returns {string|null}
 */
export function normalizarRol(rol) {
  if (typeof rol !== "string") return null;

  const valor = rol
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return ALIAS_ROLES[valor] ?? null;
}

/**
 * Obtiene la ruta principal del usuario.
 *
 * @param {string} rol
 * @returns {string|null}
 */
export function rutaPorRol(rol) {
  const rutas = {
    Administrador: "/admin",
    Alimentador: "/alimentador",
    Reportante: "/reportante",
  };

  return rutas[normalizarRol(rol)] ?? null;
}
