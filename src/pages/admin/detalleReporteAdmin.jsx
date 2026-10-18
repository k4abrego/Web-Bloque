
/**
 * detalleReporteAdmin.jsx
 *
 * Consulta y administración de un expediente SIPINNA.
 *
 * Funcionalidades:
 * - Consultar el reporte real mediante su folio.
 * - Consultar y modificar la prioridad administrativa.
 * - Consultar y cambiar el alimentador responsable.
 * - Confirmar los cambios antes de guardarlos.
 * - Verificar los cambios persistidos en MariaDB.
 * - Conservar las secciones de etiquetas y evidencias.
 */

import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  UserRound,
  Paperclip,
  ClipboardCheck,
  Save,
  X,
} from "lucide-react";

import {
  obtenerReportePorId,
  obtenerHistoricoReportes,
  asignarReporte,
  obtenerPrioridadReporte,
  actualizarPrioridadReporte,
} from "../../services/reportesApi";

import { obtenerAlimentadores } from "../../services/alimentadoresApi";
import EvidenciaCard from "../../components/evidencia/evidenciaCard";
import UbicacionReporteMapa from "../../components/mapa/UbicacionReporteMapa";
import "./detalleReporteAdmin.css";

/** Prioridades admitidas por el backend. */
const PRIORIDADES = ["Alta", "Media", "Baja"];

/** Estilos de los controles nuevos. */
const estilos = {
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 520,
    marginTop: 20,
  },
  selector: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    font: "inherit",
    width: "100%",
  },
  boton: {
    alignSelf: "flex-start",
    border: "none",
    borderRadius: 8,
    background: "#6634c7",
    color: "#fff",
    padding: "12px 20px",
    fontWeight: 600,
    font: "inherit",
    cursor: "pointer",
  },
  confirmacion: {
    marginTop: 20,
    padding: 22,
    border: "1px solid #ded1ed",
    borderRadius: 14,
    background: "#faf8fd",
  },
  acciones: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  cancelar: {
    padding: "10px 18px",
    borderRadius: 9,
    border: "1px solid #cbb8df",
    color: "#512681",
    background: "#fff",
    cursor: "pointer",
    font: "inherit",
  },
  exito: {
    marginTop: 16,
    padding: "13px 16px",
    border: "1px solid #bedfc6",
    borderRadius: 10,
    background: "#edf8f0",
    color: "#246337",
  },
  error: {
    marginTop: 16,
    padding: "13px 16px",
    border: "1px solid #f2c5cb",
    borderRadius: 10,
    background: "#fff1f2",
    color: "#a52837",
  },
};

/**
 * Formatea la fecha sin cambiar de zona horaria.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "No disponible";
}

/**
 * Muestra un valor opcional.
 *
 * @param {unknown} valor
 * @returns {string}
 */
function mostrarTexto(valor) {
  return valor == null || String(valor).trim() === ""
    ? "No disponible"
    : String(valor);
}

/**
 * Construye el nombre completo del alimentador.
 *
 * @param {Object} alimentador
 * @returns {string}
 */
