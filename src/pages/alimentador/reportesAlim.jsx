/**
 * reportesAlim.jsx
 *
 * Lista de reportes asignados al alimentador.
 *
 * Funcionalidades:
 * - Consulta de reportes reales desde comms-api.
 * - Consulta de municipios desde el catálogo de territorios.
 * - Búsqueda por folio, descripción, dirección y municipio.
 * - Filtros por estado y territorio.
 * - Pestañas dinámicas según los estados reales.
 * - Limpieza de filtros.
 * - Actualización manual de la información.
 * - Navegación al detalle al seleccionar un folio.
 *
 * El backend determina qué reportes puede consultar
 * el alimentador mediante su JWT.
 */

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Filter,
  Download,
  ChevronDown,
  X,
  Search,
  RefreshCw,
} from "lucide-react";

import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";

import "./reportesAlim.css";

/**
 * Formatea la fecha sin modificar el día recibido.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "Sin fecha";
}

/**
 * Muestra un texto alternativo cuando faltan datos.
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
 * Convierte el estado en una clase CSS.
 *
 * @param {string|null} estado
 * @returns {string}
 */
function claseEstado(estado) {
  return String(estado ?? "")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * ReportesAlim
 *
 * @returns {import("react").JSX.Element}
 */
export default function ReportesAlim() {
  // Información real del backend.
  const [reportes, setReportes] = useState([]);
  const [territorios, setTerritorios] = useState([]);

  // Estado de las consultas.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorTerritorios, setErrorTerritorios] = useState("");
  const [intento, setIntento] = useState(0);

  // Filtros de la lista.
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [estadoActivo, setEstadoActivo] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [territorioFiltro, setTerritorioFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  /**
   * Consulta los reportes autorizados.
   *
   * Se ejecuta al ingresar a la pantalla y cuando
   * el usuario solicita actualizar los datos.
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
          err?.message ||
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
   * Consulta el catálogo real de territorios.
   *
   * Si falla, no impide mostrar los reportes.
   */
  useEffect(() => {
    let vigente = true;

    obtenerTerritorios()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos?.territorios)) {
          throw new Error(
            "La API no devolvió un catálogo válido de territorios."
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
   * Vuelve a consultar los reportes en comms-api.
   */
  function actualizarReportes() {
    if (cargando) return;

    setCargando(true);
    setError("");
    setIntento((anterior) => anterior + 1);
  }

  /**
   * Obtiene los estados que aparecen en la lista.
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
   * Obtiene los territorios presentes en la lista.
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
   * Relaciona cada ID de territorio con su nombre.
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
   * Devuelve el municipio real de un expediente.
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
   * Aplica los filtros a los reportes recibidos.
   *
   * La autorización sigue siendo responsabilidad
   * de comms-api, no de estos filtros visuales.
   */
  const reportesFiltrados = useMemo(() => {
    const textoBusqueda = busqueda
      .trim()
      .toLocaleLowerCase("es");

    return reportes.filter((reporte) => {
      const contenido = [
        reporte.folio,
        reporte.descripcion,
        reporte.direccion,
        reporte.estado,
        reporte.id_territorio,
        nombresTerritorios.get(String(reporte.id_territorio)),
      ]
        .filter((valor) => valor !== null && valor !== undefined)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda =
        contenido.includes(textoBusqueda);

      const coincideEstado =
        !estadoFiltro || reporte.estado === estadoFiltro;

      const coincideTerritorio =
        !territorioFiltro ||
        String(reporte.id_territorio) === territorioFiltro;

      const coincidePestana =
        estadoActivo === "Todos" ||
        reporte.estado === estadoActivo;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideTerritorio &&
        coincidePestana
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
   * Elimina todos los filtros, incluida la pestaña.
   */
  function limpiarFiltros() {
    setEstadoFiltro("");
    setTerritorioFiltro("");
    setBusqueda("");
    setEstadoActivo("Todos");
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
            onClick={() => {
              setFiltrosAbiertos((anterior) => !anterior);
            }}
            aria-expanded={filtrosAbiertos}
          >
            <Filter size={17} />
            Filtros

            <ChevronDown
              size={16}
              className={filtrosAbiertos ? "rotate" : ""}
            />
          </button>

          {/* Recargar desde comms-api */}
          <button
            type="button"
            className="reportes-button"
            onClick={actualizarReportes}
            disabled={cargando}
          >
            <RefreshCw size={17} />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          {/* Funcionalidad no implementada */}
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

      {/* Filtros desplegables */}
      {filtrosAbiertos && (
        <div className="reportes-filters">
          <div className="reportes-filter-header">
            <div>
              <h3>Filtrar reportes</h3>

              <p>
                Encuentra un expediente utilizando
                sus datos registrados.
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
              <label htmlFor="buscar-reporte-alim">
                Buscar reporte
              </label>

              <div className="reportes-input-wrapper">
                <Search size={17} />

                <input
                  id="buscar-reporte-alim"
                  type="text"
                  placeholder="Folio, descripción, ubicación..."
                  value={busqueda}
                  onChange={(evento) => {
                    setBusqueda(evento.target.value);
                  }}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="reportes-filter-field">
              <label htmlFor="estado-filtro-alim">
                Estado del reporte
              </label>

              <select
                id="estado-filtro-alim"
                value={estadoFiltro}
                onChange={(evento) => {
                  setEstadoFiltro(evento.target.value);
                }}
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
              <label htmlFor="territorio-filtro-alim">
                Territorio
              </label>

              <select
                id="territorio-filtro-alim"
                value={territorioFiltro}
                onChange={(evento) => {
                  setTerritorioFiltro(evento.target.value);
                }}
              >
                <option value="">Todos los territorios</option>

                {territoriosDisponibles.map((id) => (
                  <option key={id} value={String(id)}>
                    {nombreTerritorio(id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Categorías pendientes de consulta en comms-api */}
            <div className="reportes-filter-field">
              <label htmlFor="categoria-filtro-alim">
                Categoría
              </label>

              <select
                id="categoria-filtro-alim"
                value=""
                disabled
                title="Pendiente de integración con la consulta de etiquetas"
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

      {/* Pestañas dinámicas de estados */}
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

      {/* Errores del catálogo */}
      {errorTerritorios && (
        <p
          role="alert"
          style={{
            color: "#a52837",
            marginBottom: 12,
          }}
        >
          {errorTerritorios}
        </p>
      )}

      {/* Error de consulta */}
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
                <th>Ubicación</th>
                <th>Territorio</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6}>
                    <div className="reportes-empty" role="status">
                      Cargando reportes asignados...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div className="reportes-empty">
                      No fue posible cargar los reportes.
                    </div>
                  </td>
                </tr>
              ) : reportesFiltrados.length > 0 ? (
                reportesFiltrados.map((reporte) => (
                  <tr key={reporte.folio}>
                    {/* Folio clicable, sin columna Acciones */}
                    <td className="reportes-folio">
                      <NavLink
                        to={`/alimentador/reportes/${encodeURIComponent(
                          reporte.folio
                        )}`}
                        className="reportes-folio-enlace"
                        title={`Abrir reporte ${reporte.folio}`}
                      >
                        {reporte.folio}
                      </NavLink>
                    </td>

                    <td>
                      {formatearFecha(reporte.fecha_envio)}
                    </td>

                    <td>
                      {mostrarTexto(reporte.direccion)}
                    </td>

                    <td>
                      {nombreTerritorio(reporte.id_territorio)}
                    </td>

                    <td>
                      <span
                        className={`reportes-status status-${claseEstado(
                          reporte.estado
                        )}`}
                      >
                        {mostrarTexto(reporte.estado)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="reportes-empty">
                      <div className="reportes-empty-icon">
                        <Search size={24} />
                      </div>

                      <strong>No hay reportes para mostrar</strong>

                      <span>
                        {reportes.length === 0
                          ? "Los casos que te asignen aparecerán aquí."
                          : "Ningún reporte coincide con los filtros seleccionados."}
                      </span>

                      {reportes.length > 0 && (
                        <button
                          type="button"
                          className="reportes-clear-button"
                          onClick={limpiarFiltros}
                        >
                          Limpiar filtros
                        </button>
                      )}
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

