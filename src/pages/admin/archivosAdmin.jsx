// Imports
import { useState } from "react";
import { NavLink } from "react-router-dom";
import EvidenciaCard from "../../components/evidencia/evidenciaCard";
import reportesMock from "../../mocks/reportes";
import "./archivosAdmin.css";
import {
  Search,
  FolderOpen,
} from "lucide-react";




// Página donde el administrador puede consultar las evidencias de los reportes 
function ArchivosAdmin() {

  // Guarda la búsqueda y el tipo de archivo seleccionado 
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");


  // Reúne las evidencias de todos los reportes en una sola lista 
  const archivos = reportesMock.flatMap((reporte) =>
    reporte.evidencias.map((evidencia) => ({
      ...evidencia,
      reporteId: reporte.id,
      folio: reporte.folio,
      tipoReporte: reporte.tipo,
    }))
  );


  // Filtra los archivos según la búsqueda y el tipo seleccionado 
  const archivosFiltrados = archivos.filter((archivo) => {

    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      archivo.nombre.toLowerCase().includes(textoBusqueda) ||
      archivo.folio.toLowerCase().includes(textoBusqueda) ||
      archivo.tipoReporte.toLowerCase().includes(textoBusqueda);

    const coincideTipo =
      filtroTipo === "Todos" ||
      archivo.tipo === filtroTipo;

    return coincideBusqueda && coincideTipo;
  });


  return (
    <div className="archivos-admin">

      {/* Encabezado principal de la página */}
      <div className="archivos-header">

        <div>
          <h1>Archivos</h1>

          <p>
            Consulta las evidencias asociadas a los reportes registrados.
          </p>
        </div>

        <div className="archivos-total">
          <FolderOpen size={20} />

          <span>
            <strong>{archivos.length}</strong> archivos
          </span>
        </div>

      </div>


      {/* Herramientas para buscar y filtrar los archivos */}
      <div className="archivos-herramientas">

        <div className="archivos-buscador">

          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar archivo o reporte..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

        </div>


        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="Todos">
            Todos los archivos
          </option>

          <option value="Imagen">
            Imágenes
          </option>

          <option value="Video">
            Videos
          </option>

          <option value="Documento">
            Documentos
          </option>
        </select>

      </div>


      {/* Muestra la cantidad de archivos encontrados */}
      <div className="archivos-resultados">
        Mostrando{" "}
        <strong>{archivosFiltrados.length}</strong>
        {" "}de{" "}
        <strong>{archivos.length}</strong>
        {" "}archivos
      </div>


      {/* Muestra las evidencias disponibles */}
      {archivosFiltrados.length > 0 ? (

        <div className="archivos-grid">

          {archivosFiltrados.map((archivo) => (

            <div
              key={`${archivo.reporteId}-${archivo.id}`}
              className="archivo-contenedor"
            >

              {/* Identifica el reporte al que pertenece el archivo */}
              <div className="archivo-reporte">

                <span>
                  Pertenece a
                </span>

                <NavLink
                  to={`/admin/reportes/${archivo.reporteId}`}
                >
                  {archivo.folio}
                </NavLink>

              </div>


              {/* Muestra la información de la evidencia */}
              <EvidenciaCard
                evidencia={archivo}
              />

            </div>

          ))}

        </div>

      ) : (

        <div className="archivos-vacio">

          <FolderOpen size={32} />

          <h2>No se encontraron archivos</h2>

          <p>
            Intenta cambiar la búsqueda o los filtros seleccionados.
          </p>

        </div>

      )}

    </div>
  );
}


export default ArchivosAdmin;