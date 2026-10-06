// Imports 
import "./evidenciaCard.css";
import {
  Image,
  Video,
  FileText,
} from "lucide-react";


// Tarjeta reutilizable para mostrar una evidencia de un reporte
function EvidenciaCard({ evidencia }) {

//   Selecciona el icono correspondiente al tipo de archivo 
  const obtenerIcono = () => {

    if (evidencia.tipo === "Imagen") {
      return <Image size={22} />;
    }

    if (evidencia.tipo === "Video") {
      return <Video size={22} />;
    }

    return <FileText size={22} />;
  };


  return (
    <div className="evidencia-card">

      {/* Muestra el icono correspondiente al archivo */}
      <div
        className="evidencia-icono"
        data-tipo={evidencia.tipo}
      >
        {obtenerIcono()}
      </div>


      {/* Información principal de la evidencia */}
      <div className="evidencia-info">

        <strong>
          {evidencia.nombre}
        </strong>

        <div className="evidencia-detalles">

          <span>
            {evidencia.tipo}
          </span>

          <span>
            {evidencia.fecha}
          </span>

        </div>

      </div>

    </div>
  );
}


// Permite utilizar la tarjeta en diferentes páginas 
export default EvidenciaCard;