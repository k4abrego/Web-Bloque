/**
 * detalleReporteAlim.jsx
 *
 * Detalle de un reporte asignado al alimentador.
 *
 * Funcionalidades:
 * - Consulta del reporte desde comms-api.
 * - Consulta del municipio real desde MariaDB.
 * - Actualización del estado del expediente.
 * - Confirmación visual antes de guardar.
 * - Verificación del estado después de actualizar.
 *
 * El backend valida los permisos mediante JWT.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPin,
  RefreshCw,
  Save,
  X,
} from "lucide-react";

import {
  obtenerReportePorId,
  obtenerHistoricoReportes,
  actualizarEstadoReporte,
} from "../../services/reportesApi";

import { obtenerTerritorios } from "../../services/territoriosApi";

import "./detallesReporteAlim.css";

/**
 * Estados admitidos por comms-api y MariaDB.
 */
const ESTADOS_PERMITIDOS = [
  "Nuevo",
  "En revisión",
  "Asignado",
  "En investigación",
  "Canalizado a Procuraduría",
  "Cerrado",
  "Descartado",
];

/**
 * Formatea una fecha recibida del backend.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) return "No disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return String(fecha);
  }

  return valor.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Obtiene el estado de un reporte.
 *
 * @param {Object|null} reporte
 * @returns {string}
 */
function estadoDelReporte(reporte) {
  return reporte?.estatus || reporte?.estado || "";
}

/**
 * DetalleReporteAlim
 *
 * @returns {import("react").JSX.Element}
 */
