// Documentación automática de src/pages/admin/mapaCalorAdmin.jsx: Página y estilos de la sección mapaCalorAdmin.
import GoogleMap from "../mapa/googleMap";
// Imports
import { useState } from "react";
import {
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  FileText,
  ShieldCheck,
} from "lucide-react";
import reportesMock from "../../mocks/reportes";
import "./mapaCalorAdmin.css";


// Página donde el administrador puede consultar la distribución geográfica de reportes
// Sección: MapaCalorAdmin.
function MapaCalorAdmin() {

// Sección: centro.
  const centro = {
    lat: 19.557,
    lng: -99.271,
  };

// Sección: reportesPrueba.
  const reportesPrueba = [
    { id: 1, latitud: 19.5570, longitud: -99.2710, municipio: "Atizapán de Zaragoza", peso: 3 },


  ];


  // Guarda los filtros seleccionados por el administrador
// Sección: declaración.
  const [filtroEstado, setFiltroEstado] = useState("Todos");
// Sección: declaración.
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");


  // Filtra los reportes según el estado y la prioridad seleccionados
// Sección: reportesFiltrados.
  const reportesFiltrados = reportesMock.filter((reporte) => {

// Sección: coincideEstado.
    const coincideEstado =
      filtroEstado === "Todos" ||
      reporte.estado === filtroEstado;

// Sección: coincidePrioridad.
    const coincidePrioridad =
      filtroPrioridad === "Todas" ||
      reporte.prioridad === filtroPrioridad;

    return coincideEstado && coincidePrioridad;
  });


  // Calcula la cantidad de reportes que cumplen con los filtros
// Sección: totalReportes.
  const totalReportes = reportesFiltrados.length;


  // Restablece los filtros a sus valores originales
// Sección: limpiarFiltros.
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

          <GoogleMap center={centro} zoom={12} reportes={reportesPrueba} />

        </div>


        <div className="mapa-calor-card-footer">

          <MapPin size={15} />

          <span>
            Los filtros seleccionados muestran {totalReportes} reportes
            coincidentes en el mapa.
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