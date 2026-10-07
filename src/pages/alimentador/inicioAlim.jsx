import "./inicioAlim.css";

function InicioAlimentador() {
  return (
<div className="inicio-alim">
  <div className="inicio-alim-header">
              <h1>Panel de Alimentador</h1>
                <p>
                    Resumen de los reportes asignados a tu municipio.
                </p>
            </div>
          
            <section className="alim-stats">
              
                <div className="alim-stat-card">
                    <div className="alim-stat-icon placeholder" />
                    <div>
                        <div className="alim-placeholder title" />
                        <div className="alim-placeholder number" />
                    </div>
                </div>

                <div className="alim-stat-card">
                    <div className="alim-stat-icon placeholder" />
                    <div>
                        <div className="alim-placeholder title" />
                        <div className="alim-placeholder number" />
                    </div>
                </div>

                <div className="alim-stat-card">
                    <div className="alim-stat-icon placeholder" />
                    <div>
                        <div className="alim-placeholder title" />
                        <div className="alim-placeholder number" />
                    </div>
                </div>

                <div className="alim-stat-card">
                    <div className="alim-stat-icon placeholder" />
                    <div>
                        <div className="alim-placeholder title" />
                        <div className="alim-placeholder number" />
                    </div>
                </div>

            </section>

            <section className="alim-charts">

                <div className="alim-chart-card">
                    <div className="alim-chart-header">
                        <div className="alim-placeholder chart-title" />
                        <div className="alim-placeholder chart-subtitle" />
                    </div>

                    <div className="alim-chart-empty">
                        <span>Sin datos disponibles</span>
                    </div>
                </div>

                <div className="alim-chart-card">
                    <div className="alim-chart-header">
                        <div className="alim-placeholder chart-title" />
                        <div className="alim-placeholder chart-subtitle" />
                    </div>

                    <div className="alim-chart-empty">
                        <span>Sin datos disponibles</span>
                    </div>
                </div>

            </section>

            <section className="alim-recent-card">

                <div className="alim-recent-header">
                    <div>
                        <h2>Reportes recientes asignados</h2>
                        <p>
                            Casos asignados.
                        </p>
                    </div>

                    <button className="alim-outline-button">
                        Ver todos mis reportes
                    </button>
                </div>


                <div className="alim-table-wrapper">
                    <table className="alim-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Descripción</th>
                                <th>Colonia / Localidad</th>
                                <th>Estado</th>
                                <th>Prioridad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="7">
                                    <div className="alim-table-empty">
                                        No hay reportes para mostrar.
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
    </div>
  );
}

export default InicioAlimentador;