import "./inicioAlim.css";

import {
    ClipboardList,
    Clock3,
    LoaderCircle,
    CheckCircle2,
} from "lucide-react";


function InicioAlim() {
    const estadisticas = [
        {
            titulo: "Casos asignados",
            icono: ClipboardList,
        },
        {
            titulo: "Pendientes",
            icono: Clock3,
        },
        {
            titulo: "En proceso",
            icono: LoaderCircle,
        },
        {
            titulo: "Atendidos",
            icono: CheckCircle2,
        },
    ];

    return (
        <div className="inicio-alim">
            <header className="inicio-alim-header">
                <h1>Inicio</h1>
                <p>
                    Resumen de los reportes asignados.
                </p>
            </header>

            <section className="alim-stats">
                {estadisticas.map((estadistica) => {
                    const Icon = estadistica.icono;
                    return (
                        <div className="alim-stat-card"
                            key={estadistica.titulo}>
                            <div className="alim-stat-icon">
                                <Icon size={24} />
                            </div>

                            <div className="alim-stat-content">
                                <div className="alim-stat-title">
                                    {estadistica.titulo}
                                </div>

                                <div className="alim-stat-number">
                                    —
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="alim-charts">
                <div className="alim-chart-card">
                    <div className="alim-chart-header">
                        <h2>Reportes por localidad</h2>
                        <p>
                            Distribución de los reportes asignados por localidad.
                        </p>
                    </div>

                    <div className="alim-chart-empty">
                        Sin información disponible
                    </div>
                </div>


                <div className="alim-chart-card">
                    <div className="alim-chart-header">
                        <h2>Estado de los reportes</h2>
                        <p>
                            Distribución de los reportes según su estado.
                        </p>
                    </div>

                    <div className="alim-chart-empty">
                        Sin información disponible
                    </div>
                </div>
            </section>


            <section className="alim-recent-card">
                <div className="alim-recent-header">
                    <div>
                        <h2>Reportes recién asignados</h2>
                        <p>
                            Reportes asignados recientemente para seguimiento.
                        </p>
                    </div>
                </div>

                <div className="alim-table-wrapper">
                    <table className="alim-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Categoría</th>
                                <th>Localidad</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td colSpan="5">
                                    <div className="alim-table-empty">
                                        Sin reportes disponibles
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

export default InicioAlim;