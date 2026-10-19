/**
 * @file ActualizarEstadoReporte.jsx
 * @description
 * Componente de seguimiento administrativo de expedientes SIPINNA.
 *
 * Permite:
 * - Consultar el estado actual recibido del backend.
 * - Seleccionar un nuevo estado válido.
 * - Confirmar el cambio antes de enviarlo.
 * - Actualizar el estado mediante comms-api.
 * - Verificar el cambio consultando nuevamente el expediente.
 * - Informar al componente padre del resultado actualizado.
 *
 * No modifica la prioridad, las asignaciones ni las observaciones.
 */

import { useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  Save,
  X,
} from "lucide-react";

import {
  actualizarEstadoReporte,
  obtenerReportePorId,
} from "../../services/reportesApi";

/**
 * Estados admitidos por el procedimiento
 * almacenado ActualizarEstadoReporte.
 *
 * "Registrado" puede aparecer como estado actual,
 * pero no es un destino permitido por el procedimiento.
 *
 * @type {string[]}
 */


/**
 * Estados oficiales del expediente SIPINNA.
 *
 * Deben coincidir con:
 * - expediente.estado en MariaDB.
 * - ActualizarEstadoReporte (procedimiento almacenado).
 * - isReportStatus en comms-api.
 */

const ESTADOS_PERMITIDOS = [
  "Registrado",
  "En revisión",
  "En seguimiento",
  "Canalizado",
  "Concluido",
  "Archivado",
  "Cancelado",
  "Reincidente",
];


/**
 * Obtiene el estado actual del expediente.
 *
 * @param {object|null} reporte
 * @returns {string}
 */
function obtenerEstado(reporte) {
  return reporte?.estatus || reporte?.estado || "";
}

/**
 * Formulario de actualización del estado.
 *
 * @param {object} props
 * @param {string} props.folio - Folio del expediente.
 * @param {object} props.reporte - Detalle actual del expediente.
 * @param {(reporte: object) => void} props.onActualizado
 *   Notifica al componente padre cuando se obtiene el detalle actualizado.
 * @returns {import("react").JSX.Element}
 */
