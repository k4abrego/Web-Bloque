/**
 * @file cuentasInstitucionalesApi.js
 * @description Servicio de registro de cuentas institucionales
 * mediante el backend de autenticación de SIPINNA.
 *
 * Utiliza el JWT almacenado en la sesión actual a través
 * de authApiFetch.
 *
 * El registro de alimentadores se realiza en MariaDB,
 * no mediante modificaciones temporales en React.
 */

import { authApiFetch } from "./api";

/**
 * Registra un alimentador dentro de una institución existente.
 *
 * Endpoint:
 * POST /register/feeder/:id
 *
 * El parámetro :id identifica al administrador autenticado
 * que realiza el registro.
 *
 * @param {Object} datos - Información de la cuenta nueva.
 * @param {number} datos.institutionId - ID real de institución.
 * @param {string} datos.nombre - Nombre del alimentador.
 * @param {string} datos.apellidos - Apellidos del alimentador.
 * @param {string} datos.correo - Correo electrónico.
 * @param {string} datos.telefono - Teléfono opcional en formato E.164.
 * @param {string} datos.password - Contraseña inicial.
 *
 * @returns {Promise<Object>} Respuesta confirmada por el backend.
 *
 * @throws {Error} Cuando no existe una sesión válida,
 * falla la petición o el servidor no confirma el registro.
 */
export async function registrarAlimentador(datos) {
  const adminId = Number(
    localStorage.getItem("user_id")
  );

  if (
    !Number.isSafeInteger(adminId) ||
    adminId <= 0
  ) {
    throw new Error(
      "No se encontró la sesión del administrador. " +
      "Vuelve a iniciar sesión."
    );
  }

  const institutionId = Number(datos.institutionId);

  if (
    !Number.isSafeInteger(institutionId) ||
    institutionId <= 0
  ) {
    throw new Error(
      "Selecciona una institución válida."
    );
  }

  const respuesta = await authApiFetch(
    `/Registrar/Alimentador/${adminId}`,
    {
      method: "POST",

      body: JSON.stringify({
        institution_id: institutionId,

        new_feeders: [
          {
            name: datos.nombre,
            surname: datos.apellidos,
            email: datos.correo,
            password: datos.password,
            phone_number: datos.telefono || null,
          },
        ],
      }),
    }
  );

  /**
   * El endpoint puede devolver una respuesta HTTP exitosa
   * incluso si alguna inserción individual falló.
   *
   * Por eso comprobamos que la cuenta solicitada haya
   * sido confirmada por el backend antes de informar éxito.
   */
  if (
    !Array.isArray(respuesta?.new_feeders) ||
    respuesta.new_feeders.length !== 1 ||
    respuesta.errors?.length
  ) {
    throw new Error(
      "El backend no confirmó la creación del alimentador. " +
      "Comprueba si la cuenta aparece en la lista antes de reintentar."
    );
  }

  return respuesta;
}


/**
 * Edita los datos personales y la institución de un alimentador.
 *
 * Envía una petición real a auth-backend, que actualiza
 * las tablas usuario y administrador mediante una transacción.
 *
 * @param {number} id - ID del alimentador que se editará.
 * @param {Object} datos - Información actualizada.
 * @param {string} datos.nombre - Nombre.
 * @param {string} datos.apellidos - Apellidos.
 * @param {string} datos.correo - Correo electrónico.
 * @param {string} [datos.telefono] - Teléfono en formato E.164.
 * @param {number} datos.institutionId - ID de la institución.
 * @returns {Promise<Object>} Respuesta de auth-backend.
 * @throws {Error} Si la actualización falla.
 */
export async function editarAlimentador(id, datos) {
  return authApiFetch(`/admin/alimentadores/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      telefono: datos.telefono?.trim() || null,
      institution_id: Number(datos.institutionId),
    }),
  });
}

/**
 * Activa o desactiva una cuenta alimentadora.
 *
 * El backend actualiza usuario.es_activo e invalida
 * las claves JWT asociadas a la cuenta.
 *
 * @param {number} id - ID del alimentador.
 * @param {boolean} esActivo - true para activar,
 * false para desactivar.
 * @returns {Promise<Object>} Confirmación del backend.
 * @throws {Error} Si no se puede actualizar el estado.
 */
export async function cambiarEstadoAlimentador(id, esActivo) {
  return authApiFetch(
    `/admin/alimentadores/${id}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        es_activo: esActivo,
      }),
    }
  );
}
