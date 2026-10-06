// Imports
import { useState } from "react";
import { NavLink } from "react-router-dom";
import reportesMock from "../../mocks/reportes";
import "./reportesAdmin.css";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";




// Página donde el administrador puede consultar todos los reportes
function ReportesAdmin() {

  // Guarda el texto escrito en el buscador
  const [busqueda, setBusqueda] = useState("");

  // Guarda el estado seleccionado
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // Guarda la prioridad seleccionada 
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");

  // Guarda la página que se está mostrando
  const [paginaActual, setPaginaActual] = useState(1);


  // Define cuántos reportes se muestran en cada página 
  const reportesPorPagina = 5;


  // Filtra los reportes de acuerdo con las opciones seleccionadas 
  const reportesFiltrados = reportesMock.filter((reporte) => {

    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      reporte.folio.toLowerCase().includes(textoBusqueda) ||
      reporte.tipo.toLowerCase().includes(textoBusqueda) ||
      reporte.alimentador.toLowerCase().includes(textoBusqueda) ||
      reporte.ubicacion.toLowerCase().includes(textoBusqueda);

    const coincideEstado =
      filtroEstado === "Todos" ||
      reporte.estado === filtroEstado;

    const coincidePrioridad =
      filtroPrioridad === "Todas" ||
      reporte.prioridad === filtroPrioridad;

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincidePrioridad
    );
  });


  // Calcula la cantidad de páginas necesarias 
  const totalPaginas = Math.ceil(
    reportesFiltrados.length / reportesPorPagina
  );


  // Calcula qué reportes corresponden a la página seleccionada 
  const indiceInicial =
    (paginaActual - 1) * reportesPorPagina;

  const indiceFinal =
    indiceInicial + reportesPorPagina;


  // Obtiene únicamente los reportes que se muestran en la página actual 
  const reportesPaginados = reportesFiltrados.slice(
    indiceInicial,
    indiceFinal
  );


  // Cambia de página dentro de la lista de reportes 
  const cambiarPagina = (pagina) => {

    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }

  };


  return (
    <div className="reportes-admin">

      {/* Encabezado de la página */}
      <div className="reportes-admin-header">

        <div>
          <h1>Lista de reportes</h1>

          <p>
            Consulta y administra los reportes registrados en el sistema.
          </p>
        </div>

        {/* Muestra la cantidad de reportes encontrados */}
        <div className="reportes-total">
          {reportesFiltrados.length} de {reportesMock.length} reportes
        </div>

      </div>


      {/* Herramientas para buscar y filtrar reportes */}
      <div className="reportes-filtros">

        {/* Buscador de reportes */}
        <div className="reportes-buscador">

          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar por folio, tipo, ubicación o alimentador..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

        </div>


        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Resuelto">Resuelto</option>
        </select>


        {/* Filtro por prioridad */}
        <select
          value={filtroPrioridad}
          onChange={(e) => {
            setFiltroPrioridad(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todas">Todas las prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>

      </div>


      {/* Contenedor principal de la lista */}
      <div className="reportes-lista">

        {/* Tabla con los reportes encontrados */}
        <div className="reportes-lista-tabla-container">

          <table className="reportes-lista-tabla">

            <thead>
              <tr>
                <th>Folio</th>
                <th>Tipo de reporte</th>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Alimentador</th>
                <th>Evidencias</th>
              </tr>
            </thead>


            <tbody>

              {reportesPaginados.map((reporte) => (

                <tr key={reporte.id}>

                  {/* Permite abrir el detalle del reporte seleccionado */}
                  <td>
                    <NavLink
                      to={`/admin/reportes/${reporte.id}`}
                      className="lista-reporte-folio"
                    >
                      {reporte.folio}
                    </NavLink>
                  </td>

                  <td>
                    {reporte.tipo}
                  </td>

                  <td>
                    {reporte.fecha}
                  </td>

                  <td>
                    <span
                      className="prioridad-badge"
                      data-prioridad={reporte.prioridad}
                    >
                      {reporte.prioridad}
                    </span>
                  </td>

                  <td>
                    <span
                      className="lista-estado-badge"
                      data-estado={reporte.estado}
                    >
                      {reporte.estado}
                    </span>
                  </td>

                  <td>
                    {reporte.alimentador}
                  </td>

                  <td>
                    {reporte.evidencias.length}
                  </td>

                </tr>

              ))}


              {/* Mensaje mostrado cuando ningún reporte coincide */}
              {reportesFiltrados.length === 0 && (

                <tr>
                  <td
                    colSpan="7"
                    className="reportes-sin-resultados"
                  >
                    No se encontraron reportes con los filtros seleccionados.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* Paginación de la lista de reportes */}
        {reportesFiltrados.length > 0 && (

          <div className="reportes-paginacion">

            {/* Muestra qué reportes se están visualizando */}
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


            {/* Controles para cambiar de página */}
            <div className="paginacion-controles">

              {/* Página anterior */}
              <button
                className="paginacion-flecha"
                onClick={() =>
                  cambiarPagina(paginaActual - 1)
                }
                disabled={paginaActual === 1}
              >
                <ChevronLeft size={18} />
              </button>


              {/* Botones de cada página */}
              {Array.from(
                { length: totalPaginas },
                (_, index) => index + 1
              ).map((pagina) => (

                <button
                  key={pagina}
                  className={
                    paginaActual === pagina
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
                className="paginacion-flecha"
                onClick={() =>
                  cambiarPagina(paginaActual + 1)
                }
                disabled={
                  paginaActual === totalPaginas
                }
              >
                <ChevronRight size={18} />
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


// Permite utilizar esta página dentro de las rutas del administrador 
export default ReportesAdmin;