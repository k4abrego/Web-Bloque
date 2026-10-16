/**
 * permisos.js
 *
 * Define los permisos visuales provisionales
 * de los diferentes tipos de usuarios.
 *
 * IMPORTANTE:
 * Estas comprobaciones no sustituyen la
 * autorización del backend.
 */

import { normalizarRol } from "./roles";

/**
 * ID temporal del administrador principal.
 *
 * Corresponde a la cuenta administrativa de prueba.
 */
const ADMIN_PRINCIPAL_ID = 3;

/**
 * Obtiene el contexto de permisos visuales
 * del usuario autenticado.
 *
 * @returns {Object} Información de permisos.
 */
export function obtenerPermisos() {
  const rol = normalizarRol(localStorage.getItem("rol"));

  const userId = Number(
    localStorage.getItem("user_id")
  );

  const esAdministrador = rol === "admin";

  const esAdministradorPrincipal =
    esAdministrador &&
    userId === ADMIN_PRINCIPAL_ID;

  return {
    rol,
    userId,
    esAdministrador,
    esAdministradorPrincipal,

    puedeGestionarAlimentadores: esAdministrador,

    puedeGestionarAdministradores:
      esAdministradorPrincipal,
  };
}