function DetalleReporteAlim() {
  const { folio } = useParams();
  const navigate = useNavigate();

  // Datos del expediente.
  const [reporte, setReporte] = useState(null);
  const [municipio, setMunicipio] = useState("No disponible");

  // Consulta del reporte.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  // Edición del estado.
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Confirmación integrada en la página.
  const [confirmacionAbierta, setConfirmacionAbierta] =
    useState(false);

  // Resultado de la operación.
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorGuardado, setErrorGuardado] = useState("");

  /**
   * Consulta el expediente y su municipio.
   */
  useEffect(() => {
    let vigente = true;

    async function consultarDatos() {
      try {
        const detalle = await obtenerReportePorId(folio);

        if (!vigente) return;

        setReporte(detalle);
        setEstadoSeleccionado(estadoDelReporte(detalle));
        setError("");

        const [resultadoHistorial, resultadoTerritorios] =
          await Promise.allSettled([
            obtenerHistoricoReportes(),
            obtenerTerritorios(),
          ]);

        if (!vigente) return;

        const historial =
          resultadoHistorial.status === "fulfilled" &&
          Array.isArray(resultadoHistorial.value)
            ? resultadoHistorial.value
            : [];

        const catalogo =
          resultadoTerritorios.status === "fulfilled" &&
          Array.isArray(resultadoTerritorios.value?.territorios)
            ? resultadoTerritorios.value.territorios
            : [];

        const registro = historial.find(
          (item) => item.folio === folio
        );

        const idTerritorio =
          registro?.id_territorio ?? detalle?.id_territorio;

        if (idTerritorio == null) {
          setMunicipio("No disponible");
        } else {
          const territorio = catalogo.find(
            (item) =>
              String(item.id_territorio) ===
              String(idTerritorio)
          );

          setMunicipio(
            territorio?.nombre || `Territorio ${idTerritorio}`
          );
        }
      } catch (err) {
        if (!vigente) return;

        console.error("Error al consultar el reporte:", err);

        setReporte(null);
        setError(
          err?.message ||
            "No fue posible consultar el reporte."
        );
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    consultarDatos();

    return () => {
      vigente = false;
    };
  }, [folio, intento]);

  /**
   * Actualiza los datos mostrados en pantalla.
   */
  function cargarReporte() {
    if (guardando) return;

    setCargando(true);
    setError("");
    setMensajeExito("");
    setErrorGuardado("");
    setConfirmacionAbierta(false);
    setIntento((anterior) => anterior + 1);
  }

  /**
   * Solicita confirmación antes de actualizar.
   *
   * No realiza ninguna petición HTTP.
   */
  function solicitarConfirmacion(evento) {
    evento.preventDefault();

    if (!reporte || guardando) return;

    const estadoActual = estadoDelReporte(reporte);

    setMensajeExito("");
    setErrorGuardado("");

    if (!ESTADOS_PERMITIDOS.includes(estadoSeleccionado)) {
      setErrorGuardado("Selecciona un estado válido.");
      return;
    }

    if (estadoSeleccionado === estadoActual) {
      setErrorGuardado(
        "Selecciona un estado diferente al actual."
      );
      return;
    }

    setConfirmacionAbierta(true);
  }

  /**
   * Cierra la confirmación sin modificar MariaDB.
   */
  function cancelarConfirmacion() {
    if (guardando) return;

    setConfirmacionAbierta(false);
  }

  /**
   * Actualiza el estado mediante comms-api.
   *
   * Se envía observaciones: null para conservar
   * las observaciones existentes.
   */
  async function confirmarCambioEstado() {
    if (!reporte || guardando || !confirmacionAbierta) {
      return;
    }

    const nuevoEstado = estadoSeleccionado;
    const estadoAnterior = estadoDelReporte(reporte);

    if (
      !ESTADOS_PERMITIDOS.includes(nuevoEstado) ||
      nuevoEstado === estadoAnterior
    ) {
      setConfirmacionAbierta(false);
      return;
    }

    setGuardando(true);
    setErrorGuardado("");
    setMensajeExito("");

    try {
      // Persistencia real mediante PATCH.
      await actualizarEstadoReporte(folio, {
        estado: nuevoEstado,
        observaciones: null,
      });

      // La operación fue aceptada: cerrar el recuadro.
      setConfirmacionAbierta(false);

      // Comprobar el estado guardado consultando otra vez.
      try {
        const detalleActualizado =
          await obtenerReportePorId(folio);

        setReporte(detalleActualizado);

        const estadoConfirmado =
          estadoDelReporte(detalleActualizado);

        setEstadoSeleccionado(estadoConfirmado);

        if (estadoConfirmado === nuevoEstado) {
          setMensajeExito(
            `El estado se actualizó correctamente a "${estadoConfirmado}".`
          );
        } else {
          setErrorGuardado(
            "El servidor aceptó el cambio, pero la consulta " +
              "posterior mostró un estado diferente."
          );
        }
      } catch {
        setMensajeExito(
          "El servidor confirmó el cambio, pero no fue " +
            "posible consultar nuevamente el reporte. " +
            "Presiona Actualizar para verificarlo."
        );
      }
    } catch (err) {
      console.error(
        "Error al actualizar el estado del reporte:",
        err
      );

      setErrorGuardado(
        err?.message ||
          "No fue posible actualizar el estado del expediente."
      );

      setConfirmacionAbierta(false);
    } finally {
      setGuardando(false);
    }
  }

  const estadoActual = estadoDelReporte(reporte);

  return (
    <div className="detalle-alim">
      {/* Barra de navegación */}
      <div className="detalle-alim-encabezado">
        <button
          type="button"
          className="detalle-alim-volver"
          onClick={() => navigate("/alimentador/reportes")}
        >
          <ArrowLeft size={18} />
          Volver a mis reportes
        </button>

        <button
          type="button"
          className="detalle-alim-actualizar"
          onClick={cargarReporte}
          disabled={cargando || guardando}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {/* Encabezado */}
      <div className="detalle-alim-titulo">
        <h1>Detalle del reporte</h1>

        <p>
          Consulta la información y actualiza el estado
          del caso que te ha sido asignado.
        </p>
      </div>

      {cargando ? (
        <div className="detalle-alim-mensaje">
          Cargando información del reporte...
        </div>
      ) : error ? (
        <div className="detalle-alim-mensaje detalle-alim-error">
          <strong>No fue posible cargar el reporte.</strong>
          <p>{error}</p>
        </div>
      ) : !reporte ? (
        <div className="detalle-alim-mensaje">
          No se encontró el reporte solicitado.
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="detalle-alim-resumen">
            <div>
              <span className="detalle-alim-etiqueta">
                Folio
              </span>

              <h2>{reporte.folio || folio}</h2>
            </div>

            <span className="detalle-alim-estado">
              {estadoActual || "Sin estado"}
            </span>
          </div>

          {/* Información general */}
          <div className="detalle-alim-grid">
            <section className="detalle-alim-tarjeta">
              <h3>
                <ClipboardList size={20} />
                Información general
              </h3>

              <div className="detalle-alim-campo">
                <span>
                  <CalendarDays size={17} />
                  Fecha de envío
                </span>

                <strong>
                  {formatearFecha(reporte.fecha_envio)}
                </strong>
              </div>

              <div className="detalle-alim-campo">
                <span>
                  <MapPin size={17} />
                  Ubicación reportada
                </span>

                <strong>
                  {reporte.direccion ||
                    "Ubicación no disponible"}
                </strong>
              </div>

              <div className="detalle-alim-campo">
                <span>
                  <MapPin size={17} />
                  Municipio / territorio
                </span>

                <strong>{municipio}</strong>
              </div>

              <div className="detalle-alim-campo">
                <span>Estado del reporte</span>

                <strong>
                  {estadoActual || "Sin estado"}
                </strong>
              </div>
            </section>

            {/* Descripción */}
            <section className="detalle-alim-tarjeta">
              <h3>
                <FileText size={20} />
                Descripción del caso
              </h3>

              <p className="detalle-alim-descripcion">
                {reporte.descripcion ||
                  "No se proporcionó una descripción."}
              </p>
            </section>
          </div>

          {/* Actualización del estado */}
          <section className="detalle-alim-tarjeta detalle-alim-seguimiento">
            <h3>
              <ClipboardList size={20} />
              Actualizar estado del reporte
            </h3>

            <p>
              Selecciona el nuevo estado del expediente.
              Los cambios se guardarán en la base de datos
              y podrán ser consultados por el administrador.
            </p>

            <form onSubmit={solicitarConfirmacion}>
              <div
                className="detalle-alim-campo"
                style={{ maxWidth: "480px" }}
              >
                <label
                  htmlFor="estado-reporte-alim"
                  style={{
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Nuevo estado del expediente
                </label>

                <select
                  id="estado-reporte-alim"
                  value={estadoSeleccionado}
                  onChange={(evento) => {
                    setEstadoSeleccionado(evento.target.value);
                    setMensajeExito("");
                    setErrorGuardado("");
                    setConfirmacionAbierta(false);
                  }}
                  disabled={guardando}
                  required
                  style={{
                    width: "100%",
                    minHeight: "44px",
                    padding: "10px 12px",
                    border: "1px solid #d9dce5",
                    borderRadius: "10px",
                    background: "#fff",
                    color: "#182033",
                    font: "inherit",
                  }}
                >
                  {!ESTADOS_PERMITIDOS.includes(
                    estadoSeleccionado
                  ) && (
                    <option value="">
                      Selecciona un estado
                    </option>
                  )}

                  {ESTADOS_PERMITIDOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confirmación dentro de la página */}
              {confirmacionAbierta && (
                <div
                  className="detalle-alim-confirmacion"
                  role="group"
                  aria-label="Confirmar cambio de estado"
                >
                  <div className="detalle-alim-confirmacion-header">
                    <div>
                      <h4>Confirmar cambio de estado</h4>

                      <p>
                        Revisa la modificación antes de guardarla.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="detalle-alim-confirmacion-cerrar"
                      onClick={cancelarConfirmacion}
                      disabled={guardando}
                      aria-label="Cancelar cambio"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="detalle-alim-confirmacion-folio">
                    Reporte <strong>{folio}</strong>
                  </p>

                  <div className="detalle-alim-confirmacion-cambio">
                    <span className="detalle-alim-confirmacion-estado">
                      {estadoActual}
                    </span>

                    <ArrowRight size={19} />

                    <span className="detalle-alim-confirmacion-estado nuevo">
                      {estadoSeleccionado}
                    </span>
                  </div>

                  <div className="detalle-alim-confirmacion-acciones">
                    <button
                      type="button"
                      className="detalle-alim-confirmacion-cancelar"
                      onClick={cancelarConfirmacion}
                      disabled={guardando}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="detalle-alim-confirmacion-aceptar"
                      onClick={confirmarCambioEstado}
                      disabled={guardando}
                    >
                      {guardando
                        ? "Guardando..."
                        : "Confirmar cambio"}
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje de éxito */}
              {mensajeExito && (
                <div
                  className="detalle-alim-resultado-exito"
                  role="status"
                >
                  {mensajeExito}
                </div>
              )}

              {/* Mensaje de error */}
              {errorGuardado && (
                <div
                  className="detalle-alim-resultado-error"
                  role="alert"
                >
                  {errorGuardado}
                </div>
              )}

              <button
                type="submit"
                className="detalle-alim-actualizar"
                disabled={
                  guardando ||
                  confirmacionAbierta ||
                  !estadoSeleccionado ||
                  estadoSeleccionado === estadoActual
                }
                style={{
                  marginTop: "20px",
                  background: "#512681",
                  color: "#fff",
                }}
              >
                <Save size={17} />

                Guardar cambios
              </button>
            </form>

            <div
              className="detalle-alim-aviso"
              style={{ marginTop: "22px" }}
            >
              Las observaciones y el historial de seguimiento
              se integrarán por separado. Esta operación
              actualiza únicamente el estado del expediente.
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DetalleReporteAlim;
