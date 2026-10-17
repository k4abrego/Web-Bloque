/**
 * detalleReporteAdmin.jsx
 *
 * Pantalla de consulta y asignación de reportes
 * para administradores de SIPINNA.
 *
 * Funcionalidades:
 * - Consultar el detalle real por folio.
 * - Consultar el responsable desde el historial.
 * - Obtener alimentadores registrados.
 * - Asignar o reasignar un reporte.
 * - Mostrar errores y estados de carga.
 *
 * La prioridad, etiquetas y evidencias se integrarán
 * cuando sus respectivos endpoints estén disponibles.
 */

import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  UserRound,
  Paperclip,
  ClipboardCheck,
} from "lucide-react";

import {
  obtenerReportePorId,
  obtenerHistoricoReportes,
  asignarReporte,
} from "../../services/reportesApi";

import { obtenerAlimentadores } from "../../services/alimentadoresApi";

import EvidenciaCard from "../../components/evidencia/evidenciaCard";

import "./detalleReporteAdmin.css";

/**
 * Da formato a una fecha recibida de la API.
 *
 * @param {string|null} fecha - Fecha original.
 * @returns {string} Fecha en formato YYYY-MM-DD.
 */
function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "No disponible";
}

/**
 * Devuelve una representación segura de texto.
 *
 * @param {unknown} valor - Valor original.
 * @returns {string} Texto para mostrar.
 */
function mostrarTexto(valor) {
  return valor == null || String(valor).trim() === ""
    ? "No disponible"
    : String(valor);
}

/**
 * Obtiene el nombre completo de un alimentador.
 *
 * @param {Object} alimentador - Registro de la API.
 * @returns {string} Nombre y apellidos.
 */
function nombreAlimentador(alimentador) {
  return [
    alimentador.nombre,
    alimentador.apellidos,
  ].filter(Boolean).join(" ").trim();
}

/**
 * Renderiza el detalle de un reporte y permite
 * asignarlo a un alimentador autorizado.
 *
 * @returns {import("react").JSX.Element}
 */
