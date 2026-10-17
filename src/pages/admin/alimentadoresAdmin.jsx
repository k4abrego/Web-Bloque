
/**
 * alimentadoresAdmin.jsx
 *
 * Pantalla de gestión de alimentadores.
 *
 * Consulta los alimentadores registrados en MariaDB
 * mediante la API de comunicación de SIPINNA.
 *
 * Adapta la respuesta para utilizar el componente
 * reutilizable GestionCuentas.
 *
 * IMPORTANTE:
 * La consulta de cuentas es real.
 * Las operaciones de creación, edición y desactivación
 * siguen siendo temporales dentro de GestionCuentas.
 */

import { useEffect, useState } from "react";

import GestionCuentas from "./gestionCuentas";

import {
  obtenerAlimentadores,
} from "../../services/alimentadoresApi";

/**
 * Convierte un registro del backend al formato
 * utilizado por el componente GestionCuentas.
 *
 * @param {Object} alimentador - Registro devuelto por la API.
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

    // La API todavía no devuelve municipios por usuario.
    // No se asigna automáticamente el de la institución.
    municipios: [],

    alias: `Alimentador ${String(
      alimentador.id_usuario
    ).padStart(2, "0")}`,

    // Actualmente el endpoint devuelve cuentas activas.
    estado: "Activo",

    // Los reportes asignados todavía no se consultan.
    reportes: 0,
  };
}

/**
 * AlimentadoresAdmin
 *
 * Obtiene los alimentadores reales desde el backend
 * y los proporciona al componente GestionCuentas.
 *
 * @returns {JSX.Element} Pantalla de alimentadores.
 */
export default function AlimentadoresAdmin() {
  /**
   * Registros recuperados desde la API.
   */
  const [cuentas, setCuentas] = useState([]);

  /**
   * Indica si la consulta continúa ejecutándose.
   */
  const [cargando, setCargando] = useState(true);

  /**
   * Mensaje de error de la consulta.
   */
  const [error, setError] = useState("");

  /**
   * Consulta los alimentadores cuando se monta la página.
   *
   * Evita actualizar el estado si el componente
   * se desmonta antes de terminar la petición.
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
  }, []);

  /**
   * Muestra un indicador durante la consulta inicial.
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
   * Muestra el error sin sustituirlo por registros ficticios.
   */
  if (error) {
    return (
      <div className="alimentadores-admin">
        <h1>Cuentas de alimentadores</h1>
        <p role="alert">{error}</p>
        <p>
          Comprueba que la API de comunicación esté
          funcionando en el puerto 8085.
        </p>
      </div>
    );
  }

  /**
   * Presenta las cuentas reales usando la interfaz existente.
   *
   * La propiedad key hace que GestionCuentas inicialice
   * su estado local cuando cambie el resultado de la consulta.
   */
  return (
    <GestionCuentas
      key="alimentadores-reales"
      tipo="alimentador"
      inicialesCuentas={cuentas}
    />
  );
}
