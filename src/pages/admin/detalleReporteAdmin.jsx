// Imports
import { useParams, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  UserRound,
  Paperclip,
} from "lucide-react";

import reportesMock from "../../mocks/reportes";
import EvidenciaCard from "../../components/evidencia/evidenciaCard";
import "./detalleReporteAdmin.css";


// Página donde el administrador puede consultar la información de un reporte 
function DetalleReporteAdmin() {

  // Obtiene el identificador del reporte seleccionado
  const { id } = useParams();


  // Busca el reporte que corresponde con el identificador seleccionado 
  const reporte = reportesMock.find(
    (reporte) => reporte.id === Number(id)
  );


  // Muestra un mensaje si el reporte solicitado no existe 
  if (!reporte) {
    return (
      <div className="detalle-reporte">

        <NavLink
          to="/admin/reportes"
          className="detalle-volver"
        >
          <ArrowLeft size={18} />
          Volver a reportes
        </NavLink>

        <div className="detalle-no-encontrado">
          <h1>Reporte no encontrado</h1>

          <p>
            El reporte solicitado no existe o no está disponible.
          </p>
        </div>

      </div>
    );
  }


  return (
    <div className="detalle-reporte">

      {/* Permite regresar a la lista de reportes */}
      <NavLink
        to="/admin/reportes"
        className="detalle-volver"
      >
        <ArrowLeft size={18} />
        Volver a reportes
      </NavLink>


      {/* Encabezado principal del reporte */}
      <div className="detalle-header">

        <div>

          <span className="detalle-folio">
            {reporte.folio}
          </span>

          <h1>{reporte.tipo}</h1>

          <p>
            Información y seguimiento del reporte registrado.
          </p>

        </div>


        {/* Muestra el estado y la prioridad actual */}
        <div className="detalle-badges">

          <span
            className="detalle-estado-badge"
            data-estado={reporte.estado}
          >
            {reporte.estado}
          </span>

          <span
            className="detalle-prioridad-badge"
            data-prioridad={reporte.prioridad}
          >
            Prioridad {reporte.prioridad}
          </span>

        </div>

      </div>


      {/* Información general del reporte */}
      <div className="detalle-card">

        <div className="detalle-card-header">
          <h2>Información general</h2>

          <p>
            Datos principales relacionados con el reporte.
          </p>
        </div>


        <div className="detalle-info-grid">

          {/* Fecha del reporte */}
          <div className="detalle-info-item">

            <div className="detalle-info-icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>Fecha de registro</span>
              <strong>{reporte.fecha}</strong>
            </div>

          </div>


          {/* Ubicación del reporte */}
          <div className="detalle-info-item">

            <div className="detalle-info-icon">
              <MapPin size={20} />
            </div>

            <div>
              <span>Ubicación</span>
              <strong>{reporte.ubicacion}</strong>
            </div>

          </div>


          {/* Alimentador responsable */}
          <div className="detalle-info-item">

            <div className="detalle-info-icon">
              <UserRound size={20} />
            </div>

            <div>
              <span>Alimentador asignado</span>
              <strong>{reporte.alimentador}</strong>
            </div>

          </div>


          {/* Evidencias registradas */}
          <div className="detalle-info-item">

            <div className="detalle-info-icon">
              <Paperclip size={20} />
            </div>

            <div>
              <span>Evidencias registradas</span>
              <strong>{reporte.evidencias.length}</strong>
            </div>

          </div>

        </div>

      </div>


      {/* Etiquetas relacionadas con el reporte */}
      <div className="detalle-card">

        <div className="detalle-card-header">
          <h2>Etiquetas</h2>

          <p>
            Clasificaciones utilizadas para identificar el reporte.
          </p>
        </div>


        <div className="detalle-etiquetas">

          {reporte.etiquetas.length > 0 ? (

            reporte.etiquetas.map((etiqueta, index) => (
              <span
                key={index}
                className="detalle-etiqueta"
              >
                {etiqueta}
              </span>
            ))

          ) : (

            <span className="detalle-sin-etiquetas">
              Este reporte no tiene etiquetas asignadas.
            </span>

          )}

        </div>

      </div>


      {/* Evidencias relacionadas con el reporte */}
      <div className="detalle-card">

        <div className="detalle-card-header">

          <h2>Evidencias</h2>

          <p>
            Archivos asociados al reporte y disponibles para su consulta.
          </p>

        </div>


        {/* Muestra las evidencias registradas */}
        {reporte.evidencias.length > 0 ? (

          <div className="detalle-evidencias">

            {reporte.evidencias.map((evidencia) => (

              <EvidenciaCard
                key={evidencia.id}
                evidencia={evidencia}
              />

            ))}

          </div>

        ) : (

          <div className="detalle-sin-evidencias">

            <Paperclip size={22} />

            <div>
              <strong>Sin evidencias registradas</strong>

              <p>
                Este reporte todavía no tiene archivos asociados.
              </p>
            </div>

          </div>

        )}

      </div>
    </div>
  );
}


// Permite utilizar esta página dentro de las rutas del administrador 
export default DetalleReporteAdmin;