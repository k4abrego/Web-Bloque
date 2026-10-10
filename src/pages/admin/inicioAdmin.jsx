// Imports 
import reportesMock from "../../mocks/reportes";
import "./inicioAdmin.css";
import { NavLink } from "react-router-dom";


// Página principal del panel de administrador 
function InicioAdmin() {

  // Obtiene la cantidad total de reportes 
  const totalReportes = reportesMock.length;


  // Cuenta los reportes que se encuentran pendientes 
  const reportesPendientes = reportesMock.filter(
    (reporte) => reporte.estado === "Pendiente"
  ).length;


  // Cuenta los reportes que se encuentran en proceso 
  const reportesEnProceso = reportesMock.filter(
    (reporte) => reporte.estado === "En proceso"
  ).length;


  // Cuenta los reportes que ya fueron resueltos 
  const reportesResueltos = reportesMock.filter(
    (reporte) => reporte.estado === "Resuelto"
  ).length;


  // Reportes mas recientes para mostrarlos en el inicio
  const reportesRecientes = [...reportesMock]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  
  return (
    <div className="admin-inicio">

      {/* Encabezado de la página */}
      <div className="admin-inicio-header">

        <h1>Panel de Administrador</h1>

        <p>
          Resumen general de los reportes registrados en el sistema.
        </p>

      </div>


      {/* Tarjetas con el resumen de los reportes */}
      <div className="admin-resumen">

        <div className="resumen-card">
          <h3>Total de reportes</h3>
          <p>{totalReportes}</p>
        </div>

        <div className="resumen-card">
          <h3>Pendientes</h3>
          <p>{reportesPendientes}</p>
        </div>

        <div className="resumen-card">
          <h3>En proceso</h3>
          <p>{reportesEnProceso}</p>
        </div>

        <div className="resumen-card">
          <h3>Resueltos</h3>
          <p>{reportesResueltos}</p>
        </div>

      </div>


      {/* Reportes recientes, muestra los ltimos reportes registrados    */}
      <div className="reportes-recientes">

        {/* Encabezado de la sección */}
        <div className="reportes-recientes-header">

          <div>
            <h2>Reportes recientes</h2>
            <p>Últimos reportes registrados en el sistema.</p>
          </div>

          <NavLink
            to="/admin/reportes"
            className="ver-reportes"
          >
            Ver todos los reportes
          </NavLink>

        </div>


        {/* Tabla con los reportes más recientes */}
        <div className="reportes-tabla-container">

          <table className="reportes-tabla">

            <thead>
              <tr>
                <th>Folio</th>
                <th>Tipo de reporte</th>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Alimentador</th>
              </tr>
            </thead>

            <tbody>

              {reportesRecientes.map((reporte) => (

                <tr key={reporte.id}>

                  <td className="reporte-folio">
                    {reporte.folio}
                  </td>

                  <td>
                    {reporte.tipo}
                  </td>

                  <td>
                    {reporte.fecha}
                  </td>

                  <td>
                    {reporte.prioridad}
                  </td>

                  <td>
                    <span
                      className="estado-badge"
                      data-estado={reporte.estado}
                    >
                      {reporte.estado}
                    </span>
                  </td>

                  <td>
                    {reporte.alimentador}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


// Permite utilizar esta página dentro de las rutas del administrador 
export default InicioAdmin;