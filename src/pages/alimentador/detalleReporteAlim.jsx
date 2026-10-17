
/**
 * detalleReporteAlim.jsx
 *
 * Muestra la información de un reporte asignado
 * al alimentador autenticado.
 *
 * Los datos se consultan desde comms-api.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPin,
  RefreshCw,
} from "lucide-react";

import { obtenerReportePorId } from "../../services/reportesApi";
import "./detallesReporteAlim.css";

/**
 * Convierte una fecha a un formato legible.
 *
 * @param {string} fecha Fecha recibida del backend.
 * @returns {string} Fecha formateada.
 */
function formatearFecha(fecha) {
  if (!fecha) return "No disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * DetalleReporteAlim
 *
 * Consulta y presenta la información del reporte
 * correspondiente al folio de la URL.
 *
 * @returns {JSX.Element}
 */
function DetalleReporteAlim() {
  const { folio } = useParams();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  /**
   * Consulta el detalle del reporte.
   */
  async function cargarReporte() {
    setCargando(true);
    setError("");

    try {
      const resultado = await obtenerReportePorId(folio);
      setReporte(resultado);
    } catch (err) {
      setReporte(null);
      setError(
        err?.message ||
          "No fue posible consultar el reporte."
      );
    } finally {
      setCargando(false);
    }
  }


/**
 * Consulta el reporte cada vez que cambia el folio.
 * Evita actualizaciones de estado de solicitudes anteriores.
 */
    useEffect(() => {
    let cancelado = false;

    obtenerReportePorId(folio)
        .then((resultado) => {
        if (cancelado) return;

        setReporte(resultado);
        setError("");
        setCargando(false);
        })
        .catch((err) => {
        if (cancelado) return;

        setReporte(null);
        setError(
            err?.message || "No fue posible consultar el reporte."
        );
        setCargando(false);
        });

    return () => {
        cancelado = true;
    };
    }, [folio]);


  return (
    <div className="detalle-alim">
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
          disabled={cargando}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div className="detalle-alim-titulo">
        <h1>Detalle del reporte</h1>
        <p>
          Consulta la información del caso que te ha
          sido asignado.
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
          <div className="detalle-alim-resumen">
            <div>
              <span className="detalle-alim-etiqueta">
                Folio
              </span>
              <h2>{reporte.folio || folio}</h2>
            </div>

            <span className="detalle-alim-estado">
              {reporte.estatus || "Sin estado"}
            </span>
          </div>

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
                <span>Estado del reporte</span>
                <strong>
                  {reporte.estatus || "Sin estado"}
                </strong>
              </div>
            </section>

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

          <section className="detalle-alim-tarjeta detalle-alim-seguimiento">
            <h3>
              <ClipboardList size={20} />
              Seguimiento del reporte
            </h3>

            <p>
              Este apartado permitirá registrar y
              consultar las acciones realizadas durante
              la atención del caso.
            </p>

            <div className="detalle-alim-aviso">
              El registro de seguimiento estará disponible
              cuando conectemos las operaciones
              correspondientes del backend.
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DetalleReporteAlim;
