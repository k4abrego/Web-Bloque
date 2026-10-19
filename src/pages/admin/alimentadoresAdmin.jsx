/**
 * @file alimentadoresAdmin.jsx
 * @description Pantalla de administración de alimentadores.
 *
 * Recupera las cuentas institucionales reales mediante
 * la API de comunicación de SIPINNA.
 *
 * Convierte los registros del backend al formato
 * requerido por el componente GestionCuentas.
 *
 * Cuando se registra una nueva cuenta, vuelve a consultar
 * MariaDB para obtener los datos actualizados.
 *
 * No crea registros locales ficticios.
 */

import { useEffect, useState } from "react";

import GestionCuentas from "./gestionCuentas";

import {
  obtenerAlimentadores,
} from "../../services/alimentadoresApi";

/**
 * Adapta un registro institucional del backend
 * al formato que utiliza GestionCuentas.
 *
 * @param {Object} alimentador - Registro de la API.
 * @returns {Object} Cuenta adaptada para la interfaz.
 */
function adaptarAlimentador(alimentador) {
  return {
    id: alimentador.id_usuario,

    nombre: alimentador.nombre || "",
    apellidos: alimentador.apellidos || "",
    correo: alimentador.correo || "",
    telefono: alimentador.telefono || "",

    institucion: alimentador.institucion || "",

    /**
     * Actualmente el endpoint no proporciona una
     * asignación independiente de municipios.
     *
     * La institución se relaciona con su territorio
     * en MariaDB.
     */
    municipios: [],

    alias: `Alimentador ${String(
      alimentador.id_usuario
    ).padStart(2, "0")}`,

    /**
     * El endpoint actual devuelve alimentadores activos.
     * Hasta tener un endpoint de listado con estado,
     * no podemos representar cuentas desactivadas.
     */
    estado: "Activo",

    /**
     * El número de reportes asignados todavía no
     * forma parte de la respuesta de este endpoint.
     */
    reportes: 0,
  };
}

/**
 * AlimentadoresAdmin
 *
 * Consulta los alimentadores desde la API y administra
 * la recarga después de un registro exitoso.
 *
 * @returns {import("react").JSX.Element}
 * Pantalla de gestión de alimentadores.
 */
export default function AlimentadoresAdmin() {
  /**
   * Cuentas reales recuperadas del backend.
   */
  const [cuentas, setCuentas] = useState([]);

  /**
   * Contador utilizado para solicitar una nueva consulta
   * después de registrar una cuenta.
   */
  const [revision, setRevision] = useState(0);

  /**
   * Indica si se está ejecutando la consulta inicial
   * o una actualización posterior.
   */
  const [cargando, setCargando] = useState(true);

  /**
   * Error de comunicación o respuesta inválida.
   */
  const [error, setError] = useState("");

  /**
   * Consulta los alimentadores al montar la pantalla
   * y cada vez que cambia el contador de revisión.
   *
   * Evita actualizar React después de desmontar
   * el componente.
   */
  useEffect(() => {
    let activo = true;

    async function cargarAlimentadores() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await obtenerAlimentadores();

        if (!Array.isArray(respuesta)) {
          throw new Error(
            "El servidor no devolvió una lista de alimentadores."
          );
        }

        const cuentasAdaptadas = respuesta.map(
          adaptarAlimentador
        );

        if (activo) {
          setCuentas(cuentasAdaptadas);
        }
      } catch (err) {
        console.error(
          "Error al consultar alimentadores:",
          err
        );

        if (activo) {
          setError(
            err.message ||
            "No fue posible obtener los alimentadores."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarAlimentadores();

    return () => {
      activo = false;
    };
  }, [revision]);

  /**
   * Solicita volver a consultar las cuentas.
   *
   * GestionCuentas llama esta función únicamente
   * cuando el backend confirma un nuevo registro.
   *
   * @returns {void}
   */
  function actualizarCuentas() {
    setRevision((valor) => valor + 1);
  }

  /**
   * Presenta el estado de carga.
   */
  if (cargando) {
    return (
      <div className="alimentadores-admin">
        <h1>Cuentas de alimentadores</h1>
        <p>Cargando alimentadores registrados...</p>
      </div>
    );
  }

  /**
   * Presenta errores reales de consulta.
   * Nunca reemplaza una respuesta fallida
   * por datos simulados.
   */
  if (error) {
    return (
      <div className="alimentadores-admin">
        <h1>Cuentas de alimentadores</h1>

        <p role="alert">{error}</p>

        <p>
          Comprueba que la API de comunicación
          esté funcionando y sea accesible.
        </p>

        <button
          type="button"
          onClick={actualizarCuentas}
        >
          Reintentar
        </button>
      </div>
    );
  }

  /**
   * Muestra las cuentas reales en GestionCuentas.
   *
   * La propiedad key permite reinicializar el estado
   * del componente cuando se recupera la lista.
   */
  return (
    <GestionCuentas
      key={`alimentadores-reales-${revision}`}
      tipo="alimentador"
      inicialesCuentas={cuentas}
      onCuentaCreada={actualizarCuentas}
    />
  );
}