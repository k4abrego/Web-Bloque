/**
 * @file administradoresApi.js
 * @description Operaciones reales para administrar cuentas
 * institucionales con rol Administrador.
 */

import { authApiFetch } from "./api";

/**
 * Consulta administradores activos e inactivos.
 *
 * @returns {Promise<Object[]>} Cuentas de MariaDB.
 */
export function obtenerAdministradores() {
  return authApiFetch("/admin/administradores");
}

/**
 * Registra un administrador utilizando el endpoint
 * de registro existente en auth-backend.
 *
 * @param {Object} datos - Datos del formulario.
 * @returns {Promise<Object>} Confirmación del registro.
 */
export async function registrarAdministrador(datos) {
  const adminId = Number(
    localStorage.getItem("user_id")
  );

  if (
    !Number.isSafeInteger(adminId) ||
    adminId <= 0
  ) {
    throw new Error(
      "No se encontró una sesión de administrador válida."
    );
  }

  const respuesta = await authApiFetch(
    `/register/admin/${adminId}`,
    {
      method: "POST",
      body: JSON.stringify({
        institution_id: Number(datos.institutionId),
        new_admin: {
          name: datos.nombre,
          surname: datos.apellidos,
          email: datos.correo,
          phone_number: datos.telefono || null,
          password: datos.password,
        },
      }),
    }
  );

  if (
    !respuesta ||
    !Number.isInteger(Number(respuesta.user_id)) ||
    Number(respuesta.user_id) <= 0
  ) {
    throw new Error(
      "El servidor no confirmó la creación del administrador."
    );
  }

  return respuesta;
}

/**
 * Actualiza los datos e institución de un administrador.
 *
 * @param {number} id - ID del administrador.
 * @param {Object} datos - Datos normalizados.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export function editarAdministrador(id, datos) {
  return authApiFetch(
    `/admin/administradores/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        correo: datos.correo,
        telefono: datos.telefono || null,
        institution_id: Number(datos.institutionId),
      }),
    }
  );
}

/**
 * Activa o desactiva una cuenta administradora.
 *
 * @param {number} id - ID del administrador.
 * @param {boolean} activo - Estado deseado.
 * @returns {Promise<Object>} Confirmación de MariaDB.
 */
export function cambiarEstadoAdministrador(id, activo) {
  return authApiFetch(
    `/admin/administradores/${id}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        es_activo: activo,
      }),
    }
  );
}

