import "./reportesAlim.css";

function ReportesAlim() {
    return (
        <div className="reportes-alim">

            <div className="reportes-alim-header">
                <div>
                    <h1>Reportes asignados</h1>
                    <p>
                        Consulta y da seguimiento a los reportes asignados
                        a tu municipio.
                    </p>
                </div>

                <div className="reportes-alim-actions">
                    <button className="reportes-button">
                        Filtros
                    </button>

                    <button className="reportes-button">
                        Exportar
                    </button>
                </div>
            </div>

            <div className="reportes-tabs">
                <button className="reportes-tab active">
                    Todos
                </button>

                <button className="reportes-tab">
                    Pendientes de revisión
                </button>

                <button className="reportes-tab">
                    En proceso
                </button>
            </div>

            <div className="reportes-table-card">
                <table className="reportes-table">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Fecha</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Colonia / Localidad</th>
                            <th>Estado</th>
                            <th>Prioridad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="8">
                                <div className="reportes-empty">
                                    <div className="reportes-empty-icon">
                                        —
                                    </div>
                                    <strong> No hay reportes para mostrar</strong>
                                    <span>
                                        Los reportes asignados aparecerán aquí.
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ReportesAlim;