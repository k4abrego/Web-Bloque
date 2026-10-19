import { useEffect, useState } from "react";
import { authApiFetch } from "../../services/api";
import "./perfilAlim.css";

/**
 * Convierte un valor opcional en texto visible.
 *
 * @param {string|null|undefined} valor - Dato recibido del backend.
 * @returns {string} Valor o texto alternativo.
 */
function mostrarDato(valor) {
  if (valor == null || String(valor).trim() === "") {
    return "No disponible";
  }

  return String(valor);
}

/**
 * PerfilAlim
 *
 * Muestra la información personal real del usuario autenticado.
 * Los datos se consultan mediante GET /user/:email.
 *
 * @returns {import("react").JSX.Element}
 */
function PerfilAlim() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const correo = localStorage.getItem("correo")?.trim() || "";

  /**
   * Consulta los datos personales al abrir la pantalla.
   */
  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      if (!correo) {
        setError(
          "No se encontró el correo de la sesión. Cierra sesión e inicia nuevamente."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const datos = await authApiFetch(
          `/user/${encodeURIComponent(correo)}`
        );

        if (activo) {
          setPerfil(datos);
        }
      } catch (err) {
        if (activo) {
          setError(
            err.message || "No fue posible consultar tu perfil."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [correo]);

  return (
    <div className="perfil-alim">
      <div className="perfil-alim-header">
        <h1>Mi perfil</h1>
        <p>
          Consulta tu información personal y actividad dentro del
          sistema.
        </p>
      </div>

      {cargando && (
        <p role="status">Cargando información del perfil...</p>
      )}

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <div className="perfil-alim-grid">
        <section className="perfil-card">
          <div className="perfil-card-header">
            <h2>Información personal</h2>
            <p>Datos asociados a tu cuenta.</p>
          </div>

          <div className="perfil-fields">
            <div className="perfil-field">
              <label>Nombre</label>
              <div className="perfil-input-empty perfil-valor">
                {mostrarDato(perfil?.name)}
              </div>
            </div>

            <div className="perfil-field">
              <label>Apellidos</label>
              <div className="perfil-input-empty perfil-valor">
                {mostrarDato(perfil?.surname)}
              </div>
            </div>

            <div className="perfil-field">
              <label>Correo electrónico</label>
              <div className="perfil-input-empty perfil-valor">
                {mostrarDato(correo)}
              </div>
            </div>

            <div className="perfil-field">
              <label>Teléfono</label>
              <div className="perfil-input-empty perfil-valor">
                {mostrarDato(perfil?.phone_number)}
              </div>
            </div>

            <div className="perfil-field">
              <label>Cargo</label>
              <div className="perfil-input-empty perfil-valor">
                No disponible
              </div>
            </div>

            <div className="perfil-field">
              <label>Municipio asignado</label>
              <div className="perfil-input-empty perfil-valor">
                No disponible
              </div>
            </div>
          </div>
        </section>

        <section className="perfil-card">
          <div className="perfil-card-header">
            <h2>Mi actividad</h2>
            <p>Resumen de tu actividad</p>
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
            <p>Administra la seguridad de tu cuenta.</p>
          </div>

          <div className="perfil-security-content">
            <div>
              <strong>Solicitar cambio de contraseña</strong>
              <p>
                La solicitud de cambio de contraseña todavía
                no está habilitada.
              </p>
            </div>

            <button
              className="perfil-security-button"
              type="button"
              disabled
              title="Función pendiente de implementación"
            >
              Solicitar cambio
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PerfilAlim;