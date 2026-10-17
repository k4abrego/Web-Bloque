/**
 * reportesAlim.jsx
 *
 * Pantalla de reportes asignados al personal alimentador.
 *
 * Consulta los reportes reales desde comms-api utilizando
 * la sesión autenticada del usuario.
 *
 * El backend determina qué reportes puede consultar
 * cada alimentador mediante su JWT.
 *
 * Funcionalidades:
 * - Consulta de reportes asignados.
 * - Búsqueda por folio, descripción o dirección.
 * - Filtros por estado y territorio.
 * - Pestañas dinámicas según los estados disponibles.
 * - Actualización manual de la lista.
 *
 * No modifica datos de MariaDB.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Filter,
  Download,
  Eye,
  ChevronDown,
  X,
  Search,
  RefreshCw,
} from "lucide-react";

import { obtenerHistoricoReportes } from "../../services/reportesApi";

import "./reportesAlim.css";

/**
 * Formatea una fecha recibida desde la API.
 *
 * @param {string|null} fecha - Fecha original.
 * @returns {string} Fecha YYYY-MM-DD o texto alternativo.
 */
function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "Sin fecha";
}

/**
 * Convierte un valor opcional en texto visible.
 *
 * @param {unknown} valor - Valor original.
 * @returns {string} Texto de presentación.
 */
function mostrarTexto(valor) {
  return valor == null || String(valor).trim() === ""
    ? "No disponible"
    : String(valor);
}

/**
 * ReportesAlim
 *
 * Presenta los reportes autorizados para el alimentador
 * autenticado y permite filtrarlos.
 *
 * @returns {import("react").JSX.Element} Página de reportes.
 */
export default function ReportesAlim() {
  const navigate = useNavigate();

  /** Datos reales obtenidos desde comms-api. */
  const [reportes, setReportes] = useState([]);

  /** Estado de consulta. */
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  /** Control de filtros. */
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [estadoActivo, setEstadoActivo] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [territorioFiltro, setTerritorioFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  /**
   * Consulta los reportes al montar el componente
   * y cada vez que el usuario solicita actualizar.
   *
   * No envía un identificador de usuario desde React.
   * El servidor identifica al alimentador por su token.
   */
  useEffect(() => {
    let vigente = true;

    obtenerHistoricoReportes()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos)) {
          throw new Error(
            "La API no devolvió una lista válida de reportes."
          );
        }

        setReportes(datos);
      })
      .catch((err) => {
        if (!vigente) return;

        console.error(
          "Error al consultar reportes asignados:",
          err
        );

        setError(
          err.message ||
            "No fue posible consultar los reportes asignados."
        );
      })
      .finally(() => {
        if (vigente) {
          setCargando(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  /**
   * Solicita nuevamente los datos del backend.
   */
  function actualizarReportes() {
    setCargando(true);
    setError("");
    setIntento((anterior) => anterior + 1);
  }

  /**
   * Construye los estados disponibles a partir de
   * los reportes devueltos por la API.
   *
   * Así evitamos filtrar con estados antiguos.
   */
  const estadosDisponibles = useMemo(() => {
    return [
      ...new Set(
        reportes
          .map((reporte) => reporte.estado)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [reportes]);

  /**
   * Obtiene los identificadores de territorio que
   * aparecen en los reportes asignados.
   *
   * El historial no devuelve el nombre del municipio;
   * por eso todavía utilizamos su identificador.
   */
  const territoriosDisponibles = useMemo(() => {
    return [
      ...new Set(
        reportes
          .map((reporte) => reporte.id_territorio)
          .filter((id) => id !== null && id !== undefined)
      ),
    ].sort((a, b) => Number(a) - Number(b));
  }, [reportes]);

  /**
   * Filtra los reportes localmente.
   *
   * La autorización de acceso se realiza previamente
   * en el backend; estos filtros solo afectan la vista.
   */
  const reportesFiltrados = useMemo(() => {
    const textoBusqueda = busqueda
      .trim()
      .toLocaleLowerCase("es");

    return reportes.filter((reporte) => {
      const textoReporte = [
        reporte.folio,
        reporte.descripcion,
        reporte.direccion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda =
        textoReporte.includes(textoBusqueda);

      const coincideEstado =
        !estadoFiltro || reporte.estado === estadoFiltro;

      const coincideTerritorio =
        !territorioFiltro ||
        String(reporte.id_territorio) === territorioFiltro;

      const coincideTab =
        estadoActivo === "Todos" ||
        reporte.estado === estadoActivo;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideTerritorio &&
        coincideTab
      );
    });
  }, [
    reportes,
    busqueda,
    estadoFiltro,
    territorioFiltro,
    estadoActivo,
  ]);

  /**
   * Restablece todos los filtros.
   */
  function limpiarFiltros() {
    setEstadoFiltro("");
    setTerritorioFiltro("");
    setBusqueda("");
    setEstadoActivo("Todos");
  }

  /**
   * Abre la ruta de detalle del reporte seleccionado.
   *
   * @param {string} folio - Folio del reporte.
   */
  function verReporte(folio) {
    navigate(
      `/alimentador/reportes/${encodeURIComponent(folio)}`
    );
  }

  return (
    <div className="reportes-alim">

      {/* Encabezado */}
      <div className="reportes-alim-header">

        <div className="reportes-alim-title">
          <h1>Reportes asignados</h1>

          <p>
            Consulta y da seguimiento a los casos
            que te han sido asignados.
          </p>
        </div>

        <div className="reportes-alim-actions">

          {/* Abrir y cerrar filtros */}
          <button
            type="button"
            className={`reportes-button ${
              filtrosAbiertos ? "active" : ""
            }`}
            onClick={() =>
              setFiltrosAbiertos((anterior) => !anterior)
            }
          >
            <Filter size={17} />
            Filtros

            <ChevronDown
              size={16}
              className={
                filtrosAbiertos ? "rotate" : ""
              }
            />
          </button>

          {/* Actualización desde MariaDB */}
          <button
            type="button"
            className="reportes-button"
            onClick={actualizarReportes}
            disabled={cargando}
          >
            <RefreshCw size={17} />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          {/* Exportación pendiente de implementar */}
          <button
            type="button"
            className="reportes-button"
            disabled
            title="Exportación pendiente de implementar"
          >
            <Download size={17} />
            Exportar
          </button>

        </div>
      </div>

      {/* Panel de filtros */}
      {filtrosAbiertos && (
        <div className="reportes-filters">

          <div className="reportes-filter-header">
            <div>
              <h3>Filtrar reportes</h3>
              <p>
                Encuentra un caso mediante sus datos
                registrados.
              </p>
            </div>

            <button
              type="button"
              className="reportes-filter-close"
              onClick={() => setFiltrosAbiertos(false)}
              aria-label="Cerrar filtros"
            >
              <X size={18} />
            </button>
          </div>

          <div className="reportes-filter-grid">

            {/* Búsqueda */}
            <div className="reportes-filter-field">
              <label htmlFor="buscar-folio">
                Buscar reporte
              </label>

              <div className="reportes-input-wrapper">
                <Search size={17} />

                <input
                  id="buscar-folio"
                  type="text"
                  placeholder="Folio, descripción o dirección"
                  value={busqueda}
                  onChange={(evento) =>
                    setBusqueda(evento.target.value)
                  }
                />
              </div>
            </div>

            {/* Estado */}
            <div className="reportes-filter-field">
              <label htmlFor="estado-filtro">
                Estado del reporte
              </label>

              <select
                id="estado-filtro"
                value={estadoFiltro}
                onChange={(evento) =>
                  setEstadoFiltro(evento.target.value)
                }
              >
                <option value="">Todos los estados</option>

                {estadosDisponibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Territorio */}
            <div className="reportes-filter-field">
              <label htmlFor="localidad-filtro">
                Territorio
              </label>

              <select
                id="localidad-filtro"
                value={territorioFiltro}
                onChange={(evento) =>
                  setTerritorioFiltro(evento.target.value)
                }
              >
                <option value="">Todos los territorios</option>

                {territoriosDisponibles.map((id) => (
                  <option key={id} value={String(id)}>
                    Territorio {id}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="reportes-filter-footer">
            <button
              type="button"
              className="reportes-clear-button"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>

        </div>
      )}

      {/* Pestañas por estado real */}
      <div className="reportes-tabs">

        <button
          type="button"
          className={`reportes-tab ${
            estadoActivo === "Todos" ? "active" : ""
          }`}
          onClick={() => setEstadoActivo("Todos")}
        >
          Todos
        </button>

        {estadosDisponibles.map((estado) => (
          <button
            key={estado}
            type="button"
            className={`reportes-tab ${
              estadoActivo === estado ? "active" : ""
            }`}
            onClick={() => setEstadoActivo(estado)}
          >
            {estado}
          </button>
        ))}

      </div>

      {/* Errores de consulta */}
      {!cargando && error && (
        <div
          className="reportes-filters"
          role="alert"
        >
          <p>{error}</p>

          <button
            type="button"
            className="reportes-button"
            onClick={actualizarReportes}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="reportes-table-card">
        <div className="reportes-table-wrapper">

          <table className="reportes-table">

            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Ubicación</th>
                <th>Territorio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {cargando ? (
                <tr>
                  <td colSpan={7}>
                    <div
                      className="reportes-empty"
                      role="status"
                    >
                      Cargando reportes asignados...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7}>
                    <div className="reportes-empty">
                      No fue posible cargar los reportes.
                    </div>
                  </td>
                </tr>
              ) : reportesFiltrados.length > 0 ? (
                reportesFiltrados.map((reporte) => (
                  <tr key={reporte.folio}>

                    <td className="reportes-folio">
                      {reporte.folio}
                    </td>

                    <td>
                      {formatearFecha(
                        reporte.fecha_envio
                      )}
                    </td>

                    <td className="reportes-description">
                      {mostrarTexto(
                        reporte.descripcion
                      )}
                    </td>

                    <td>
                      {mostrarTexto(
                        reporte.direccion
                      )}
                    </td>

                    <td>
                      {reporte.id_territorio != null
                        ? `Territorio ${reporte.id_territorio}`
                        : "No disponible"}
                    </td>

                    <td>
                      <span
                        className={`reportes-status status-${String(
                          reporte.estado ?? ""
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {mostrarTexto(
                          reporte.estado
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="reportes-view-button"
                        onClick={() =>
                          verReporte(reporte.folio)
                        }
                        title="Ver reporte"
                      >
                        <Eye size={17} />
                        Ver
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="reportes-empty">
                      <div className="reportes-empty-icon">
                        <Search size={24} />
                      </div>

                      <strong>
                        No hay reportes para mostrar
                      </strong>

                      <span>
                        {reportes.length === 0
                          ? "Los casos que te asignen aparecerán aquí."
                          : "Ningún reporte coincide con los filtros seleccionados."}
                      </span>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
