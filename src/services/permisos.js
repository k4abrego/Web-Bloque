
/**
 * @file permisos.js
 * @description Permisos visuales basados en roles de SIPINNA.
 *
 * Estas comprobaciones controlan la interfaz.
 * El backend debe validar independientemente cada operación.
 */

import { normalizarRol } from "./roles";

/**
 * Obtiene los permisos del usuario autenticado.
 *
 * @returns {Object}
 */
export function obtenerPermisos() {
  const rol = normalizarRol(localStorage.getItem("rol"));

  const userId = Number(localStorage.getItem("user_id"));

  const esAdministrador = rol === "Administrador";

  return {
    rol,
    userId,
    esAdministrador,

    esAdministradorPrincipal:
      esAdministrador && userId === 3,

    puedeGestionarAlimentadores: esAdministrador,

    puedeGestionarAdministradores: esAdministrador,
  };
}