export default function ActualizarEstadoReporte({
  folio,
  reporte,
  onActualizado,
}) {
  const estadoActual = obtenerEstado(reporte);

  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState(estadoActual);

  const [confirmacionAbierta, setConfirmacionAbierta] =
    useState(false);

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorGuardado, setErrorGuardado] = useState("");

  /**
   * Verifica el formulario y solicita confirmación.
   *
   * No envía todavía ninguna petición al backend.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} evento
   */
  function solicitarConfirmacion(evento) {
    evento.preventDefault();

    if (guardando || !reporte) return;

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
   * Cancela el cambio sin modificar el expediente.
   */
  function cancelarConfirmacion() {
    if (guardando) return;
    setConfirmacionAbierta(false);
  }

  /**
   * Envía el cambio de estado mediante el endpoint existente.
   *
   * observaciones: null conserva las observaciones anteriores
   * gracias a COALESCE en ActualizarEstadoReporte (MariaDB).
   *
   * Posteriormente consulta el expediente para verificar
   * el resultado realmente persistido.
   */
  async function confirmarCambio() {
    if (
      !confirmacionAbierta ||
      guardando ||
      !ESTADOS_PERMITIDOS.includes(estadoSeleccionado) ||
      estadoSeleccionado === estadoActual
    ) {
      return;
    }

    const nuevoEstado = estadoSeleccionado;

    setGuardando(true);
    setMensajeExito("");
    setErrorGuardado("");

    try {
      await actualizarEstadoReporte(folio, {
        estado: nuevoEstado,
        observaciones: null,
      });

      setConfirmacionAbierta(false);

      try {
        const detalleActualizado =
          await obtenerReportePorId(folio);

        const estadoConfirmado =
          obtenerEstado(detalleActualizado);

        if (estadoConfirmado === nuevoEstado) {
          onActualizado?.(detalleActualizado);

          setMensajeExito(
            `El estado del expediente se actualizó correctamente a "${nuevoEstado}".`
          );
        } else {
          setErrorGuardado(
            "El servidor aceptó la operación, pero " +
            "la consulta posterior mostró un estado diferente."
          );
        }
      } catch (errorConsulta) {
        console.error(
          "No fue posible verificar el nuevo estado:",
          errorConsulta
        );

        setErrorGuardado(
          "El servidor aceptó la modificación, pero " +
          "no fue posible verificarla. Recarga el reporte."
        );
      }
    } catch (error) {
      console.error(
        "Error al actualizar estado:",
        error
      );

      setConfirmacionAbierta(false);

      setErrorGuardado(
        error?.message ||
        "No fue posible actualizar el estado del expediente."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="detalle-card">
      <div className="detalle-card-header">
        <h2>Actualizar estado del expediente</h2>

        <p>
          Modifica la etapa de seguimiento del reporte.
          El cambio se guardará en la base de datos.
        </p>
      </div>

      <div className="detalle-info-grid">
        <div className="detalle-info-item">
          <div className="detalle-info-icon">
            <ClipboardCheck size={20} />
          </div>

          <div>
            <span>Estado actual</span>
            <strong>
              {estadoActual || "Sin estado"}
            </strong>
          </div>
        </div>
      </div>

      <form
        onSubmit={solicitarConfirmacion}
        style={{
          maxWidth: 520,
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <label htmlFor="nuevo-estado-admin">
          <strong>Nuevo estado del expediente</strong>
        </label>

        <select
          id="nuevo-estado-admin"
          value={estadoSeleccionado}
          onChange={(evento) => {
            setEstadoSeleccionado(evento.target.value);
            setConfirmacionAbierta(false);
            setMensajeExito("");
            setErrorGuardado("");
          }}
          disabled={guardando}
          required
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
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

        {confirmacionAbierta && (
          <div
            role="group"
            aria-label="Confirmar cambio de estado"
            style={{
              marginTop: 12,
              padding: 22,
              border: "1px solid #ded1ed",
              borderRadius: 14,
              background: "#faf8fd",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ marginTop: 0 }}>
                  Confirmar cambio de estado
                </h3>

                <p>
                  Revisa la modificación antes de guardarla.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelarConfirmacion}
                disabled={guardando}
                aria-label="Cancelar cambio"
                style={{
                  alignSelf: "flex-start",
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p>
              Reporte <strong>{folio}</strong>
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                margin: "16px 0",
              }}
            >
              <strong>{estadoActual}</strong>

              <ArrowRight size={20} color="#6634c7" />

              <strong style={{ color: "#6634c7" }}>
                {estadoSeleccionado}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={cancelarConfirmacion}
                disabled={guardando}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #cbb8df",
                  background: "#fff",
                  color: "#512681",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarCambio}
                disabled={guardando}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: 0,
                  background: "#6634c7",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {guardando
                  ? "Guardando..."
                  : "Confirmar cambio"}
              </button>
            </div>
          </div>
        )}

        {mensajeExito && (
          <div
            role="status"
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#edf8f0",
              color: "#246337",
            }}
          >
            {mensajeExito}
          </div>
        )}

        {errorGuardado && (
          <div
            role="alert"
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#fff1f2",
              color: "#a52837",
            }}
          >
            {errorGuardado}
          </div>
        )}

        <button
          type="submit"
          disabled={
            guardando ||
            confirmacionAbierta ||
            !ESTADOS_PERMITIDOS.includes(
              estadoSeleccionado
            ) ||
            estadoSeleccionado === estadoActual
          }
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            marginTop: 8,
            borderRadius: 8,
            border: 0,
            background: "#6634c7",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Save size={17} />
          Guardar estado
        </button>
      </form>
    </section>
  );
}

