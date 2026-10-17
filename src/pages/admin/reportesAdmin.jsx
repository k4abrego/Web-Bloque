
/**
 * reportesAdmin.jsx
 *
 * Lista administrativa de reportes registrados en SIPINNA.
 *
 * Funcionalidades:
 * - Consulta de reportes reales desde comms-api.
 * - Consulta del catálogo real de territorios.
 * - Búsqueda por folio, descripción, ubicación y territorio.
 * - Filtros por estado y territorio.
 * - Paginación local.
 * - Actualización manual de reportes.
 * - Navegación al detalle de cada reporte.
 *
 * No modifica información en MariaDB.
 */

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";

import "./reportesAdmin.css";

/** Número máximo de reportes por página. */
const REPORTES_POR_PAGINA = 5;

/**
 * Formatea una fecha recibida desde el backend.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return String(fecha).slice(0, 10);
}

/**
 * Convierte valores opcionales en texto legible.
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
 * ReportesAdmin
 *
 * Consulta y presenta los reportes registrados.
 *
 * @returns {import("react").JSX.Element}
 */
export default function ReportesAdmin() {
  // Datos reales de reportes.
  const [reportes, setReportes] = useState([]);

  // Catálogo real de territorios.
  const [territorios, setTerritorios] = useState([]);

  // Estado de consulta de reportes.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  // Error independiente del catálogo.
  const [errorTerritorios, setErrorTerritorios] = useState("");

  // Búsqueda y filtros.
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroTerritorio, setFiltroTerritorio] = useState("");

  // Paginación.
  const [paginaActual, setPaginaActual] = useState(1);

  /**
   * Consulta el histórico de reportes.
   *
   * Se ejecuta al entrar a la pantalla y cada vez
   * que se solicita una actualización.
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
          "Error al consultar reportes:",
          err
        );

        setError(
          err.message ||
            "No fue posible consultar los reportes."
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
   * Si falla, los reportes siguen disponibles.
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
   * Vuelve a solicitar el historial al backend.
   */
  function recargarReportes() {
    setCargando(true);
    setError("");
    setPaginaActual(1);
    setIntento((anterior) => anterior + 1);
  }

  /**
   * Obtiene los estados reales que aparecen
   * en el histórico de reportes.
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
   * Obtiene los territorios que aparecen en
   * los reportes registrados.
   */
  const territoriosDisponibles = useMemo(() => {
    return [
      ...new Set(
        reportes
          .map((reporte) => reporte.id_territorio)
          .filter((id) => id != null)
      ),
    ].sort((a, b) => Number(a) - Number(b));
  }, [reportes]);

  /**
   * Relaciona cada ID con el nombre real
   * registrado en MariaDB.
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
   * Devuelve el nombre real del territorio.
   *
   * @param {number|string|null} id
   * @returns {string}
   */
  function nombreTerritorio(id) {
    if (id == null) {
      return "No disponible";
    }

    return (
      nombresTerritorios.get(String(id)) ||
      `Territorio ${id}`
    );
  }

  /**
   * Aplica filtros únicamente sobre los reportes
   * autorizados por el backend.
   */
  const reportesFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLocaleLowerCase("es");

    return reportes.filter((reporte) => {
      const contenido = [
        reporte.folio,
        reporte.descripcion,
        reporte.direccion,
        reporte.estado,
        reporte.id_alimentador,
        reporte.id_territorio,
        nombresTerritorios.get(
          String(reporte.id_territorio)
        ),
      ]
        .filter((valor) => valor != null)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda =
        contenido.includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" ||
        reporte.estado === filtroEstado;

      const coincideTerritorio =
        !filtroTerritorio ||
        String(reporte.id_territorio) === filtroTerritorio;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideTerritorio
      );
    });
  }, [
    reportes,
    busqueda,
    filtroEstado,
    filtroTerritorio,
    nombresTerritorios,
  ]);

  /**
   * Calcula el total de páginas.
   */
  const totalPaginas = Math.ceil(
    reportesFiltrados.length / REPORTES_POR_PAGINA
  );

  /**
   * Evita mostrar una página inexistente si
   * la cantidad de reportes cambia.
   */
  const paginaVisible = Math.min(
    paginaActual,
    Math.max(1, totalPaginas)
  );

  const indiceInicial =
    (paginaVisible - 1) * REPORTES_POR_PAGINA;

  const indiceFinal =
    indiceInicial + REPORTES_POR_PAGINA;

  const reportesPaginados = reportesFiltrados.slice(
    indiceInicial,
    indiceFinal
  );

  /**
   * Cambia de página dentro de los límites válidos.
   *
   * @param {number} pagina
   */
  function cambiarPagina(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  }

  return (
    <div className="reportes-admin">
      {/* Encabezado */}
      <div className="reportes-admin-header">
        <div>
          <h1>Lista de reportes</h1>
          <p>
            Consulta los reportes registrados en SIPINNA.
          </p>
        </div>

        <div className="reportes-total">
          {reportesFiltrados.length} de {reportes.length} reportes
        </div>
      </div>

      {/* Herramientas de búsqueda y filtrado */}
      <div className="reportes-filtros">
        {/* Búsqueda */}
        <div className="reportes-buscador">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar por folio, descripción, ubicación o territorio..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        {/* Filtro por estado */}
        <select
          aria-label="Filtrar reportes por estado"
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todos">
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

        {/* Filtro por territorio */}
        <select
          aria-label="Filtrar reportes por territorio"
          value={filtroTerritorio}
          onChange={(e) => {
            setFiltroTerritorio(e.target.value);
            setPaginaActual(1);
          }}
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

        {/* Actualizar */}
        <button
          type="button"
          onClick={recargarReportes}
          disabled={cargando}
          aria-label="Actualizar lista de reportes"
        >
          <RefreshCw size={17} />
          {" "}
          Actualizar
        </button>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <p role="status">
          Cargando reportes registrados...
        </p>
      )}

      {/* Error de consulta de territorios */}
      {errorTerritorios && (
        <p role="alert" style={{ color: "#a52837" }}>
          {errorTerritorios}
        </p>
      )}

      {/* Error de consulta de reportes */}
      {!cargando && error && (
        <div role="alert">
          <p>{error}</p>

          <button
            type="button"
            onClick={recargarReportes}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      {!cargando && !error && (
        <div className="reportes-lista">
          <div className="reportes-lista-tabla-container">
            <table className="reportes-lista-tabla">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Territorio</th>
                  <th>ID asignado</th>
                </tr>
              </thead>

              <tbody>
                {reportesPaginados.map((reporte) => (
                  <tr key={reporte.folio}>
                    {/* Folio y navegación */}
                    <td>
                      <NavLink
                        to={`/admin/reportes/${encodeURIComponent(
                          reporte.folio
                        )}`}
                        className="lista-reporte-folio"
                      >
                        {reporte.folio}
                      </NavLink>
                    </td>

                    {/* Descripción */}
                    <td>
                      {mostrarTexto(
                        reporte.descripcion
                      )}
                    </td>

                    {/* Fecha */}
                    <td>
                      {formatearFecha(
                        reporte.fecha_envio
                      )}
                    </td>

                    {/* Estado */}
                    <td>
                      <span
                        className="lista-estado-badge"
                        data-estado={reporte.estado}
                      >
                        {mostrarTexto(
                          reporte.estado
                        )}
                      </span>
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

                    {/* Alimentador asignado */}
                    <td>
                      {reporte.id_alimentador ??
                        "Sin asignar"}
                    </td>
                  </tr>
                ))}

                {reportesFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="reportes-sin-resultados"
                    >
                      No se encontraron reportes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="reportes-paginacion">
              <div className="paginacion-info">
                Mostrando{" "}
                <strong>
                  {indiceInicial + 1}
                </strong>
                {" - "}
                <strong>
                  {Math.min(
                    indiceFinal,
                    reportesFiltrados.length
                  )}
                </strong>
                {" de "}
                <strong>
                  {reportesFiltrados.length}
                </strong>
                {" reportes"}
              </div>

              <div className="paginacion-controles">
                {/* Página anterior */}
                <button
                  type="button"
                  className="paginacion-flecha"
                  onClick={() =>
                    cambiarPagina(paginaVisible - 1)
                  }
                  disabled={paginaVisible === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Números de página */}
                {Array.from(
                  { length: totalPaginas },
                  (_, index) => index + 1
                ).map((pagina) => (
                  <button
                    type="button"
                    key={pagina}
                    className={
                      paginaVisible === pagina
                        ? "paginacion-numero activo"
                        : "paginacion-numero"
                    }
                    onClick={() =>
                      cambiarPagina(pagina)
                    }
                  >
                    {pagina}
                  </button>
                ))}

                {/* Página siguiente */}
                <button
                  type="button"
                  className="paginacion-flecha"
                  onClick={() =>
                    cambiarPagina(paginaVisible + 1)
                  }
                  disabled={
                    paginaVisible === totalPaginas
                  }
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
