import {
    User,
    Activity,
    // LockKeyhole,
    // ChevronRight,
} from "lucide-react";

import "./configuracionAlim.css";

function ConfiguracionAlim() {
    return (
        <div className="config-alim">
            <div className="config-alim-header">
                <h1>Configuración</h1>
                <p>
                    Consulta tu información y administra las opciones
                    de tu cuenta.
                </p>
            </div>

            <section className="config-alim-section">
                <div className="config-alim-section-header">
                    <div className="config-alim-section-icon">
                        <User size={21} />
                    </div>

                    <div>
                        <h2>Mis datos</h2>
                        <p>
                            Información asociada a tu cuenta.
                        </p>
                    </div>
                </div>


                <div className="config-alim-data-grid">
                    <div className="config-alim-data-item">
                        <span>Nombre</span>
                        <strong>—</strong>
                    </div>

                    <div className="config-alim-data-item">
                        <span>Correo electrónico</span>
                        <strong>—</strong>
                    </div>

                    <div className="config-alim-data-item">
                        <span>Rol</span>
                        <strong>Alimentador</strong>
                    </div>

                    <div className="config-alim-data-item">
                        <span>Municipio</span>
                        <strong>—</strong>
                    </div>

                    <div className="config-alim-data-item">
                        <span>Organización</span>
                        <strong>—</strong>
                    </div>

                </div>

            </section>

            <section className="config-alim-section">
                <div className="config-alim-section-header">
                    <div className="config-alim-section-icon">
                        <Activity size={21} />
                    </div>

                    <div>
                        <h2>Mi actividad</h2>
                        <p>
                            Consulta la actividad relacionada con tu cuenta.
                        </p>
                    </div>
                </div>


                <div className="config-alim-activity-empty">
                    <div className="config-alim-empty-icon">
                        <Activity size={23} />
                    </div>

                    <strong>
                        Sin actividad disponible
                    </strong>

                    <span>
                        Tu actividad aparecerá aquí cuando exista
                        información disponible.
                    </span>
                </div>

            </section>

            {/* <section className="config-alim-section">
                <div className="config-alim-section-header">
                    <div className="config-alim-section-icon">
                        <LockKeyhole size={21} />
                    </div>

                    <div>
                        <h2>Seguridad</h2>
                        <p>
                            Administra las opciones de seguridad de tu cuenta.
                        </p>
                    </div>
                </div>


                <div className="config-alim-security-row">
                    <div>
                        <strong>
                            Solicitar cambio de contraseña
                        </strong>
                        <p>
                            Por seguridad, el cambio de contraseña
                            debe solicitarse al administrador.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="config-alim-request-button"
                    >
                        Solicitar
                        <ChevronRight size={17} />
                    </button>
                </div>
            </section> */}

        </div>
    );
}

export default ConfiguracionAlim;