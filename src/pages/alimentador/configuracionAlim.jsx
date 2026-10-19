import { useEffect, useMemo, useState } from "react";
import {
  User,
  Activity,
  ClipboardList,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { authApiFetch } from "../../services/api";
import { obtenerHistoricoReportes } from "../../services/reportesApi";

import "./configuracionAlim.css";

/**
 * Estados que representan expedientes en proceso.
 * @type {Set<string>}
 */
const ESTADOS_PROCESO = new Set([
  "En revisión",
  "En seguimiento",
  "Canalizado",
  "Reincidente",
]);

/**
 * Estados que representan expedientes finalizados.
 * @type {Set<string>}
 */
const ESTADOS_FINALIZADOS = new Set([
  "Concluido",
  "Archivado",
  "Cancelado",
]);

/**
 * Devuelve un texto válido para mostrar en pantalla.
 *
 * @param {unknown} valor - Valor recibido.
 * @returns {string} Texto o guion.
 */
function mostrarDato(valor) {
  if (valor == null || String(valor).trim() === "") {
    return "—";
  }

  return String(valor);
}

/**
 * Página de configuración del alimentador.
 *
 * Consulta:
 * - Los datos personales del usuario autenticado.
 * - Los expedientes asignados al usuario.
 *
 * @returns {import("react").JSX.Element}
 */
function ConfiguracionAlim() {
  const [usuario, setUsuario] = useState(null);
  const [reportes, setReportes] = useState([]);

  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [cargandoReportes, setCargandoReportes] = useState(true);

  const [errorUsuario, setErrorUsuario] = useState("");
  const [errorReportes, setErrorReportes] = useState("");

  const correo = localStorage.getItem("correo")?.trim() || "";

  /**
   * Obtiene la información personal desde auth-backend.
   */
  useEffect(() => {
    let vigente = true;

    async function cargarUsuario() {
      if (!correo) {
        setErrorUsuario(
          "No se encontró el correo de la sesión. Cierra sesión e inicia nuevamente."
        );
        setCargandoUsuario(false);
        return;
      }

      try {
        const datos = await authApiFetch(
          `/user/${encodeURIComponent(correo)}`
        );

        if (vigente) {
          setUsuario(datos);
          setErrorUsuario("");
        }
      } catch (error) {
        if (vigente) {
          setErrorUsuario(
            error?.message || "No se pudo consultar el perfil."
          );
        }
      } finally {
        if (vigente) {
          setCargandoUsuario(false);
        }
      }
    }

    cargarUsuario();

    return () => {
      vigente = false;
    };
  }, [correo]);

  /**
   * Obtiene los expedientes asignados al alimentador
   * desde el mismo servicio utilizado por su dashboard.
   */
  useEffect(() => {
    let vigente = true;

    async function cargarActividad() {
      try {
        const datos = await obtenerHistoricoReportes();

        if (!Array.isArray(datos)) {
          throw new Error(
            "La API no devolvió una lista válida de reportes."
          );
        }

        if (vigente) {
          setReportes(datos);
          setErrorReportes("");
        }
      } catch (error) {
        if (vigente) {
          setReportes([]);
          setErrorReportes(
            error?.message ||
              "No fue posible consultar los reportes asignados."
          );
        }
      } finally {
        if (vigente) {
          setCargandoReportes(false);
        }
      }
    }

    cargarActividad();

    return () => {
      vigente = false;
    };
  }, []);

  /**
   * Construye el nombre completo del usuario.
   */
  const nombreCompleto = usuario
    ? [usuario.name, usuario.surname].filter(Boolean).join(" ")
    : "";

  /**
   * Calcula las estadísticas con los estados reales.
   */
  const actividad = useMemo(
    () => ({
      asignados: reportes.length,

      registrados: reportes.filter(
        (reporte) => reporte.estado === "Registrado"
      ).length,

      enProceso: reportes.filter((reporte) =>
        ESTADOS_PROCESO.has(reporte.estado)
      ).length,

      finalizados: reportes.filter((reporte) =>
        ESTADOS_FINALIZADOS.has(reporte.estado)
      ).length,
    }),
    [reportes]
  );

  /**
   * Muestra hasta cinco expedientes de la lista recibida.
   * No interpreta sus estados como eventos de auditoría.
   */
  const reportesRecientes = useMemo(
    () => reportes.slice(0, 5),
    [reportes]
  );

  return (
    <div className="config-alim">
      <div className="config-alim-header">
        <h1>Configuración</h1>
        <p>
          Consulta tu información y administra las opciones
          de tu cuenta.
        </p>
      </div>

      {/* Información personal */}
      <section className="config-alim-section">
        <div className="config-alim-section-header">
          <div className="config-alim-section-icon">
            <User size={21} />
          </div>

          <div>
            <h2>Mis datos</h2>
            <p>Información asociada a tu cuenta.</p>
          </div>
        </div>

        {cargandoUsuario && (
          <p className="config-alim-mensaje" role="status">
            Cargando información de tu cuenta...
          </p>
        )}

        {errorUsuario && (
          <p className="config-alim-error" role="alert">
            {errorUsuario}
          </p>
        )}

        <div className="config-alim-data-grid">
          <div className="config-alim-data-item">
            <span>Nombre</span>
            <strong>{mostrarDato(nombreCompleto)}</strong>
          </div>

          <div className="config-alim-data-item">
            <span>Correo electrónico</span>
            <strong>{mostrarDato(correo)}</strong>
          </div>

          <div className="config-alim-data-item">
            <span>Rol</span>
            <strong>Alimentador</strong>
          </div>

          
            <div className="config-alim-data-item">
            <span>Municipio</span>
            <strong>{mostrarDato(usuario?.municipio)}</strong>
            </div>

            <div className="config-alim-data-item">
            <span>Organización</span>
            <strong>{mostrarDato(usuario?.organizacion)}</strong>
            </div>
        </div>

      </section>

      {/* Actividad real */}
      <section className="config-alim-section">
        <div className="config-alim-section-header">
          <div className="config-alim-section-icon">
            <Activity size={21} />
          </div>

          <div>
            <h2>Mi actividad</h2>
            <p>
              Resumen de los expedientes que tienes asignados.
            </p>
          </div>
        </div>

        {cargandoReportes ? (
          <p className="config-alim-mensaje" role="status">
            Cargando actividad...
          </p>
        ) : errorReportes ? (
          <p className="config-alim-error" role="alert">
            {errorReportes}
          </p>
        ) : (
          <div className="config-alim-actividad-contenido">
            <div className="config-alim-estadisticas">
              <div className="config-alim-estadistica">
                <ClipboardList size={22} />
                <span>Casos asignados</span>
                <strong>{actividad.asignados}</strong>
              </div>

              <div className="config-alim-estadistica">
                <Clock3 size={22} />
                <span>En proceso</span>
                <strong>{actividad.enProceso}</strong>
              </div>

              <div className="config-alim-estadistica">
                <CheckCircle2 size={22} />
                <span>Finalizados</span>
                <strong>{actividad.finalizados}</strong>
              </div>
            </div>

            <div className="config-alim-reportes-recientes">
              <h3>Expedientes asignados</h3>

              {reportesRecientes.length === 0 ? (
                <p>No tienes expedientes asignados.</p>
              ) : (
                <div className="config-alim-lista-reportes">
                  {reportesRecientes.map((reporte) => (
                    <div
                      className="config-alim-reporte"
                      key={reporte.folio}
                    >
                      <span>
                        {mostrarDato(reporte.folio)}
                      </span>

                      <strong>
                        {mostrarDato(reporte.estado)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ConfiguracionAlim;