/**
 * reportesAlim.jsx
 *
 * Pantalla de reportes asignados al personal alimentador.
 *
 * Funcionalidades:
 * - Consulta de reportes reales desde comms-api.
 * - Consulta del catálogo real de territorios.
 * - Búsqueda por folio, descripción y dirección.
 * - Filtros por estado y territorio.
 * - Pestañas dinámicas según los estados disponibles.
 * - Actualización manual de los reportes.
 * - Navegación al detalle de cada reporte.
 *
 * El backend determina los reportes autorizados
 * mediante el JWT del usuario autenticado.
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
import { obtenerTerritorios } from "../../services/territoriosApi";

import "./reportesAlim.css";

/**
 * Formatea una fecha recibida desde la API.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "Sin fecha";
}

/**
 * Convierte un valor opcional en texto visible.
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
 * ReportesAlim
 *
 * Muestra los reportes asignados al alimentador
 * autenticado y permite consultarlos y filtrarlos.
 *
 * @returns {import("react").JSX.Element}
 */
export default function ReportesAlim() {
  const navigate = useNavigate();

  // Reportes reales obtenidos desde comms-api.
  const [reportes, setReportes] = useState([]);

  // Catálogo de territorios obtenido desde MariaDB.
  const [territorios, setTerritorios] = useState([]);

  // Estado de consulta de los reportes.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  // Error independiente de la consulta de territorios.
  const [errorTerritorios, setErrorTerritorios] = useState("");

  // Controles de filtros.
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [estadoActivo, setEstadoActivo] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [territorioFiltro, setTerritorioFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  /**
   * Consulta los reportes asignados al alimentador.
   *
   * Se ejecuta al montar la vista y cuando el usuario
   * presiona el botón Actualizar.
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
        setError("");
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
   * Consulta el catálogo de territorios.
   *
   * Esta consulta es independiente de los reportes.
   * Si falla, los reportes pueden seguir mostrándose.
   */
  useEffect(() => {
    let vigente = true;

    obtenerTerritorios()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos?.territorios)) {
          throw new Error(
            "El catálogo de territorios no tiene el formato esperado."
          );
        }

        setTerritorios(datos.territorios);
        setErrorTerritorios("");
      })
      .catch((err) => {
        if (!vigente) return;

        console.error(
          "Error al consultar territorios:",
          err
        );

        setErrorTerritorios(
          "No se pudieron consultar los nombres de los territorios."
        );
      });

    return () => {
      vigente = false;
    };
  }, []);

  /**
   * Solicita nuevamente los reportes al backend.
   */
  function actualizarReportes() {
    setCargando(true);
    setError("");
    setIntento((anterior) => anterior + 1);
  }

  /**
   * Obtiene los estados presentes en los reportes.
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
   * Obtiene los ID de territorio presentes
   * en los reportes asignados.
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
   * Crea un mapa de ID de territorio a nombre.
   *
   * Ejemplo:
   * "2" => "Atizapán de Zaragoza"
   */
  const nombresTerritorios = useMemo(() => {
    return new Map(
      territorios.map((territorio) => [
        String(territorio.id_territorio),
        territorio.nombre,
      ])
    );
  }, [territorios]);

  /**
   * Obtiene el nombre real del territorio.
   *
   * Si el catálogo todavía no se ha cargado,
   * utiliza su identificador como respaldo.
   *
   * @param {number|string|null} id
   * @returns {string}
   */
  function nombreTerritorio(id) {
    if (id === null || id === undefined) {
      return "No disponible";
    }

    return (
      nombresTerritorios.get(String(id)) ||
      `Territorio ${id}`
    );
  }

  /**
   * Filtra localmente los reportes autorizados.
   *
   * El backend realiza la autorización;
   * estos filtros solo modifican la visualización.
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
        nombresTerritorios.get(
          String(reporte.id_territorio)
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda =
        textoReporte.includes(textoBusqueda);

      const coincideEstado =
        !estadoFiltro ||
        reporte.estado === estadoFiltro;

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
    nombresTerritorios,
  ]);

  /**
   * Restablece los filtros seleccionados.
   */
  function limpiarFiltros() {
    setEstadoFiltro("");
    setTerritorioFiltro("");
    setBusqueda("");
    setEstadoActivo("Todos");
  }

  /**
   * Navega al detalle de un reporte asignado.
   *
   * @param {string} folio
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
          {/* Mostrar u ocultar filtros */}
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

          {/* Actualización de reportes */}
          <button
            type="button"
            className="reportes-button"
            onClick={actualizarReportes}
            disabled={cargando}
          >
            <RefreshCw size={17} />

            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          {/* Exportación pendiente */}
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

            {/* Filtro por estado */}
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
                <option value="">
                  Todos los estados
                </option>

                {estadosDisponibles.map((estado) => (
                  <option
                    key={estado}
                    value={estado}
                  >
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por territorio real */}
            <div className="reportes-filter-field">
              <label htmlFor="territorio-filtro">
                Territorio
              </label>

              <select
                id="territorio-filtro"
                value={territorioFiltro}
                onChange={(evento) =>
                  setTerritorioFiltro(evento.target.value)
                }
              >
                <option value="">
                  Todos los territorios
                </option>

                {territoriosDisponibles.map((id) => (
                  <option
                    key={id}
                    value={String(id)}
                  >
                    {nombreTerritorio(id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Categorías pendientes de integración */}
            <div className="reportes-filter-field">
              <label htmlFor="categoria-filtro">
                Categoría
              </label>

              <select
                id="categoria-filtro"
                value=""
                disabled
                title="Las categorías se habilitarán cuando estén disponibles en la API."
              >
                <option value="">
                  Categorías pendientes de integrar
                </option>
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

      {/* Pestañas de estado */}
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

      {/* Error al consultar territorios */}
      {errorTerritorios && (
        <p
          role="alert"
          style={{
            color: "#a52837",
            marginBottom: "12px",
          }}
        >
          {errorTerritorios}
        </p>
      )}

      {/* Error al consultar reportes */}
      {!cargando && error && (
        <div className="reportes-filters" role="alert">
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

      {/* Tabla de reportes asignados */}
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
                    {/* Folio */}
                    <td className="reportes-folio">
                      {reporte.folio}
                    </td>

                    {/* Fecha */}
                    <td>
                      {formatearFecha(
                        reporte.fecha_envio
                      )}
                    </td>

                    {/* Descripción */}
                    <td className="reportes-description">
                      {mostrarTexto(
                        reporte.descripcion
                      )}
                    </td>

                    {/* Ubicación */}
                    <td>
                      {mostrarTexto(
                        reporte.direccion
                      )}
                    </td>

                    {/* Nombre real del territorio */}
                    <td>
                      {nombreTerritorio(
                        reporte.id_territorio
                      )}
                    </td>

                    {/* Estado */}
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

                    {/* Abrir detalle */}
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
