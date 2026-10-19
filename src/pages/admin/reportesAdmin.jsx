/**
 * reportesAdmin.jsx
 * Reportes reales para la institución del administrador autenticado.
 * Los filtros son visuales: los permisos los aplica comms-api mediante JWT.
 */
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, RefreshCw, RotateCcw } from "lucide-react";
import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { coincideEtiquetas, opcionesEtiqueta } from "../../services/etiquetasReportes";
import { obtenerTerritorios } from "../../services/territoriosApi";
import "./reportesAdmin.css";

const REPORTES_POR_PAGINA = 5;

/** @param {string|null} fecha */
function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "Sin fecha";
}

/** @param {unknown} valor */
function mostrarTexto(valor) {
  return valor == null || String(valor).trim() === "" ? "No disponible" : String(valor);
}

/** @returns {import("react").JSX.Element} */
export default function ReportesAdmin() {
  const [reportes, setReportes] = useState([]);
  const [territorios, setTerritorios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorTerritorios, setErrorTerritorios] = useState("");
  const [intento, setIntento] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroTerritorio, setFiltroTerritorio] = useState("");
  const [filtrosEtiquetas, setFiltrosEtiquetas] = useState({ Observación: "", Categoria: "", Riesgo: "", Prioridad: "" });
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    let vigente = true;
    obtenerHistoricoReportes()
      .then((datos) => {
        if (!vigente) return;
        if (!Array.isArray(datos)) {
          throw new Error("La API no devolvió una lista válida de reportes.");
        }
        setReportes(datos);
        setError("");
      })
      .catch((err) => {
        if (!vigente) return;
        console.error("Error al consultar reportes:", err);
        setError(err?.message || "No fue posible consultar los reportes.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => { vigente = false; };
  }, [intento]);

  useEffect(() => {
    let vigente = true;
    obtenerTerritorios()
      .then((datos) => {
        if (!vigente) return;
        if (!Array.isArray(datos?.territorios)) {
          throw new Error("La API no devolvió un catálogo válido de territorios.");
        }
        setTerritorios(datos.territorios);
        setErrorTerritorios("");
      })
      .catch((err) => {
        if (!vigente) return;
        console.error("Error al consultar territorios:", err);
        setErrorTerritorios("No se pudieron consultar los nombres de los territorios.");
      });
    return () => { vigente = false; };
  }, []);

  function recargarReportes() {
    if (cargando) return;
    setCargando(true);
    setError("");
    setPaginaActual(1);
    setIntento((valor) => valor + 1);
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("Todos");
    setFiltroTerritorio("");
    setFiltrosEtiquetas({ Observación: "", Categoria: "", Riesgo: "", Prioridad: "" });
    setPaginaActual(1);
  }

  const estadosDisponibles = useMemo(() =>
    [...new Set(reportes.map((reporte) => reporte.estado).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es")), [reportes]);

  const territoriosDisponibles = useMemo(() =>
    [...new Set(reportes.map((reporte) => reporte.id_territorio).filter((id) => id != null))]
      .sort((a, b) => Number(a) - Number(b)), [reportes]);

  const nombresTerritorios = useMemo(() => new Map(
    territorios.map((territorio) => [String(territorio.id_territorio), territorio.nombre])
  ), [territorios]);

  function nombreTerritorio(id) {
    if (id == null) return "No disponible";
    return nombresTerritorios.get(String(id)) || `Territorio ${id}`;
  }

  const reportesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");
    return reportes.filter((reporte) => {
      const contenido = [
        reporte.folio, reporte.descripcion, reporte.direccion,
        reporte.estado, reporte.id_alimentador, reporte.id_territorio,
        nombresTerritorios.get(String(reporte.id_territorio)),
      ].filter((valor) => valor != null).join(" ").toLocaleLowerCase("es");
      return contenido.includes(texto) &&
        (filtroEstado === "Todos" || reporte.estado === filtroEstado) &&
        (!filtroTerritorio || String(reporte.id_territorio) === filtroTerritorio) &&
        coincideEtiquetas(reporte, filtrosEtiquetas);
    });
  }, [reportes, busqueda, filtroEstado, filtroTerritorio, filtrosEtiquetas, nombresTerritorios]);

  const totalPaginas = Math.ceil(reportesFiltrados.length / REPORTES_POR_PAGINA);
  const paginaVisible = Math.min(paginaActual, Math.max(1, totalPaginas));
  const indiceInicial = (paginaVisible - 1) * REPORTES_POR_PAGINA;
  const indiceFinal = indiceInicial + REPORTES_POR_PAGINA;
  const reportesPaginados = reportesFiltrados.slice(indiceInicial, indiceFinal);
  const hayFiltros = busqueda.trim() !== "" || filtroEstado !== "Todos" || filtroTerritorio !== "" || Object.values(filtrosEtiquetas).some(Boolean);

  function cambiarPagina(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  }

  return (
    <div className="reportes-admin">
      <div className="reportes-admin-header">
        <div>
          <h1>Lista de reportes</h1>
          <p>Consulta los reportes registrados en SIPINNA.</p>
        </div>
        <div className="reportes-total">
          {reportesFiltrados.length} de {reportes.length} reportes
        </div>
      </div>

      <div className="reportes-filtros">
        <div className="reportes-buscador">
          <Search size={19} />
          <input
            type="search"
            aria-label="Buscar reportes"
            placeholder="Folio, descripción, ubicación, estado o territorio..."
            value={busqueda}
            onChange={(evento) => {
              setBusqueda(evento.target.value);
              setPaginaActual(1);
            }}
          />
        </div>
        <select
          aria-label="Filtrar reportes por estado"
          value={filtroEstado}
          onChange={(evento) => {
            setFiltroEstado(evento.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todos">Todos los estados</option>
          {estadosDisponibles.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar reportes por territorio"
          value={filtroTerritorio}
          onChange={(evento) => {
            setFiltroTerritorio(evento.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Todos los territorios</option>
          {territoriosDisponibles.map((id) => (
            <option key={String(id)} value={String(id)}>{nombreTerritorio(id)}</option>
          ))}
        </select>
        {Object.keys(filtrosEtiquetas).map((tipo) => (
          <select
            key={tipo}
            aria-label={`Filtrar por ${tipo}`}
            value={filtrosEtiquetas[tipo]}
            onChange={(e) => {
              setFiltrosEtiquetas((prev) => ({ ...prev, [tipo]: e.target.value }));
              setPaginaActual(1);
            }}
          >
            <option value="">{tipo === "Categoria" ? "Todas las categorías" : `Todos: ${tipo}`}</option>
            {opcionesEtiqueta(reportes, tipo).map((valor) => (
              <option key={valor} value={valor}>{valor}</option>
            ))}
          </select>
        ))}
        <button
          type="button"
          className="reportes-admin-boton"
          onClick={limpiarFiltros}
          disabled={!hayFiltros}
          title="Restablecer búsqueda y filtros"
        >
          <RotateCcw size={16} /> Limpiar filtros
        </button>
        <button
          type="button"
          className="reportes-admin-boton"
          onClick={recargarReportes}
          disabled={cargando}
          aria-label="Actualizar lista de reportes"
        >
          <RefreshCw size={17} /> {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {cargando && <p role="status">Cargando reportes registrados...</p>}
      {errorTerritorios && <p role="alert" className="reportes-admin-error">{errorTerritorios}</p>}
      {!cargando && error && (
        <div role="alert" className="reportes-admin-error">
          <p>{error}</p>
          <button type="button" className="reportes-admin-boton" onClick={recargarReportes}>
            Reintentar
          </button>
        </div>
      )}

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
                    <td>
                      <NavLink
                        to={`/admin/reportes/${encodeURIComponent(reporte.folio)}`}
                        className="lista-reporte-folio"
                      >
                        {reporte.folio}
                      </NavLink>
                    </td>
                    <td className="reportes-admin-descripcion" title={mostrarTexto(reporte.descripcion)}>
                      {mostrarTexto(reporte.descripcion)}
                    </td>
                    <td>{formatearFecha(reporte.fecha_envio)}</td>
                    <td>
                      <span className="lista-estado-badge" data-estado={reporte.estado}>
                        {mostrarTexto(reporte.estado)}
                      </span>
                    </td>
                    <td>{mostrarTexto(reporte.direccion)}</td>
                    <td>{nombreTerritorio(reporte.id_territorio)}</td>
                    <td>{reporte.id_alimentador ?? "Sin asignar"}</td>
                  </tr>
                ))}
                {reportesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="reportes-sin-resultados">
                      {reportes.length === 0
                        ? "Todavía no hay reportes disponibles."
                        : "Ningún reporte coincide con los filtros seleccionados."}
                      {hayFiltros && (
                        <div>
                          <button type="button" className="reportes-admin-boton" onClick={limpiarFiltros}>
                            Limpiar filtros
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="reportes-paginacion">
              <div className="paginacion-info">
                Mostrando <strong>{indiceInicial + 1}</strong> - <strong>{Math.min(indiceFinal, reportesFiltrados.length)}</strong> de <strong>{reportesFiltrados.length}</strong> reportes
              </div>
              <div className="paginacion-controles">
                <button type="button" className="paginacion-flecha" onClick={() => cambiarPagina(paginaVisible - 1)} disabled={paginaVisible === 1} aria-label="Página anterior">
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((pagina) => (
                  <button
                    type="button"
                    key={pagina}
                    className={paginaVisible === pagina ? "paginacion-numero activo" : "paginacion-numero"}
                    onClick={() => cambiarPagina(pagina)}
                    aria-label={`Página ${pagina}`}
                    aria-current={paginaVisible === pagina ? "page" : undefined}
                  >
                    {pagina}
                  </button>
                ))}
                <button type="button" className="paginacion-flecha" onClick={() => cambiarPagina(paginaVisible + 1)} disabled={paginaVisible === totalPaginas} aria-label="Página siguiente">
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