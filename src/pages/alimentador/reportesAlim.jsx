import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Filter,
    Download,
    Eye,
    ChevronDown,
    X,
    Search,
} from "lucide-react";

import "./reportesAlim.css";

function ReportesAlim() {
    const navigate = useNavigate();
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [estadoActivo, setEstadoActivo] = useState("Todos");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [localidadFiltro, setLocalidadFiltro] = useState("");
    const [busqueda, setBusqueda] = useState("");

    /*
    datos del backend pot GET /reportes
    estructura:
    {
       folio,
       fecha,
       categoria,
       descripcion,
       localidad,
       estado,
       prioridad
     }

     */
    const reportes = [];

    // const [reportes, setReportes] = useState([]); con los enpoints 

//     useEffect(() => {
//     // aquí irá la llamada al backend
// }, []);

    const reportesFiltrados = useMemo(() => {
        return reportes.filter((reporte) => {
            const coincideBusqueda =
                !busqueda ||
                String(reporte.folio ?? "")
                    .toLowerCase()
                    .includes(busqueda.toLowerCase());

            const coincideEstado =
                !estadoFiltro || reporte.estado === estadoFiltro;

            const coincideLocalidad =
                !localidadFiltro ||
                reporte.localidad === localidadFiltro;

            const coincideTab =
                estadoActivo === "Todos" ||
                reporte.estado === estadoActivo;

            return (
                coincideBusqueda &&
                coincideEstado &&
                coincideLocalidad &&
                coincideTab
            );
        });
    }, [
        reportes,
        busqueda,
        estadoFiltro,
        localidadFiltro,
        estadoActivo,
    ]);

    const limpiarFiltros = () => {
        setEstadoFiltro("");
        setLocalidadFiltro("");
        setBusqueda("");
        setEstadoActivo("Todos");
    };

    const verReporte = (folio) => {
        navigate(`/alimentador/reportes/${folio}`);
    };

    return (
        <div className="reportes-alim">

            <div className="reportes-alim-header">
                <div className="reportes-alim-title">
                    <h1>Reportes asignados</h1>
                    <p>
                        Consulta y da seguimiento a los reportes asignados
                        a tu municipio.
                    </p>
                </div>

                <div className="reportes-alim-actions">
                    <button
                        type="button"
                        className={`reportes-button ${
                            filtrosAbiertos ? "active" : ""
                        }`}
                        onClick={() =>
                            setFiltrosAbiertos(!filtrosAbiertos)
                        }
                    >
                        <Filter size={17} />
                        Filtros
                        <ChevronDown
                            size={16}
                            className={
                                filtrosAbiertos
                                    ? "rotate"
                                    : ""
                            }
                        />
                    </button>

                    <button
                        type="button"
                        className="reportes-button"
                        disabled
                        title="Disponible cuando se conecte el backend"
                    >
                        <Download size={17} />
                        Exportar
                    </button>

                </div>
            </div>

            {filtrosAbiertos && (
                <div className="reportes-filters">
                    <div className="reportes-filter-header">
                        <div>
                            <h3>Filtrar reportes</h3>
                            <p>
                                Utiliza los filtros para encontrar un
                                reporte específico.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="reportes-filter-close"
                            onClick={() =>
                                setFiltrosAbiertos(false)
                            }
                            aria-label="Cerrar filtros"
                        >
                            <X size={18} />
                        </button>
                    </div>


                    <div className="reportes-filter-grid">
                        <div className="reportes-filter-field">
                            <label htmlFor="buscar-folio">
                                Buscar por folio
                            </label>

                            <div className="reportes-input-wrapper">
                                <Search size={17} />

                                <input
                                    id="buscar-folio"
                                    type="text"
                                    placeholder="Ej. REP-1234"
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                />
                            </div>
                        </div>


                        <div className="reportes-filter-field">
                            <label htmlFor="estado-filtro">
                                Estado del reporte
                            </label>

                            <select
                                id="estado-filtro"
                                value={estadoFiltro}
                                onChange={(e) =>
                                    setEstadoFiltro(e.target.value)
                                }
                            >
                                <option value="">
                                    Todos los estados
                                </option>
                                <option value="Pendiente">
                                    Pendiente
                                </option>
                                <option value="En proceso">
                                    En proceso
                                </option>
                                <option value="Atendido">
                                    Atendido
                                </option>
                            </select>
                        </div>


                        <div className="reportes-filter-field">
                            <label htmlFor="localidad-filtro">
                                Localidad
                            </label>

                            <select
                                id="localidad-filtro"
                                value={localidadFiltro}
                                onChange={(e) =>
                                    setLocalidadFiltro(e.target.value)
                                }
                            >
                                <option value="">
                                    Todas las localidades
                                </option>
                                <option value="Localidad 1">
                                    Localidad flop
                                </option>
                                <option value="Localidad 2">
                                    Localidad pro
                                </option>
                            </select>
                        </div>
                    </div>


                    <div className="reportes-filter-footer">
                        <button
                            type="button"
                            className="reportes-clear-button"
                            onClick={limpiarFiltros}
                        >
                            Limpiar filtros
                        </button>
                    </div>

                </div>
            )}

            <div className="reportes-tabs">
                <button
                    type="button"
                    className={`reportes-tab ${
                        estadoActivo === "Todos"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setEstadoActivo("Todos")
                    }
                >
                    Todos
                </button>

                <button
                    type="button"
                    className={`reportes-tab ${
                        estadoActivo === "Pendiente"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setEstadoActivo("Pendiente")
                    }
                >
                    Pendientes de revisión
                </button>

                <button
                    type="button"
                    className={`reportes-tab ${
                        estadoActivo === "En proceso"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setEstadoActivo("En proceso")
                    }
                >
                    En proceso
                </button>
            </div>

            <div className="reportes-table-card">
                <div className="reportes-table-wrapper">
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
                            {reportesFiltrados.length > 0 ? (
                                reportesFiltrados.map((reporte) => (
                                    <tr key={reporte.folio}>
                                        <td className="reportes-folio">
                                            {reporte.folio}
                                        </td>

                                        <td>
                                            {reporte.fecha}
                                        </td>

                                        <td>
                                            {reporte.categoria}
                                        </td>

                                        <td className="reportes-description">
                                            {reporte.descripcion}
                                        </td>

                                        <td>
                                            {reporte.localidad}
                                        </td>

                                        <td>
                                            <span
                                                className={`reportes-status status-${String(
                                                    reporte.estado ?? ""
                                                )
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`}
                                            >
                                                {reporte.estado}
                                            </span>
                                        </td>

                                        <td>
                                            {reporte.prioridad}
                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                className="reportes-view-button"
                                                onClick={() =>
                                                    verReporte(
                                                        reporte.folio
                                                    )
                                                }
                                                title="Ver reporte"
                                            >
                                                <Eye size={17} />
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))

                            ) : (

                                <tr>
                                    <td colSpan="8">
                                        <div className="reportes-empty">
                                            <div className="reportes-empty-icon">
                                                <Search size={24} />
                                            </div>

                                            <strong>
                                                No hay reportes para mostrar
                                            </strong>

                                            <span>
                                                Los reportes asignados
                                                aparecerán aquí.
                                            </span>

                                        </div>
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>
                </div>

            </div>

        </div>
    );
}

export default ReportesAlim;