export default function DetalleReporteAdmin() {
  /** El parámetro id de la ruta representa el folio. */
  const { id: folio } = useParams();

  /** Datos recuperados del backend. */
  const [reporte, setReporte] = useState(null);
  const [historialReporte, setHistorialReporte] = useState(null);
  const [alimentadores, setAlimentadores] = useState([]);

  /** Estados de carga y error del detalle. */
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  /** Estados de los datos complementarios. */
  const [cargandoAsignacion, setCargandoAsignacion] = useState(true);
  const [errorAsignacion, setErrorAsignacion] = useState("");

  /** Control de selección y guardado. */
  const [alimentadorSeleccionado, setAlimentadorSeleccionado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeAsignacion, setMensajeAsignacion] = useState("");
  const [errorGuardado, setErrorGuardado] = useState("");

  /**
   * Consulta el detalle cuando cambia el folio.
   *
   * El resultado incluye folio, estatus,
   * fecha_envio, descripcion y direccion.
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
      })
      .catch((err) => {
        if (!vigente) return;

        console.error("Error al consultar reporte:", err);

        setError(
          err.message || "No fue posible consultar el reporte."
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
   * Consulta los alimentadores y el historial.
   *
   * El historial proporciona id_alimentador.
   * El catálogo permite resolver el nombre completo.
   *
   * Ambas solicitudes son independientes del detalle,
   * por lo que un error aquí no oculta el reporte.
   */
  useEffect(() => {
    let vigente = true;

    Promise.all([
      obtenerHistoricoReportes(),
      obtenerAlimentadores(),
    ])
      .then(([historial, personal]) => {
        if (!vigente) return;

        if (!Array.isArray(historial) ||
            !Array.isArray(personal)) {
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
      })
      .catch((err) => {
        if (!vigente) return;

        console.error("Error al consultar asignación:", err);

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
   * Asigna el reporte al alimentador seleccionado.
   *
   * Es una operación persistente sobre MariaDB.
   * Solicita confirmación antes de efectuarla.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} evento
   */
  async function guardarAsignacion(evento) {
    evento.preventDefault();

    setErrorGuardado("");
    setMensajeAsignacion("");

    const idAlimentador = Number(alimentadorSeleccionado);

    const seleccionado = alimentadores.find(
      (item) => item.id_usuario === idAlimentador
    );

    if (!seleccionado || !Number.isInteger(idAlimentador)) {
      setErrorGuardado("Selecciona un alimentador válido.");
      return;
    }

    const nombre = nombreAlimentador(seleccionado);
    const idAnterior = historialReporte?.id_alimentador;

    if (idAnterior != null &&
        Number(idAnterior) === idAlimentador) {
      setMensajeAsignacion(
        "El reporte ya está asignado a este alimentador."
      );
      return;
    }

    const pregunta = idAnterior == null
      ? `¿Confirmas asignar el reporte ${folio} a ${nombre}?`
      : `¿Confirmas reasignar el reporte ${folio} a ${nombre}?`;

    if (!window.confirm(pregunta)) {
      return;
    }

    setGuardando(true);

    try {
      /**
       * Primero solicita el cambio al servidor.
       * Después consulta el historial nuevamente
       * para verificar el responsable persistido.
       */
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

      if (!actualizado ||
          Number(actualizado.id_alimentador) !== idAlimentador) {
        throw new Error(
          "La API aceptó la operación, pero no se pudo confirmar el responsable actualizado."
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
        "No fue posible completar o verificar la asignación. Consulta el historial antes de reintentar."
      );
    } finally {
      setGuardando(false);
    }
  }

  /** Valores del reporte. */
  const estadoReporte = reporte?.estatus || "Sin estado";
  const fechaReporte = formatearFecha(reporte?.fecha_envio);
  const direccionReporte = mostrarTexto(reporte?.direccion);

  /** Información aún no incluida en el detalle actual. */
  const prioridad = reporte?.prioridad ?? null;

  const etiquetas = Array.isArray(reporte?.etiquetas)
    ? reporte.etiquetas
    : null;

  const evidencias = Array.isArray(reporte?.evidencias)
    ? reporte.evidencias
    : null;

  /** Identificador del alimentador asignado. */
  const idResponsable = historialReporte?.id_alimentador;

  const responsable = alimentadores.find(
    (item) => Number(item.id_usuario) === Number(idResponsable)
  );

  /**
   * Diferencia un reporte sin asignación de otro
   * cuya asignación no se pudo consultar.
   */
  const textoResponsable = cargandoAsignacion
    ? "Consultando..."
    : errorAsignacion
      ? "No disponible"
      : idResponsable == null
        ? "Sin asignar"
        : responsable
          ? nombreAlimentador(responsable)
          : `Usuario ID ${idResponsable}`;

  /** Enlace para regresar a la lista. */
  const enlaceVolver = (
    <NavLink
      to="/admin/reportes"
      className="detalle-volver"
    >
      <ArrowLeft size={18} />
      Volver a reportes
    </NavLink>
  );

  /** Estado de carga. */
  if (cargando) {
    return (
      <div className="detalle-reporte">
        {enlaceVolver}

        <div className="detalle-no-encontrado" role="status">
          <h1>Cargando reporte...</h1>
          <p>Consultando la información registrada.</p>
        </div>
      </div>
    );
  }

  /** Error de consulta. */
  if (error || !reporte) {
    return (
      <div className="detalle-reporte">
        {enlaceVolver}

        <div className="detalle-no-encontrado" role="alert">
          <h1>No fue posible mostrar el reporte</h1>

          <p>
            {error || "El reporte solicitado no está disponible."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-reporte">

      {enlaceVolver}

      {/* Encabezado */}
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
          <span
            className="detalle-estado-badge"
            data-estado={estadoReporte}
          >
            {estadoReporte}
          </span>

          <span
            className="detalle-prioridad-badge"
            data-prioridad={prioridad || "Sin asignar"}
          >
            Prioridad: {prioridad || "Sin asignar"}
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

      {/* Descripción original */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Descripción del reporte</h2>
          <p>Situación registrada originalmente.</p>
        </div>

        <p>{mostrarTexto(reporte.descripcion)}</p>
      </div>

      {/* Asignación del reporte */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Asignación del reporte</h2>

          <p>
            Selecciona al alimentador responsable de dar
            seguimiento a este caso.
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
              disabled={guardando || alimentadores.length === 0}
              required
              style={{
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "white",
                font: "inherit",
              }}
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
                  {item.institucion || "Institución no indicada"}
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
                alignSelf: "flex-start",
                border: "none",
                borderRadius: 8,
                background: "#6634c7",
                color: "#fff",
                padding: "12px 20px",
                fontWeight: 600,
                cursor: guardando ? "wait" : "pointer",
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

      {/* Etiquetas */}
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

      {/* Evidencias */}
      <div className="detalle-card">
        <div className="detalle-card-header">
          <h2>Evidencias</h2>

          <p>
            Archivos asociados al reporte.
          </p>
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