function nombreAlimentador(alimentador) {
  return [
    alimentador.nombre,
    alimentador.apellidos,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/**
 * DetalleReporteAdmin
 *
 * @returns {import("react").JSX.Element}
 */
export default function DetalleReporteAdmin() {
  // El parámetro de la ruta representa el folio.
  const { id: folio } = useParams();

  // Datos principales del expediente.
  const [reporte, setReporte] = useState(null);
  const [historialReporte, setHistorialReporte] = useState(null);
  const [alimentadores, setAlimentadores] = useState([]);

  // Consulta del detalle.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Consulta de asignaciones.
  const [cargandoAsignacion, setCargandoAsignacion] =
    useState(true);
  const [errorAsignacion, setErrorAsignacion] = useState("");

  // Formulario de asignación.
  const [
    alimentadorSeleccionado,
    setAlimentadorSeleccionado,
  ] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensajeAsignacion, setMensajeAsignacion] = useState("");
  const [errorGuardado, setErrorGuardado] = useState("");

  // Consulta de prioridad.
  const [prioridad, setPrioridad] = useState(null);
  const [cargandoPrioridad, setCargandoPrioridad] =
    useState(true);
  const [errorPrioridad, setErrorPrioridad] = useState("");

  // Formulario de prioridad.
  const [prioridadSeleccionada, setPrioridadSeleccionada] =
    useState("");

  const [guardandoPrioridad, setGuardandoPrioridad] =
    useState(false);

  const [
    confirmacionPrioridadAbierta,
    setConfirmacionPrioridadAbierta,
  ] = useState(false);

  const [mensajePrioridad, setMensajePrioridad] = useState("");
  const [errorGuardadoPrioridad, setErrorGuardadoPrioridad] =
    useState("");

  /**
   * Consulta el detalle principal.
   */
  useEffect(() => {
    let vigente = true;

    obtenerReportePorId(folio)
      .then((datos) => {
        if (!vigente) return;

        if (!datos?.folio) {
          throw new Error(
            "El servidor no devolvió un reporte válido."
          );
        }

        setReporte(datos);
        setError("");
      })
      .catch((err) => {
        if (!vigente) return;

        console.error("Error al consultar reporte:", err);

        setError(
          err.message ||
            "No fue posible consultar el reporte."
        );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [folio]);

  /**
   * Consulta el historial y la lista real
   * de alimentadores.
   */
  useEffect(() => {
    let vigente = true;

    Promise.all([
      obtenerHistoricoReportes(),
      obtenerAlimentadores(),
    ])
      .then(([historial, personal]) => {
        if (!vigente) return;

        if (
          !Array.isArray(historial) ||
          !Array.isArray(personal)
        ) {
          throw new Error(
            "No fue posible interpretar los datos de asignación."
          );
        }

        const encontrado = historial.find(
          (item) => item.folio === folio
        );

        if (!encontrado) {
          throw new Error(
            "El reporte no apareció en el historial autorizado."
          );
        }

        setHistorialReporte(encontrado);
        setAlimentadores(personal);

        const idActual = encontrado.id_alimentador;

        setAlimentadorSeleccionado(
          idActual == null ? "" : String(idActual)
        );

        setErrorAsignacion("");
      })
      .catch((err) => {
        if (!vigente) return;

        console.error(
          "Error al consultar asignación:",
          err
        );

        setErrorAsignacion(
          err.message ||
            "No fue posible consultar la asignación."
        );
      })
      .finally(() => {
        if (vigente) setCargandoAsignacion(false);
      });

    return () => {
      vigente = false;
    };
  }, [folio]);

  /**
   * Consulta la prioridad real registrada
   * en reporteetiqueta mediante comms-api.
   */
  useEffect(() => {
    let vigente = true;

    obtenerPrioridadReporte(folio)
      .then((datos) => {
        if (!vigente) return;

        const prioridadActual = datos?.prioridad ?? null;

        setPrioridad(prioridadActual);
        setPrioridadSeleccionada(prioridadActual || "");
        setErrorPrioridad("");
      })
      .catch((err) => {
        if (!vigente) return;

        console.error(
          "Error al consultar prioridad:",
          err
        );

        setErrorPrioridad(
          err.message ||
            "No fue posible consultar la prioridad."
        );
      })
      .finally(() => {
        if (vigente) setCargandoPrioridad(false);
      });

    return () => {
      vigente = false;
    };
  }, [folio]);

  /**
   * Asigna o reasigna un reporte.
   *
   * Conserva la operación existente y verifica
   * posteriormente el responsable en el historial.
   */
  async function guardarAsignacion(evento) {
    evento.preventDefault();

    if (guardando) return;

    setErrorGuardado("");
    setMensajeAsignacion("");

    const idAlimentador = Number(alimentadorSeleccionado);

    const seleccionado = alimentadores.find(
      (item) =>
        Number(item.id_usuario) === idAlimentador
    );

    if (
      !seleccionado ||
      !Number.isInteger(idAlimentador) ||
      idAlimentador <= 0
    ) {
      setErrorGuardado(
        "Selecciona un alimentador válido."
      );
      return;
    }

    const nombre = nombreAlimentador(seleccionado);
    const idAnterior = historialReporte?.id_alimentador;

    if (
      idAnterior != null &&
      Number(idAnterior) === idAlimentador
    ) {
      setMensajeAsignacion(
        "El reporte ya está asignado a este alimentador."
      );
      return;
    }

    const pregunta =
      idAnterior == null
        ? `¿Confirmas asignar el reporte ${folio} a ${nombre}?`
        : `¿Confirmas reasignar el reporte ${folio} a ${nombre}?`;

    // Se conserva la confirmación original de asignación.
    if (!window.confirm(pregunta)) return;

    setGuardando(true);

    try {
      await asignarReporte(folio, idAlimentador);

      const historialActualizado =
        await obtenerHistoricoReportes();

      if (!Array.isArray(historialActualizado)) {
        throw new Error(
          "No fue posible verificar la asignación."
        );
      }

      const actualizado = historialActualizado.find(
        (item) => item.folio === folio
      );

      if (
        !actualizado ||
        Number(actualizado.id_alimentador) !==
          idAlimentador
      ) {
        throw new Error(
          "La API aceptó la operación, pero no se pudo " +
          "confirmar el responsable actualizado."
        );
      }

      setHistorialReporte(actualizado);

      setMensajeAsignacion(
        `El reporte fue asignado correctamente a ${nombre}.`
      );
    } catch (err) {
      console.error("Error en la asignación:", err);

      setErrorGuardado(
        err.message ||
          "No fue posible completar o verificar la asignación."
      );
    } finally {
      setGuardando(false);
    }
  }

  /**
   * Abre el recuadro para confirmar un cambio
   * de prioridad, sin modificar todavía MariaDB.
   */
  function solicitarCambioPrioridad(evento) {
    evento.preventDefault();

    if (guardandoPrioridad || cargandoPrioridad) return;

    setMensajePrioridad("");
    setErrorGuardadoPrioridad("");

    if (!PRIORIDADES.includes(prioridadSeleccionada)) {
      setErrorGuardadoPrioridad(
        "Selecciona una prioridad válida."
      );
      return;
    }

    if (prioridadSeleccionada === prioridad) {
      setErrorGuardadoPrioridad(
        "Selecciona una prioridad diferente a la actual."
      );
      return;
    }

    setConfirmacionPrioridadAbierta(true);
  }

  /**
   * Cancela la confirmación.
   */
  function cancelarCambioPrioridad() {
    if (guardandoPrioridad) return;

    setConfirmacionPrioridadAbierta(false);
  }

  /**
   * Guarda la nueva prioridad en MariaDB.
   *
   * Después consulta nuevamente el backend
   * para verificar la prioridad persistida.
   */
  async function confirmarCambioPrioridad() {
    if (
      !confirmacionPrioridadAbierta ||
      guardandoPrioridad ||
      !PRIORIDADES.includes(prioridadSeleccionada)
    ) {
      return;
    }

    const nuevaPrioridad = prioridadSeleccionada;

    if (nuevaPrioridad === prioridad) {
      setConfirmacionPrioridadAbierta(false);
      return;
    }

    setGuardandoPrioridad(true);
    setMensajePrioridad("");
    setErrorGuardadoPrioridad("");

    try {
      await actualizarPrioridadReporte(
        folio,
        nuevaPrioridad
      );

      setConfirmacionPrioridadAbierta(false);

      // Verificar la información realmente guardada.
      try {
        const respuesta = await obtenerPrioridadReporte(folio);

        const prioridadConfirmada =
          respuesta?.prioridad ?? null;

        setPrioridad(prioridadConfirmada);
        setPrioridadSeleccionada(
          prioridadConfirmada || ""
        );

        if (prioridadConfirmada === nuevaPrioridad) {
          setMensajePrioridad(
            `La prioridad se actualizó correctamente a "${nuevaPrioridad}".`
          );
        } else {
          setErrorGuardadoPrioridad(
            "El servidor aceptó la operación, pero la " +
            "consulta posterior mostró otra prioridad."
          );
        }
      } catch {
        setMensajePrioridad(
          "El servidor confirmó el cambio, pero no fue " +
          "posible consultar nuevamente la prioridad. " +
          "Recarga la página para verificarla."
        );
      }
    } catch (err) {
      console.error(
        "Error al actualizar prioridad:",
        err
      );

      setErrorGuardadoPrioridad(
        err.message ||
          "No fue posible actualizar la prioridad."
      );

      setConfirmacionPrioridadAbierta(false);
    } finally {
      setGuardandoPrioridad(false);
    }
  }

  /** Datos visibles del expediente. */
  const estadoReporte = reporte?.estatus || "Sin estado";
  const fechaReporte = formatearFecha(reporte?.fecha_envio);
  const direccionReporte = mostrarTexto(reporte?.direccion);

  /** Etiquetas todavía no incluidas en el detalle. */
  const etiquetas = Array.isArray(reporte?.etiquetas)
    ? reporte.etiquetas
    : null;

  /** Evidencias todavía no incluidas en el detalle. */
  const evidencias = Array.isArray(reporte?.evidencias)
    ? reporte.evidencias
    : null;

  /** Alimentador responsable. */
  const idResponsable = historialReporte?.id_alimentador;

  const responsable = alimentadores.find(
    (item) =>
      Number(item.id_usuario) === Number(idResponsable)
  );

  const textoResponsable = cargandoAsignacion
    ? "Consultando..."
    : errorAsignacion
      ? "No disponible"
      : idResponsable == null
        ? "Sin asignar"
        : responsable
          ? nombreAlimentador(responsable)
          : `Usuario ID ${idResponsable}`;

  /** Navegación de regreso. */
  const enlaceVolver = (
    <NavLink
      to="/admin/reportes"
      className="detalle-volver"
    >
      <ArrowLeft size={18} />
      Volver a reportes
    </NavLink>
  );

  if (cargando) {
    return (
      <div className="detalle-reporte">
        {enlaceVolver}

        <div
          className="detalle-no-encontrado"
          role="status"
        >
          <h1>Cargando reporte...</h1>
          <p>Consultando la información registrada.</p>
        </div>
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div className="detalle-reporte">
        {enlaceVolver}

        <div
          className="detalle-no-encontrado"
          role="alert"
        >
          <h1>No fue posible mostrar el reporte</h1>

          <p>
            {error ||
              "El reporte solicitado no está disponible."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-reporte">
      {enlaceVolver}

      {/* Encabezado del reporte */}
      <div className="detalle-header">
        <div>
          <span className="detalle-folio">
            {reporte.folio}
          </span>

          <h1>Detalle del reporte</h1>

          <p>
            Información y seguimiento del reporte registrado.
          </p>
        </div>

        <div className="detalle-badges">
          {/* Estado real */}
          <span
            className="detalle-estado-badge"
            data-estado={estadoReporte}
          >
            {estadoReporte}
          </span>

          {/* Prioridad real */}
          <span
            className="detalle-prioridad-badge"
            data-prioridad={prioridad || "Sin asignar"}
          >
            Prioridad:{" "}
            {cargandoPrioridad
              ? "Consultando..."
              : errorPrioridad
                ? "No disponible"
                : prioridad || "Sin asignar"}
          </span>
        </div>
      </div>

      {/* Información general */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Información general</h2>

          <p>
            Datos principales relacionados con el reporte.
          </p>
        </div>

        <div className="detalle-info-grid">
          <div className="detalle-info-item">
            <div className="detalle-info-icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>Fecha de registro</span>
              <strong>{fechaReporte}</strong>
            </div>
          </div>

          <div className="detalle-info-item">
            <div className="detalle-info-icon">
              <MapPin size={20} />
            </div>

            <div>
              <span>Ubicación</span>
              <strong>{direccionReporte}</strong>
            </div>
          </div>

          <div className="detalle-info-item">
            <div className="detalle-info-icon">
              <UserRound size={20} />
            </div>

            <div>
              <span>Alimentador asignado</span>
              <strong>{textoResponsable}</strong>
            </div>
          </div>

          <div className="detalle-info-item">
            <div className="detalle-info-icon">
              <Paperclip size={20} />
            </div>

            <div>
              <span>Evidencias registradas</span>

              <strong>
                {evidencias
                  ? evidencias.length
                  : "Pendiente de consultar"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación geográfica real del expediente. */}
      <UbicacionReporteMapa
        folio={folio}
        reporte={reporte}
      />

      {/* Descripción original */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Descripción del reporte</h2>
          <p>Situación registrada originalmente.</p>
        </div>

        <p>{mostrarTexto(reporte.descripcion)}</p>
      </div>

      {/* Clasificación administrativa por prioridad */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Clasificación por prioridad</h2>

          <p>
            Establece la prioridad administrativa del
            expediente. Esta clasificación es independiente
            de la percepción de riesgo del reportante.
          </p>
        </div>

        <div className="detalle-info-grid">
          <div className="detalle-info-item">
            <div className="detalle-info-icon">
              <ClipboardCheck size={20} />
            </div>

            <div>
              <span>Prioridad actual</span>

              <strong>
                {cargandoPrioridad
                  ? "Consultando..."
                  : errorPrioridad
                    ? "No disponible"
                    : prioridad || "Sin asignar"}
              </strong>
            </div>
          </div>
        </div>

        {errorPrioridad ? (
          <div role="alert" style={estilos.error}>
            {errorPrioridad}
          </div>
        ) : cargandoPrioridad ? (
          <p role="status" style={{ marginTop: 20 }}>
            Consultando prioridad del expediente...
          </p>
        ) : (
          <form onSubmit={solicitarCambioPrioridad}>
            <div style={estilos.campo}>
              <label htmlFor="prioridad-reporte-admin">
                <strong>Nueva prioridad</strong>
              </label>

              <select
                id="prioridad-reporte-admin"
                value={prioridadSeleccionada}
                onChange={(evento) => {
                  setPrioridadSeleccionada(
                    evento.target.value
                  );
                  setConfirmacionPrioridadAbierta(false);
                  setMensajePrioridad("");
                  setErrorGuardadoPrioridad("");
                }}
                disabled={guardandoPrioridad}
                required
                style={estilos.selector}
              >
                {!PRIORIDADES.includes(
                  prioridadSeleccionada
                ) && (
                  <option value="">
                    Selecciona una prioridad
                  </option>
                )}

                {PRIORIDADES.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>

            {/* Recuadro integrado de confirmación */}
            {confirmacionPrioridadAbierta && (
              <div
                style={{
                  ...estilos.confirmacion,
                  maxWidth: 650,
                }}
                role="group"
                aria-label="Confirmar cambio de prioridad"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 8px" }}>
                      Confirmar cambio de prioridad
                    </h3>

                    <p style={{ margin: 0, color: "#6b7280" }}>
                      Revisa la clasificación antes
                      de guardarla.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelarCambioPrioridad}
                    disabled={guardandoPrioridad}
                    aria-label="Cancelar cambio"
                    style={{
                      ...estilos.cancelar,
                      padding: 8,
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <p style={{ marginTop: 20 }}>
                  Reporte <strong>{folio}</strong>
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 15,
                  }}
                >
                  <span
                    style={{
                      padding: "10px 15px",
                      background: "#fff",
                      border: "1px solid #e1dce8",
                      borderRadius: 9,
                      fontWeight: 600,
                    }}
                  >
                    {prioridad || "Sin asignar"}
                  </span>

                  <ArrowRight
                    size={19}
                    color="#7956a5"
                  />

                  <span
                    style={{
                      padding: "10px 15px",
                      background: "#f0e8f8",
                      border: "1px solid #cdb6e5",
                      borderRadius: 9,
                      color: "#512681",
                      fontWeight: 600,
                    }}
                  >
                    {prioridadSeleccionada}
                  </span>
                </div>

                <div style={estilos.acciones}>
                  <button
                    type="button"
                    onClick={cancelarCambioPrioridad}
                    disabled={guardandoPrioridad}
                    style={estilos.cancelar}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={confirmarCambioPrioridad}
                    disabled={guardandoPrioridad}
                    style={estilos.boton}
                  >
                    {guardandoPrioridad
                      ? "Guardando..."
                      : "Confirmar cambio"}
                  </button>
                </div>
              </div>
            )}

            {mensajePrioridad && (
              <div role="status" style={estilos.exito}>
                {mensajePrioridad}
              </div>
            )}

            {errorGuardadoPrioridad && (
              <div role="alert" style={estilos.error}>
                {errorGuardadoPrioridad}
              </div>
            )}

            <button
              type="submit"
              disabled={
                guardandoPrioridad ||
                confirmacionPrioridadAbierta ||
                !prioridadSeleccionada ||
                prioridadSeleccionada === prioridad
              }
              style={{
                ...estilos.boton,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
                opacity:
                  guardandoPrioridad ||
                  confirmacionPrioridadAbierta ||
                  !prioridadSeleccionada ||
                  prioridadSeleccionada === prioridad
                    ? 0.55
                    : 1,
              }}
            >
              <Save size={17} />
              Guardar prioridad
            </button>
          </form>
        )}
      </div>

      {/* Asignación de reportes: funcionalidad existente */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Asignación del reporte</h2>

          <p>
            Selecciona al alimentador responsable
            de dar seguimiento a este caso.
          </p>
        </div>

        <div className="detalle-info-grid">
          <div className="detalle-info-item">
            <div className="detalle-info-icon">
              <ClipboardCheck size={20} />
            </div>

            <div>
              <span>Responsable actual</span>
              <strong>{textoResponsable}</strong>
            </div>
          </div>
        </div>

        {cargandoAsignacion ? (
          <p role="status">
            Consultando alimentadores y asignación...
          </p>
        ) : errorAsignacion ? (
          <p role="alert" style={{ marginTop: 16 }}>
            {errorAsignacion}
          </p>
        ) : (
          <form
            onSubmit={guardarAsignacion}
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 520,
            }}
          >
            <label htmlFor="alimentador-asignacion">
              Alimentador responsable
            </label>

            <select
              id="alimentador-asignacion"
              value={alimentadorSeleccionado}
              onChange={(evento) => {
                setAlimentadorSeleccionado(
                  evento.target.value
                );
                setErrorGuardado("");
                setMensajeAsignacion("");
              }}
              disabled={
                guardando || alimentadores.length === 0
              }
              required
              style={estilos.selector}
            >
              <option value="">
                Selecciona un alimentador
              </option>

              {alimentadores.map((item) => (
                <option
                  key={item.id_usuario}
                  value={String(item.id_usuario)}
                >
                  {nombreAlimentador(item)}
                  {" — "}
                  {item.institucion ||
                    "Institución no indicada"}
                </option>
              ))}
            </select>

            {alimentadores.length === 0 && (
              <p>
                No hay alimentadores activos disponibles.
              </p>
            )}

            <button
              type="submit"
              disabled={
                guardando ||
                !alimentadorSeleccionado ||
                alimentadores.length === 0
              }
              style={{
                ...estilos.boton,
                opacity: guardando ? 0.6 : 1,
              }}
            >
              {guardando
                ? "Guardando asignación..."
                : idResponsable == null
                  ? "Asignar reporte"
                  : "Guardar asignación"}
            </button>

            {mensajeAsignacion && (
              <p role="status" style={{ color: "#168052" }}>
                {mensajeAsignacion}
              </p>
            )}

            {errorGuardado && (
              <p role="alert" style={{ color: "#b42318" }}>
                {errorGuardado}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Etiquetas: pendiente de endpoint de consulta */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Etiquetas</h2>

          <p>
            Clasificaciones asignadas al reporte.
          </p>
        </div>

        <div className="detalle-etiquetas">
          {etiquetas === null ? (
            <span className="detalle-sin-etiquetas">
              Las etiquetas todavía no están disponibles
              en esta consulta.
            </span>
          ) : etiquetas.length > 0 ? (
            etiquetas.map((etiqueta, index) => (
              <span
                key={index}
                className="detalle-etiqueta"
              >
                {typeof etiqueta === "string"
                  ? etiqueta
                  : etiqueta.nombre_etiqueta ||
                    etiqueta.nombre ||
                    "Etiqueta"}
              </span>
            ))
          ) : (
            <span className="detalle-sin-etiquetas">
              Este reporte no tiene etiquetas asignadas.
            </span>
          )}
        </div>
      </div>

      {/* Evidencias: se conserva la sección original */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Evidencias</h2>

          <p>Archivos asociados al reporte.</p>
        </div>

        {evidencias === null ? (
          <div className="detalle-sin-evidencias">
            <Paperclip size={32} />

            <div>
              <strong>
                Evidencias pendientes de consultar
              </strong>

              <p>
                La consulta de detalle todavía no
                incluye los archivos asociados.
              </p>
            </div>
          </div>
        ) : evidencias.length > 0 ? (
          <div className="detalle-evidencias">
            {evidencias.map((evidencia, index) => (
              <EvidenciaCard
                key={evidencia.id ?? index}
                evidencia={evidencia}
              />
            ))}
          </div>
        ) : (
          <div className="detalle-sin-evidencias">
            <Paperclip size={32} />

            <div>
              <strong>Sin evidencias registradas</strong>
              <p>
                Este reporte no tiene archivos asociados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
