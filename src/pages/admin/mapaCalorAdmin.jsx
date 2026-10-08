// Imports
import { useState } from "react";
import {
  Map,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  FileText,
  ShieldCheck,
} from "lucide-react";
import reportesMock from "../../mocks/reportes";
import "./mapaCalorAdmin.css";


// Espacio temporal donde posteriormente se integrará Google Maps
function MapaPendiente() {

  return (
    <div className="mapa-calor-placeholder">

      <div className="mapa-calor-placeholder-icono">
        <Map size={38} />
      </div>

      <h3>Espacio reservado para Google Maps</h3>

      <p>
        Aquí se integrará la visualización geográfica
        de los reportes mediante el mapa de calor.
      </p>

      <span>
        Pendiente de integración
      </span>

    </div>
  );
}


// Página donde el administrador puede consultar la distribución geográfica de reportes
function MapaCalorAdmin() {

  // Guarda los filtros seleccionados por el administrador
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");


  // Filtra los reportes según el estado y la prioridad seleccionados
  const reportesFiltrados = reportesMock.filter((reporte) => {

    const coincideEstado =
      filtroEstado === "Todos" ||
      reporte.estado === filtroEstado;

    const coincidePrioridad =
      filtroPrioridad === "Todas" ||
      reporte.prioridad === filtroPrioridad;

    return coincideEstado && coincidePrioridad;
  });


  // Calcula la cantidad de reportes que cumplen con los filtros
  const totalReportes = reportesFiltrados.length;


  // Restablece los filtros a sus valores originales
  const limpiarFiltros = () => {

    setFiltroEstado("Todos");
    setFiltroPrioridad("Todas");
  };


  return (
    <div className="mapa-calor-admin">

      <div className="mapa-calor-header">

        <h1>Mapa de calor</h1>

        <p>
          Visualización geográfica de los reportes registrados
          en SIPINNA.
        </p>

      </div>


      <div className="mapa-calor-filtros">

        <div className="mapa-calor-filtros-header">

          <div className="mapa-calor-filtros-titulo">

            <SlidersHorizontal size={19} />

            <h2>Filtros del mapa</h2>

          </div>


          <button
            type="button"
            className="mapa-calor-limpiar"
            onClick={limpiarFiltros}
          >
            <RotateCcw size={15} />

            Limpiar filtros
          </button>

        </div>


        <div className="mapa-calor-filtros-campos">

          <div className="mapa-calor-filtro">

            <label htmlFor="mapa-filtro-estado">
              Estado del reporte
            </label>

            <select
              id="mapa-filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Resuelto">Resuelto</option>
            </select>

          </div>


          <div className="mapa-calor-filtro">

            <label htmlFor="mapa-filtro-prioridad">
              Prioridad
            </label>

            <select
              id="mapa-filtro-prioridad"
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
            >
              <option value="Todas">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

          </div>

        </div>

      </div>


      <div className="mapa-calor-card">

        <div className="mapa-calor-card-header">

          <div className="mapa-calor-card-titulo">

            <div className="mapa-calor-card-icono">
              <MapPin size={21} />
            </div>

            <div>

              <h2>Distribución geográfica</h2>

              <p>
                Concentración de reportes registrados por zona.
              </p>

            </div>

          </div>


          <div className="mapa-calor-contador">

            <FileText size={15} />

            <span>
              {totalReportes} de {reportesMock.length} reportes
            </span>

          </div>

        </div>


        <div className="mapa-calor-visor">

          <MapaPendiente />

        </div>


        <div className="mapa-calor-card-footer">

          <MapPin size={15} />

          <span>
            Los filtros seleccionados muestran {totalReportes} reportes
            coincidentes. La visualización del mapa se conectará
            posteriormente.
          </span>

        </div>

      </div>


      <div className="mapa-calor-aviso">

        <ShieldCheck size={19} />

        <p>
          Esta visualización es de uso interno. La integración final
          deberá proteger la ubicación de los casos sensibles y
          mostrar la información únicamente a personal autorizado.
        </p>

      </div>

    </div>
  );
}


export default MapaCalorAdmin;