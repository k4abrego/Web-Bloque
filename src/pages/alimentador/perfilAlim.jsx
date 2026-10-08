import "./perfilAlim.css";

function PerfilAlim() {
    return (
        <div className="perfil-alim">
            <div className="perfil-alim-header">
                <h1>Mi perfil</h1>
                <p>
                    Consulta tu información personal y actividad
                    dentro del sistema.
                </p>
            </div>


            <div className="perfil-alim-grid">
                <section className="perfil-card">
                    <div className="perfil-card-header">
                        <h2>Información personal</h2>
                        <p>
                            Datos asociados a tu cuenta.
                        </p>
                    </div>

                    <div className="perfil-fields">
                        <div className="perfil-field">
                            <label>Nombre</label>
                            <div className="perfil-input-empty" />
                        </div>

                        <div className="perfil-field">
                            <label>Apellidos</label>
                            <div className="perfil-input-empty" />
                        </div>

                        <div className="perfil-field">
                            <label>Correo electrónico</label>
                            <div className="perfil-input-empty" />
                        </div>

                        <div className="perfil-field">
                            <label>Teléfono</label>
                            <div className="perfil-input-empty" />
                        </div>

                        <div className="perfil-field">
                            <label>Cargo</label>
                            <div className="perfil-input-empty" />
                        </div>

                        <div className="perfil-field">
                            <label>Municipio asignado</label>
                            <div className="perfil-input-empty" />
                        </div>
                    </div>
                </section>
                
                <section className="perfil-card">
                    <div className="perfil-card-header">
                        <h2>Mi actividad</h2>
                        <p>
                            Resumen de tu actividad
                        </p>
                    </div>

                    <div className="perfil-activity">
                        <div className="perfil-activity-item">
                            <span>Reportes asignados</span>
                            <strong>—</strong>
                        </div>

                        <div className="perfil-activity-item">
                            <span>Reportes en proceso</span>
                            <strong>—</strong>
                        </div>

                        <div className="perfil-activity-item">
                            <span>Reportes atendidos</span>
                            <strong>—</strong>
                        </div>
                    </div>
                </section>

                <section className="perfil-card perfil-security">
                    <div className="perfil-card-header">
                        <h2>Seguridad</h2>
                        <p>
                            Administra la seguridad de tu cuenta.
                        </p>
                    </div>

                    <div className="perfil-security-content">
                        <div>
                            <strong>
                                Solicitar cambio de contraseña
                            </strong>

                            <p>
                                Envía una solicitud al administrador
                                para realizar un cambio de contraseña.
                            </p>
                        </div>

                        <button className="perfil-security-button">
                            Solicitar cambio
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default PerfilAlim;