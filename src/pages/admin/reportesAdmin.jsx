/**
 * reportesAdmin.jsx
 *
 * Lista administrativa de reportes registrados en SIPINNA.
 *
 * Obtiene datos reales desde el endpoint de histórico.
 * Permite buscar, filtrar por estado y paginar localmente.
 *
 * No modifica información en MariaDB.
 */

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { obtenerHistoricoReportes } from "../../services/reportesApi";

import "./reportesAdmin.css";

import { NavLink } from "react-router-dom";

/** Número máximo de reportes por página. */
const REPORTES_POR_PAGINA = 5;

/**
 * Da formato a la fecha devuelta por el backend.
 *
 * @param {string|null} fecha - Fecha del reporte.
 * @returns {string} Fecha YYYY-MM-DD o texto alternativo.
 */
function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  // Conserva el día recibido, sin conversiones de zona horaria.
  return String(fecha).slice(0, 10);
}

/**
 * Devuelve texto legible para los valores opcionales.
 *
 * @param {string|null|undefined} valor - Campo original.
 * @returns {string} Valor o texto alternativo.
 */
function mostrarTexto(valor) {
  return valor == null || String(valor).trim() === ""
    ? "No disponible"
    : String(valor);
}

/**
 * ReportesAdmin
 *
 * Consulta los reportes reales y muestra una tabla con
 * filtros, manejo de errores y paginación.
 *
 * @returns {import("react").JSX.Element} Página de reportes.
 */
export default function ReportesAdmin() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [paginaActual, setPaginaActual] = useState(1);

  /**
   * Solicita los registros cuando entra a la pantalla
   * o cuando el usuario solicita recargar.
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

        console.error("Error al consultar reportes:", err);
        setError(
          err.message || "No fue posible consultar los reportes."
        );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  /**
   * Reintenta consultar el historial sin actualizar
   * ni eliminar reportes de la base de datos.
   */
  function recargarReportes() {
    setCargando(true);
    setError("");
    setIntento((anterior) => anterior + 1);
  }

  /**
   * Construye el catálogo de estados a partir de
   * los registros realmente recibidos.
   */
  const estadosDisponibles = useMemo(() => {
    return [...new Set(
      reportes.map((reporte) => reporte.estado).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));
  }, [reportes]);

  /**
   * Filtra los reportes por folio, descripción,
   * dirección, estado o identificador de alimentador.
   */
  const reportesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");

    return reportes.filter((reporte) => {
      const contenido = [
        reporte.folio,
        reporte.descripcion,
        reporte.direccion,
        reporte.estado,
        reporte.id_alimentador,
        reporte.id_territorio,
      ]
        .filter((valor) => valor !== null && valor !== undefined)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda = contenido.includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" ||
        reporte.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [reportes, busqueda, filtroEstado]);

  /** Calcula la paginación. */
  const totalPaginas = Math.ceil(
    reportesFiltrados.length / REPORTES_POR_PAGINA
  );

  const indiceInicial = (paginaActual - 1) * REPORTES_POR_PAGINA;

  const indiceFinal = indiceInicial + REPORTES_POR_PAGINA;

  const reportesPaginados = reportesFiltrados.slice(
    indiceInicial,
    indiceFinal
  );

  /**
   * Cambia de página únicamente dentro de los límites.
   *
   * @param {number} pagina - Página solicitada.
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

      {/* Herramientas */}
      <div className="reportes-filtros">

        <div className="reportes-buscador">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar por folio, descripción o ubicación..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <select
          aria-label="Filtrar reportes por estado"
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todos">Todos los estados</option>

          {estadosDisponibles.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

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

      {/* Error de consulta */}
      {!cargando && error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={recargarReportes}>
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
                  <th>ID asignado</th>
                </tr>
              </thead>

              <tbody>
                {reportesPaginados.map((reporte) => (
                  <tr key={reporte.folio}>

                    <td>
                      <NavLink
                        to={`/admin/reportes/${encodeURIComponent(reporte.folio)}`}
                        className="lista-reporte-folio"
                      >
                        {reporte.folio}
                      </NavLink>
                    </td>

                    <td>
                      {mostrarTexto(reporte.descripcion)}
                    </td>

                    <td>
                      {formatearFecha(reporte.fecha_envio)}
                    </td>

                    <td>
                      <span
                        className="lista-estado-badge"
                        data-estado={reporte.estado}
                      >
                        {mostrarTexto(reporte.estado)}
                      </span>
                    </td>

                    <td>
                      {mostrarTexto(reporte.direccion)}
                    </td>

                    <td>
                      {reporte.id_alimentador ?? "Sin asignar"}
                    </td>
                  </tr>
                ))}

                {reportesFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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
                <strong>{indiceInicial + 1}</strong>
                {" - "}
                <strong>
                  {Math.min(
                    indiceFinal,
                    reportesFiltrados.length
                  )}
                </strong>
                {" de "}
                <strong>{reportesFiltrados.length}</strong>
                {" reportes"}
              </div>

              <div className="paginacion-controles">

                <button
                  type="button"
                  className="paginacion-flecha"
                  onClick={() =>
                    cambiarPagina(paginaActual - 1)
                  }
                  disabled={paginaActual === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from(
                  { length: totalPaginas },
                  (_, index) => index + 1
                ).map((pagina) => (
                  <button
                    type="button"
                    key={pagina}
                    className={
                      paginaActual === pagina
                        ? "paginacion-numero activo"
                        : "paginacion-numero"
                    }
                    onClick={() => cambiarPagina(pagina)}
                  >
                    {pagina}
                  </button>
                ))}

                <button
                  type="button"
                  className="paginacion-flecha"
                  onClick={() =>
                    cambiarPagina(paginaActual + 1)
                  }
                  disabled={paginaActual === totalPaginas}
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
