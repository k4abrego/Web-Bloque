
/**
 * @file configuracionAdmin.jsx
 * @description Consulta el perfil del administrador autenticado.
 *
 * Obtiene los datos reales desde auth-backend.
 * Evita actualizaciones síncronas de estado dentro de useEffect.
 */

import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
} from "lucide-react";

import { authApiFetch } from "../../services/api";
import "../alimentador/configuracionAlim.css";

/**
 * Devuelve un texto alternativo para campos vacíos.
 *
 * @param {unknown} valor - Valor recibido.
 * @returns {string} Valor legible.
 */
function mostrar(valor) {
  if (valor == null || String(valor).trim() === "") {
    return "—";
  }

  return String(valor);
}

/**
 * ConfiguracionAdmin
 *
 * Muestra la información del administrador obtenida
 * desde el servicio de autenticación de SIPINNA.
 *
 * @returns {import("react").JSX.Element}
 */
export default function ConfiguracionAdmin() {
  const correo =
    localStorage.getItem("correo")?.trim() || "";

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(
    Boolean(correo)
  );
  const [error, setError] = useState("");

  /**
   * Consulta los datos del perfil únicamente
   * cuando hay un correo registrado en la sesión.
   */
  useEffect(() => {
    if (!correo) {
      return;
    }

    let vigente = true;

    authApiFetch(
      `/user/${encodeURIComponent(correo)}`
    )
      .then((datos) => {
        if (!vigente) return;

        setPerfil(datos);
        setError("");
      })
      .catch((err) => {
        if (!vigente) return;

        setError(
          err.message ||
            "No fue posible consultar tu perfil."
        );
      })
      .finally(() => {
        if (vigente) {
          setCargando(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [correo]);

  const errorVisible = !correo
    ? "No se encontró el correo de la sesión. Vuelve a iniciar sesión."
    : error;

  const nombreCompleto = [
    perfil?.name,
    perfil?.surname,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="config-alim">
      <div className="config-alim-header">
        <h1>Configuración</h1>
        <p>
          Consulta los datos registrados de tu cuenta
          administrativa.
        </p>
      </div>

      <section className="config-alim-section">
        <div className="config-alim-section-header">
          <div className="config-alim-section-icon">
            <User size={21} />
          </div>

          <div>
            <h2>Mi perfil</h2>
            <p>
              Información consultada desde el servicio
              de autenticación.
            </p>
          </div>
        </div>

        {cargando && (
          <p role="status">
            Cargando tu perfil...
          </p>
        )}

        {errorVisible && (
          <p
            role="alert"
            className="config-alim-error"
          >
            {errorVisible}
          </p>
        )}

        {!cargando && !errorVisible && (
          <div className="config-alim-data-grid">
            <div className="config-alim-data-item">
              <span>Nombre completo</span>
              <strong>
                {mostrar(nombreCompleto)}
              </strong>
            </div>

            <div className="config-alim-data-item">
              <span>Correo</span>
              <strong>{mostrar(correo)}</strong>
            </div>

            <div className="config-alim-data-item">
              <span>
                <ShieldCheck size={15} /> Rol
              </span>
              <strong>Administrador</strong>
            </div>

            <div className="config-alim-data-item">
              <span>
                <Building2 size={15} /> Institución
              </span>
              <strong>
                {mostrar(perfil?.organizacion)}
              </strong>
            </div>

            <div className="config-alim-data-item">
              <span>
                <MapPin size={15} /> Municipio
              </span>
              <strong>
                {mostrar(perfil?.municipio)}
              </strong>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
